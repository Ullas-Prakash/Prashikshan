import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];

// ─── Helpers ──────────────────────────────────────────────────────────────
const levelColor = (lvl) =>
  lvl === 'advanced' || lvl === 'legend'
    ? { bg: '#e1f1df', color: '#1f663c' }
    : lvl === 'intermediate'
    ? { bg: '#dceaf8', color: '#295b91' }
    : { bg: '#fff0ce', color: '#946914' };

function Tick({ done, pct }) {
  // Shows a percentage ring while in progress, solid tick when done
  if (done) {
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:22, height:22, borderRadius:'50%', flexShrink:0,
        background:'#1c563e', border:'2px solid #1c563e',
      }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  if (pct > 0) {
    // Partial ring — SVG circle with stroke-dasharray
    const r = 8, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink:0 }}>
        <circle cx="11" cy="11" r={r} fill="none" stroke="#d8e8d0" strokeWidth="2.5"/>
        <circle cx="11" cy="11" r={r} fill="none" stroke="#4d8b52" strokeWidth="2.5"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"/>
        <text x="11" y="15" textAnchor="middle" fontSize="6" fill="#3a6040"
              fontWeight="bold">{Math.round(pct)}%</text>
      </svg>
    );
  }
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:22, height:22, borderRadius:'50%', flexShrink:0,
      background:'transparent', border:'2px solid #c5d3c1',
    }}/>
  );
}

// ─── YouTube IFrame API loader ─────────────────────────────────────────────
// Loads the YT IFrame API script once per page lifecycle.
function loadYTScript() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve) => {
    if (document.getElementById('yt-iframe-api')) {
      // Script tag already inserted — wait for it
      const wait = setInterval(() => {
        if (window.YT && window.YT.Player) { clearInterval(wait); resolve(); }
      }, 100);
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve();
    const tag = document.createElement('script');
    tag.id  = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  });
}

// ─── Learning Player Modal ─────────────────────────────────────────────────
function LearningPlayer({ course, enrollment, onClose, onProgressUpdate }) {
  const enrollmentId = enrollment?._id;

  const [videos, setVideos]         = useState([]);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [loadingVids, setLoadingVids] = useState(true);
  const [notice, setNotice]         = useState('');
  const [completing, setCompleting] = useState(false);
  const [certResult, setCertResult] = useState(null);

  // watchedVideos from DB is the canonical source (no localStorage trust)
  const [watchedIds, setWatchedIds] = useState(
    () => new Set((enrollment?.watchedVideos || []).map((w) => w.videoId))
  );
  // Per-video watch-percentage tracked locally by the YT player
  const [watchPct, setWatchPct]   = useState({});

  const playerRef    = useRef(null);  // YT.Player instance
  const playerDivId  = 'yt-player-div';
  const pollRef      = useRef(null);  // setInterval handle
  const reportedRef  = useRef(new Set()); // videoIds already reported this session

  // ── Fetch video list ────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingVids(true);
    api(`/courses/${course._id}/videos`)
      .then((d) => setVideos(d.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoadingVids(false));
  }, [course._id]);

  // ── Build/rebuild YT.Player when active video changes ──────────────────
  const buildPlayer = useCallback((video) => {
    if (!video) return;

    // Tear down previous player + poll loop
    if (pollRef.current) clearInterval(pollRef.current);
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    loadYTScript().then(() => {
      if (!document.getElementById(playerDivId)) return;

      playerRef.current = new window.YT.Player(playerDivId, {
        videoId: video.videoId,
        playerVars: {
          rel: 0, modestbranding: 1, enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady() { startPolling(video); },
          onStateChange(e) {
            // YT.PlayerState.PLAYING = 1
            if (e.data === 1) startPolling(video);
            else stopPolling();
          },
          onError() { stopPolling(); },
        },
      });
    });
  }, []); // eslint-disable-line

  function startPolling(video) {
    stopPolling();
    pollRef.current = setInterval(() => tickPoll(video), 2000);
  }
  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  // Called every 2 s while the video is playing
  function tickPoll(video) {
    const p = playerRef.current;
    if (!p || typeof p.getCurrentTime !== 'function') return;

    const current  = p.getCurrentTime();
    const duration = p.getDuration();
    if (!duration || duration <= 0) return;

    const pct = (current / duration) * 100;
    setWatchPct((prev) => ({ ...prev, [video.videoId]: Math.min(pct, 100) }));

    // ≥90% threshold — report to backend once per session
    if (pct >= 90 && !reportedRef.current.has(video.videoId) && !watchedIds.has(video.videoId)) {
      reportedRef.current.add(video.videoId); // optimistic dedup
      stopPolling();
      reportWatched(video, Math.round(current));
    }
  }

  async function reportWatched(video, watchTimeSeconds) {
    if (!enrollmentId) return;
    try {
      const resp = await api(`/courses/enrollments/${enrollmentId}/track-video`, {
        method: 'POST',
        body:   { videoId: video.videoId, watchTimeSeconds },
      });

      setWatchedIds((prev) => new Set([...prev, video.videoId]));
      onProgressUpdate(enrollmentId, resp.progress);

      if (resp.completed) {
        setCompleting(true);
        setCertResult(resp);
        setNotice('');
      } else {
        setNotice(`Module "${video.topic}" marked complete. ${resp.watchedCount}/${resp.totalVideos} done.`);
      }
    } catch (e) {
      // Non-fatal: remove from dedup set so player will retry on next poll start
      reportedRef.current.delete(video.videoId);
      console.warn('[Player] track-video error:', e.message);
    }
  }

  // Rebuild player when active video changes
  useEffect(() => {
    if (!loadingVids && videos.length) {
      buildPlayer(videos[activeIdx]);
    }
    return () => { stopPolling(); };
  }, [activeIdx, loadingVids, videos, buildPlayer]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} }
    };
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const totalVideos  = videos.length;
  const watchedCount = watchedIds.size;
  const progress     = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
  const activeVideo  = videos[activeIdx];
  const lc           = levelColor(course.level);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true"
         aria-label={`Learning: ${course.title}`}>
      <div style={{
        position:'relative', width:'min(100%, 1020px)', maxHeight:'94vh',
        background:'#fdfefb', borderRadius:10,
        boxShadow:'0 30px 80px rgba(7,24,14,.32)',
        overflow:'hidden', display:'flex', flexDirection:'column',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 22px', borderBottom:'1px solid #e2ebe0',
          background:'#f8faf6', flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            <div className="course-code" style={{ width:44, height:44, fontSize:'10px' }}>
              {course.code.split('-')[0]}
            </div>
            <div style={{ minWidth:0 }}>
              <p className="eyebrow" style={{ marginBottom:2 }}>Interactive Learning Player</p>
              <h2 style={{
                margin:0, fontSize:17, color:'#1b3828',
                fontFamily:"'Playfair Display', serif",
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>
                {course.title}
              </h2>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <span style={{
              padding:'3px 8px', borderRadius:12, fontSize:9, fontWeight:800,
              background:lc.bg, color:lc.color, textTransform:'capitalize',
            }}>{course.level}</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#387352' }}>
              {watchedCount}/{totalVideos} modules
            </span>
            <button className="modal-close" onClick={onClose}
                    aria-label="Close player" style={{ position:'static', fontSize:22 }}>×</button>
          </div>
        </div>

        {/* ── OVERALL PROGRESS BAR ── */}
        <div style={{ height:4, background:'#e8eee7', flexShrink:0 }}>
          <div style={{
            height:'100%', width:`${progress}%`,
            background: progress === 100 ? '#2b7550' : '#6ea65b',
            transition:'width .4s ease',
          }}/>
        </div>

        {/* ── COMPLETION BANNER ── */}
        {completing && certResult && (
          <div style={{
            padding:'14px 22px', background:'linear-gradient(135deg,#1c4d37,#2d6a4f)',
            color:'white', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:10,
          }}>
            <div>
              <strong style={{ fontSize:14 }}>🎓 Course Completed — Certificate Issued!</strong>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'#c5ded0' }}>
                Certificate ID: <code style={{ background:'rgba(255,255,255,.15)', padding:'1px 6px',
                                               borderRadius:4 }}>{certResult.certificateId}</code>
                {' '}· +{certResult.creditAwarded} NEP credits awarded.
              </p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {certResult.pdfUrl && (
                <a href={certResult.pdfUrl} target="_blank" rel="noopener noreferrer"
                   className="button button-light" style={{ fontSize:11 }}>
                  ↓ Download Certificate
                </a>
              )}
              <Link to={`/verify/${certResult.certificateId}`} target="_blank"
                    className="button button-light" style={{ fontSize:11 }}>
                🔍 Verify
              </Link>
            </div>
          </div>
        )}

        {/* ── BODY ── */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 310px',
          flex:1, overflow:'hidden',
        }}>
          {/* LEFT — Video player area */}
          <div style={{
            display:'flex', flexDirection:'column',
            padding:'18px 18px 14px', overflow:'auto',
          }}>
            {/* Player container — YT IFrame API replaces this div */}
            {loadingVids ? (
              <div style={{
                aspectRatio:'16/9', background:'#e8f0e4', borderRadius:8,
                display:'grid', placeItems:'center', color:'#6a7d6e',
                fontSize:13, fontWeight:700,
              }}>Loading modules…</div>
            ) : activeVideo ? (
              <div style={{
                position:'relative', paddingBottom:'56.25%',
                height:0, borderRadius:8, overflow:'hidden',
                boxShadow:'0 4px 20px rgba(0,0,0,.12)',
              }}>
                {/* YT IFrame API requires a plain div target — not an iframe element */}
                <div id={playerDivId} style={{
                  position:'absolute', top:0, left:0,
                  width:'100%', height:'100%',
                }}/>
              </div>
            ) : (
              <div style={{
                aspectRatio:'16/9', background:'#e8f0e4', borderRadius:8,
                display:'grid', placeItems:'center', color:'#6a7d6e',
              }}>No videos available for this course.</div>
            )}

            {/* Now-playing info */}
            {activeVideo && (
              <div style={{ marginTop:12 }}>
                <p className="eyebrow" style={{ marginBottom:3 }}>
                  Module {activeVideo.id} · {activeVideo.topic}
                </p>
                <h3 style={{ margin:'0 0 4px', fontSize:14, color:'#1e3829', lineHeight:1.35 }}>
                  {activeVideo.title}
                </h3>
                <small style={{ color:'#7a8a7c', fontSize:10 }}>
                  {activeVideo.channel} · {activeVideo.duration}
                  {activeVideo.durationSeconds > 0 &&
                    ` · Watch ≥90% to mark complete`}
                </small>
              </div>
            )}

            {/* Notice */}
            {notice && (
              <p className="form-success" style={{ margin:'10px 0 0', fontSize:11 }}>{notice}</p>
            )}

            {/* Footer info */}
            <div style={{ marginTop:'auto', paddingTop:14,
                          borderTop:'1px solid #e8ede7', marginTop:14 }}>
              <div style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:6,
              }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#3a5443' }}>
                  Overall completion
                </span>
                <strong style={{ fontSize:13, color:'#254a36' }}>{progress}%</strong>
              </div>
              <div className="progress" style={{ height:8, marginBottom:8 }}>
                <i style={{ width:`${progress}%`,
                            background: progress === 100 ? '#2b7550' : '#6ea65b' }}/>
              </div>
              <p style={{ margin:0, fontSize:10, color:'#8a968c', textAlign:'center' }}>
                {course.credits} NEP credits · {course.hours}h estimated ·{' '}
                {course.provider || 'Prashikshan Learning Hub'}
              </p>
              <p style={{ margin:'4px 0 0', fontSize:9, color:'#a0afa2', textAlign:'center' }}>
                Watch ≥90% of each video — the backend marks it complete automatically.
              </p>
            </div>
          </div>

          {/* RIGHT — Playlist sidebar */}
          <div style={{
            borderLeft:'1px solid #e2ebe0', overflowY:'auto',
            background:'#f8faf6', display:'flex', flexDirection:'column',
          }}>
            <div style={{
              padding:'13px 15px 9px', borderBottom:'1px solid #e2ebe0', flexShrink:0,
            }}>
              <p className="eyebrow" style={{ margin:0 }}>Course Modules</p>
              <small style={{ color:'#7a8a7c', fontSize:10 }}>
                {totalVideos} videos · auto-tracked at ≥90%
              </small>
            </div>

            <div style={{ flex:1, overflowY:'auto' }}>
              {loadingVids ? (
                <div style={{ padding:20, color:'#8a968c', fontSize:12 }}>Loading…</div>
              ) : (
                videos.map((video, idx) => {
                  const isActive = idx === activeIdx;
                  const isDone   = watchedIds.has(video.videoId);
                  const pct      = watchPct[video.videoId] || 0;
                  return (
                    <button
                      key={video.videoId}
                      onClick={() => setActiveIdx(idx)}
                      style={{
                        width:'100%', textAlign:'left', border:'none',
                        cursor:'pointer', padding:'11px 13px',
                        borderBottom:'1px solid #eaf0e7',
                        background: isActive ? '#edf5e9' : 'transparent',
                        transition:'background .15s',
                        display:'flex', gap:9, alignItems:'flex-start',
                      }}>
                      <div style={{ paddingTop:2 }}>
                        <Tick done={isDone} pct={isDone ? 100 : pct} />
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{
                          margin:'0 0 1px', fontSize:11, fontWeight:800,
                          color: isDone ? '#2b7550' : isActive ? '#1c563e' : '#2e4437',
                          overflow:'hidden', textOverflow:'ellipsis',
                          display:'-webkit-box', WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical',
                        }}>
                          {video.id}. {video.title}
                        </p>
                        <span style={{ fontSize:9, color:'#7a8a7c' }}>
                          {video.topic} · {video.duration}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar footer */}
            <div style={{
              padding:'11px 13px', borderTop:'1px solid #e2ebe0',
              flexShrink:0, background:'#f2f7f0',
            }}>
              <div style={{
                display:'flex', justifyContent:'space-between',
                fontSize:10, fontWeight:700, color:'#3a5443', marginBottom:5,
              }}>
                <span>Watched</span>
                <span>{watchedCount} / {totalVideos}</span>
              </div>
              <div className="progress" style={{ height:5, marginBottom:8 }}>
                <i style={{ width:`${progress}%`, background:'#4d8b52' }}/>
              </div>
              {enrollment?.certificateId && !completing && (
                <div style={{ marginTop:6 }}>
                  <Link
                    to={`/verify/${enrollment.certificateId}`}
                    target="_blank"
                    className="button button-small button-outline"
                    style={{ width:'100%', fontSize:10, justifyContent:'center' }}>
                    🔍 View Certificate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Courses Page ─────────────────────────────────────────────────────
export default function Courses() {
  const { user } = useAuth();

  const [courses, setCourses]       = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');

  const [playerCourse, setPlayerCourse]     = useState(null);
  const [playerEnrollment, setPlayerEnrollment] = useState(null);

  // courseId → enrollment object
  const enrollmentMap = new Map(
    enrollments.map((e) => [String(e.course?._id || e.course), e])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseData, enrollData] = await Promise.all([
        api('/courses'),
        user?.role === 'student'
          ? api('/courses/me/enrollments')
          : Promise.resolve({ enrollments: [] }),
      ]);
      setCourses(courseData.courses || []);
      setEnrollments(enrollData.enrollments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  const enroll = async (id, e) => {
    e.stopPropagation();
    setError(''); setNotice('');
    try {
      const { enrollment } = await api(`/courses/${id}/enroll`, { method:'POST' });
      setEnrollments((prev) => [...prev, enrollment]);
      setNotice('Course added to your learning plan.');
    } catch (err) { setError(err.message); }
  };

  const openPlayer = (course) => {
    setPlayerCourse(course);
    setPlayerEnrollment(enrollmentMap.get(String(course._id)) || null);
  };

  const handleProgressUpdate = (enrollId, newProgress) => {
    setEnrollments((prev) =>
      prev.map((e) => String(e._id) === String(enrollId)
        ? { ...e, progress: newProgress } : e)
    );
  };

  const shown = courses.filter((c) => filter === 'all' || c.level === filter);

  return (
    <div className="catalogue page-width">
      <section className="catalogue-heading">
        <div>
          <p className="eyebrow">Structured learning</p>
          <h1>Courses with a clear<br />career purpose.</h1>
          <p>
            Build relevant capabilities through guided, credit-bearing learning modules.
            Click any enrolled course to open the interactive video player.
          </p>
        </div>
        <div className="catalogue-note">
          <b>Every course includes</b>
          <span>7 curated video modules, auto-tracked</span>
          <span>Backend-verified 90% watch-time gate</span>
          <span>Auto-issued PDF certificate on completion</span>
        </div>
      </section>

      {(error || notice) && (
        <p className={error ? 'form-alert' : 'form-success'}>{error || notice}</p>
      )}

      <div className="filter-bar">
        <span>Filter by level</span>
        {LEVELS.map((level) => (
          <button key={level}
                  className={filter === level ? 'active' : ''}
                  onClick={() => setFilter(level)}>
            {level}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader">Loading courses…</div>
      ) : (
        <div className="course-grid">
          {shown.map((course) => {
            const enrollment  = enrollmentMap.get(String(course._id));
            const isEnrolled  = !!enrollment;
            const progress    = enrollment?.progress ?? 0;
            const isCompleted = enrollment?.status === 'completed';
            const certId      = enrollment?.certificateId;
            const lc          = levelColor(course.level);

            return (
              <article
                key={course._id}
                className="catalogue-card"
                style={{ position:'relative', cursor: isEnrolled ? 'pointer' : 'default' }}
                onClick={isEnrolled ? () => openPlayer(course) : undefined}>

                <div className="catalogue-card-top">
                  <span className="course-code">{course.code}</span>
                  <span style={{
                    padding:'3px 7px', borderRadius:12, fontSize:9,
                    fontWeight:800, background:lc.bg, color:lc.color,
                    textTransform:'capitalize',
                  }}>
                    {course.level}
                  </span>
                </div>

                <h2>{course.title}</h2>
                <p>{course.summary}</p>

                <div className="skill-chips">
                  {course.skills.map((s) => <span key={s}>{s}</span>)}
                </div>

                {isEnrolled && (
                  <div style={{ margin:'10px 0 6px' }}>
                    <div style={{
                      display:'flex', justifyContent:'space-between',
                      fontSize:9, fontWeight:700, color:'#3a5443', marginBottom:4,
                    }}>
                      <span>{isCompleted ? '✓ Completed' : 'In progress'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height:5 }}>
                      <i style={{
                        width:`${progress}%`,
                        background: isCompleted ? '#2b7550' : '#6ea65b',
                      }}/>
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', gap:6, flexWrap:'wrap',
                              marginBottom:10, fontSize:10, color:'#587060' }}>
                  <span style={{
                    padding:'2px 6px', background:'#e9f2e5',
                    borderRadius:4, fontWeight:700,
                  }}>▶ 7 video modules</span>
                  {isCompleted && !certId && (
                    <span style={{
                      padding:'2px 6px', background:'#e1f1df',
                      borderRadius:4, fontWeight:700, color:'#1f663c',
                    }}>🎓 Certified</span>
                  )}
                  {certId && (
                    <Link
                      to={`/verify/${certId}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding:'2px 6px', background:'#e1f1df',
                        borderRadius:4, fontWeight:700, color:'#1f663c',
                        fontSize:10, textDecoration:'none',
                      }}>
                      🔍 Verify Certificate
                    </Link>
                  )}
                </div>

                <div className="course-card-footer">
                  <div>
                    <b>{course.credits} credits</b>
                    <small>{course.hours} guided hours</small>
                  </div>
                  {user?.role === 'student' ? (
                    isEnrolled ? (
                      <button
                        className="button button-small"
                        onClick={(e) => { e.stopPropagation(); openPlayer(course); }}>
                        {isCompleted ? '▶ Review' : '▶ Continue'}
                      </button>
                    ) : (
                      <button
                        className="button button-small button-outline"
                        onClick={(e) => enroll(course._id, e)}>
                        Add to plan
                      </button>
                    )
                  ) : (
                    <span className="muted">{course.provider}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {playerCourse && (
        <LearningPlayer
          course={playerCourse}
          enrollment={playerEnrollment}
          onClose={() => {
            setPlayerCourse(null);
            setPlayerEnrollment(null);
            loadData();
          }}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
    </div>
  );
}
