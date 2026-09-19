import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(value));

// ─── Resume Match Engine (pure client-side, no extra endpoint needed) ──────
// Tokenises the resume text into skill tokens and scores each internship by
// how many of its required skills appear in the resume blob.
const SKILL_ALIASES = {
  'js': 'javascript', 'node': 'nodejs', 'node.js': 'nodejs',
  'ml': 'machine learning', 'ai': 'artificial intelligence',
  'ts': 'typescript', 'react.js': 'react', 'reactjs': 'react',
  'mongo': 'mongodb', 'postgres': 'postgresql', 'pg': 'postgresql',
  'k8s': 'kubernetes', 'tf': 'tensorflow',
};

function tokeniseResume(text) {
  const lower = text.toLowerCase();
  const tokens = new Set();
  // Grab every 1-3 word sequence so "machine learning" and "node.js" both match
  const words = lower.match(/[\w.#+]+/g) || [];
  words.forEach((w) => {
    const canon = SKILL_ALIASES[w] || w;
    tokens.add(canon);
  });
  // Two-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    tokens.add(SKILL_ALIASES[phrase] || phrase);
  }
  return tokens;
}

function scoreInternship(internship, resumeTokens) {
  if (!resumeTokens.size) return internship.matchScore || 0;
  const skills = (internship.skills || []).map((s) => s.toLowerCase());
  if (!skills.length) return 0;
  const hits = skills.filter((s) => resumeTokens.has(SKILL_ALIASES[s] || s)).length;
  return Math.round((hits / skills.length) * 100);
}

// ─── Gartner quadrant helpers ─────────────────────────────────────────────
const QUADRANT_COLORS = {
  Leaders:      { node: '#165731', bg: '#ebf5e9', text: '#165731' },
  Challengers:  { node: '#2b543d', bg: '#f5f9f6', text: '#2b543d' },
  Visionaries:  { node: '#265d8c', bg: '#f3f8fc', text: '#265d8c' },
  'Niche Players': { node: '#57695c', bg: '#fdfdfb', text: '#57695c' },
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function Internships() {
  const { user } = useAuth();

  const [internships, setInternships]         = useState([]);
  const [partnersQuadrant, setPartnersQuadrant] = useState([]);
  const [activeTab, setActiveTab]             = useState('listings');
  const [hoveredPartner, setHoveredPartner]   = useState(null);

  // Standard filters
  const [query, setQuery] = useState('');
  const [mode, setMode]   = useState('');

  // Resume match state
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [resumeText, setResumeText]           = useState('');
  const [resumeTokens, setResumeTokens]       = useState(new Set());
  const [resumeActive, setResumeActive]       = useState(false);

  // Quadrant partner-click filter
  const [quadrantOrgFilter, setQuadrantOrgFilter] = useState('');

  // Application modal
  const [selected, setSelected] = useState(null);
  const [letter, setLetter]     = useState('');
  const [error, setError]       = useState('');
  const [notice, setNotice]     = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api('/internships'),
      api('/internships/partners/quadrant').catch(() => ({ partners: [] })),
    ]).then(([internshipData, quadrantData]) => {
      if (!active) return;
      setInternships(internshipData.internships || []);
      setPartnersQuadrant(quadrantData.partners || []);
    }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  // ── Apply resume match ────────────────────────────────────────────────────
  const applyResume = () => {
    const tokens = tokeniseResume(resumeText);
    setResumeTokens(tokens);
    setResumeActive(true);
    setShowResumePanel(false);
    // Switch to listings tab so results are visible
    setActiveTab('listings');
    // If a partner was clicked in quadrant, keep it; otherwise clear
  };

  const clearResume = () => {
    setResumeText('');
    setResumeTokens(new Set());
    setResumeActive(false);
  };

  // ── Ranked & filtered internship list ────────────────────────────────────
  const rankedInternships = useMemo(() => {
    return internships
      .map((item) => ({
        ...item,
        resumeScore: scoreInternship(item, resumeTokens),
      }))
      .sort((a, b) =>
        resumeActive ? b.resumeScore - a.resumeScore : 0
      );
  }, [internships, resumeTokens, resumeActive]);

  const shown = rankedInternships.filter((item) => {
    const textMatch = `${item.title} ${item.organization} ${item.skills.join(' ')}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const modeMatch = !mode || item.mode === mode;
    const orgMatch  = !quadrantOrgFilter || item.organization === quadrantOrgFilter;
    return textMatch && modeMatch && orgMatch;
  });

  // ── Fallback demo data for quadrant ──────────────────────────────────────
  const displayPartners = partnersQuadrant.length ? partnersQuadrant : [
    { organization: 'TechCorp India',      x: 88, y: 82, quadrant: 'Leaders',       activeInternships: 4, totalCreditsOffered: 16, totalApplicantsHired: 12, avgStudentGrade: 92 },
    { organization: 'InnoLabs Global',     x: 82, y: 70, quadrant: 'Leaders',       activeInternships: 3, totalCreditsOffered: 14, totalApplicantsHired: 7,  avgStudentGrade: 95 },
    { organization: 'ScaleShift Systems',  x: 42, y: 78, quadrant: 'Challengers',   activeInternships: 5, totalCreditsOffered: 20, totalApplicantsHired: 18, avgStudentGrade: 80 },
    { organization: 'ByteCraft Solutions', x: 55, y: 38, quadrant: 'Niche Players', activeInternships: 2, totalCreditsOffered: 16, totalApplicantsHired: 4,  avgStudentGrade: 85 },
    { organization: 'Prashikshan Demo',    x: 76, y: 42, quadrant: 'Visionaries',   activeInternships: 1, totalCreditsOffered: 4,  totalApplicantsHired: 3,  avgStudentGrade: 88 },
  ];

  const apply = async () => {
    setError(''); setNotice('');
    try {
      await api(`/internships/${selected._id}/apply`, {
        method: 'POST', body: { coverLetter: letter },
      });
      setNotice(`Application sent to ${selected.organization}. You can track it in your workspace.`);
      setSelected(null); setLetter('');
    } catch (e) { setError(e.message); }
  };

  // ── Tab button style helper ───────────────────────────────────────────────
  const tabStyle = (tab) => ({
    padding: '10px 18px', border: 'none', background: 'transparent',
    fontWeight: 800, fontSize: 13, cursor: 'pointer',
    color: activeTab === tab ? '#1c563e' : '#6b7a6e',
    borderBottom: activeTab === tab ? '3px solid #1c563e' : '3px solid transparent',
  });

  // Match score badge colour
  const badgeStyle = (score) => {
    if (score >= 75) return { bg: '#e1f1df', color: '#1f663c' };
    if (score >= 40) return { bg: '#fff0ce', color: '#946914' };
    return { bg: '#f0f0f0', color: '#6b7a6e' };
  };

  return (
    <div className="opportunities page-width">

      {/* ── HEADING ── */}
      <section className="opportunity-heading">
        <div>
          <p className="eyebrow">Verified opportunities & Partner Ratings</p>
          <h1>Real experience.<br />A visible record.</h1>
          <p>Every listing is reviewed before publication, with application status and supervised progress in one place.</p>
        </div>
        <div className="verification-card">
          <span>✓</span>
          <div>
            <b>Prashikshan verified</b>
            <p>Partner and opportunity review completed before students can apply.</p>
          </div>
        </div>
      </section>

      {(error || notice) && (
        <p className={error ? 'form-alert' : 'form-success'}>{error || notice}</p>
      )}

      {/* ── SMART RESUME MATCH BANNER ── */}
      {user?.role === 'student' && (
        <div style={{
          marginBottom: 22, padding: '16px 22px',
          background: resumeActive
            ? 'linear-gradient(135deg, #1c4d37 0%, #296b4e 100%)'
            : 'linear-gradient(135deg, #234b38 0%, #2d6047 100%)',
          borderRadius: 9, color: 'white',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <span style={{
              background: '#dcefa1', color: '#163d2b', padding: '2px 8px', borderRadius: 4,
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', display: 'inline-block', marginBottom: 6,
            }}>Smart Match Engine</span>
            <h3 style={{ margin: '0 0 3px', fontSize: 16, color: 'white',
                         fontFamily: "'Playfair Display', serif" }}>
              {resumeActive
                ? `Resume match active — showing best-fit roles first`
                : 'Match internships to your resume or skill summary'}
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: '#c5ded0' }}>
              {resumeActive
                ? `${shown.length} role${shown.length !== 1 ? 's' : ''} ranked by resume alignment`
                : 'Paste your resume text or list your skills — roles re-rank by fit score instantly.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {resumeActive && (
              <button
                onClick={clearResume}
                style={{
                  padding: '8px 14px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.4)',
                  background: 'transparent', color: 'white', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                }}>
                ✕ Clear match
              </button>
            )}
            <button
              className="button button-light"
              onClick={() => setShowResumePanel((v) => !v)}>
              {showResumePanel ? 'Close' : resumeActive ? 'Edit resume' : '✦ Smart Match via Resume'}
            </button>
          </div>
        </div>
      )}

      {/* ── RESUME INPUT PANEL (expands inline) ── */}
      {showResumePanel && (
        <div style={{
          marginBottom: 22, padding: '22px 24px',
          background: '#f8faf6', border: '1px solid #cce0c4',
          borderRadius: 9, boxShadow: '0 4px 18px rgba(0,0,0,.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Text area */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800,
                              color: '#34463a', marginBottom: 7 }}>
                Paste resume text or skill summary
              </label>
              <textarea
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={`Paste your resume or just list skills, e.g.\n\nPython, Pandas, SQL, Tableau, Power BI\nMachine learning, scikit-learn, TensorFlow\nData analysis, visualization, Excel`}
                style={{ fontSize: 12, lineHeight: 1.6, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  className="button"
                  disabled={!resumeText.trim()}
                  onClick={applyResume}
                  style={{ flex: 1 }}>
                  ✦ Rank internships by match
                </button>
                <button
                  className="button button-outline"
                  onClick={() => setShowResumePanel(false)}>
                  Cancel
                </button>
              </div>
            </div>

            {/* How it works */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 6 }}>How Smart Match works</p>
                <p style={{ fontSize: 12, color: '#607366', lineHeight: 1.7, margin: 0 }}>
                  The engine tokenises your resume into individual skills and two-word phrases,
                  then scores each internship by how many of its required skills appear in your text.
                  Roles are re-ranked from highest to lowest match percentage — no data leaves your browser.
                </p>
              </div>
              <div style={{ padding: '14px', background: 'white',
                            border: '1px solid #d8e8d0', borderRadius: 7 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#2d5240', margin: '0 0 8px' }}>
                  Match score legend
                </p>
                {[
                  { label: '≥ 75% — Strong match',   bg: '#e1f1df', color: '#1f663c' },
                  { label: '40–74% — Partial match', bg: '#fff0ce', color: '#946914' },
                  { label: '< 40% — Low overlap',    bg: '#f0f0f0', color: '#6b7a6e' },
                ].map((tier) => (
                  <div key={tier.label} style={{ display: 'flex', alignItems: 'center',
                                                 gap: 8, marginBottom: 5 }}>
                    <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 9,
                                   fontWeight: 800, background: tier.bg, color: tier.color }}>
                      {tier.label.split('—')[0].trim()}
                    </span>
                    <span style={{ fontSize: 10, color: '#607366' }}>
                      {tier.label.split('—')[1].trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2ebd9',
                    marginBottom: 25, paddingBottom: 2 }}>
        <button style={tabStyle('listings')} onClick={() => { setActiveTab('listings'); setQuadrantOrgFilter(''); }}>
          📋 Verified Opportunities ({shown.length})
        </button>
        <button style={tabStyle('quadrant')} onClick={() => setActiveTab('quadrant')}>
          📊 Partner Ratings — Gartner Quadrant
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: LISTINGS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'listings' && (
        <>
          {/* Active filters bar */}
          {(resumeActive || quadrantOrgFilter) && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center',
                          marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7a6e' }}>Active filters:</span>
              {resumeActive && (
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 10,
                               fontWeight: 800, background: '#e1f1df', color: '#1f663c' }}>
                  ✦ Resume match active
                </span>
              )}
              {quadrantOrgFilter && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5,
                               padding: '3px 10px', borderRadius: 12, fontSize: 10,
                               fontWeight: 800, background: '#dceaf8', color: '#295b91' }}>
                  🏢 {quadrantOrgFilter}
                  <button
                    onClick={() => setQuadrantOrgFilter('')}
                    style={{ border: 'none', background: 'none', cursor: 'pointer',
                             color: '#295b91', fontSize: 12, padding: 0, lineHeight: 1 }}>
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="opportunity-tools">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role, organisation or skill"
            />
            <div className="filter-bar">
              {['', 'remote', 'hybrid', 'onsite'].map((m) => (
                <button key={m || 'all'} className={mode === m ? 'active' : ''}
                        onClick={() => setMode(m)}>
                  {m || 'all modes'}
                </button>
              ))}
            </div>
          </div>

          <div className="internship-grid">
            {shown.map((item) => {
              const bs = resumeActive ? badgeStyle(item.resumeScore) : null;
              return (
                <article className="internship-card" key={item._id}
                         style={{ position: 'relative' }}>
                  <div className="internship-card-top">
                    <span className="verified-badge">Verified</span>
                    <span>{item.mode}</span>
                  </div>

                  {/* Resume match badge — only shown when Smart Match is active */}
                  {resumeActive && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      marginBottom: 6, padding: '3px 9px', borderRadius: 12,
                      background: bs.bg, color: bs.color, fontSize: 9, fontWeight: 800,
                    }}>
                      <span style={{ fontSize: 11 }}>
                        {item.resumeScore >= 75 ? '★' : item.resumeScore >= 40 ? '◐' : '○'}
                      </span>
                      {item.resumeScore}% Resume Match
                    </div>
                  )}

                  <h2>{item.title}</h2>
                  <p className="organisation">{item.organization}</p>
                  <p>{item.description}</p>
                  <div className="skill-chips">
                    {item.skills.map((skill) => {
                      // Highlight skills that matched the resume
                      const matched = resumeActive && resumeTokens.has(
                        SKILL_ALIASES[skill.toLowerCase()] || skill.toLowerCase()
                      );
                      return (
                        <span key={skill} style={matched ? {
                          background: '#c8e8c0', color: '#1a5c30', fontWeight: 800,
                        } : {}}>
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                  <div className="internship-details">
                    <span>{item.location}</span>
                    <span>{item.durationWeeks} weeks</span>
                    <span>{item.credits} credits</span>
                  </div>
                  <div className="internship-footer">
                    <div>
                      <b>{item.stipend ? `₹${item.stipend.toLocaleString('en-IN')}/mo` : 'Unpaid'}</b>
                      <small>Apply by {formatDate(item.deadline)}</small>
                    </div>
                    {user?.role === 'student' ? (
                      <button className="button button-small" onClick={() => setSelected(item)}>
                        Apply
                      </button>
                    ) : user?.role === 'partner' ? (
                      <Link className="button button-small button-outline" to="/partner">Post a role</Link>
                    ) : (
                      <Link className="button button-small button-outline" to="/login">Sign in to apply</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {!shown.length && (
            <div className="empty-state">
              <strong>No verified internships match this search.</strong>
              <p>
                {resumeActive
                  ? 'No roles matched your resume skills. Try editing your resume text or clearing the match filter.'
                  : 'Try a different keyword or mode.'}
              </p>
              {resumeActive && (
                <button className="button button-small" onClick={clearResume}>
                  Clear resume filter
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: GARTNER MAGIC QUADRANT
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'quadrant' && (
        <section className="panel" style={{ padding: 30 }}>
          <div className="panel-heading" style={{ marginBottom: 15 }}>
            <div>
              <p className="eyebrow">Industry Partner Matrix</p>
              <h2>Gartner Magic Quadrant for Internship Providers</h2>
            </div>
            <p style={{ maxWidth: 500, fontSize: 11, color: '#627367', margin: 0 }}>
              Plotting verified partners on <b>Completeness of Vision</b> (Mentorship Feedback %)
              vs <b>Ability to Execute</b> (Opportunity Scale & NEP Credits).{' '}
              <strong style={{ color: '#1c563e' }}>Click any company</strong> to filter its roles.
            </p>
          </div>

          {/* Matrix */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 850, margin: '20px auto' }}>

            {/* Y-axis label */}
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <span style={{ display: 'inline-block', background: '#234b38', color: 'white',
                             padding: '3px 12px', borderRadius: 12, fontSize: 10, fontWeight: 800 }}>
                ▲ Ability to Execute / Opportunity Scale (Y-axis)
              </span>
            </div>

            {/* Plot area */}
            <div style={{
              position: 'relative', width: '100%', height: 500,
              border: '2px solid #234b38', borderRadius: 10,
              background: '#fcfdfe', overflow: 'hidden',
            }}>
              {/* Quadrant backgrounds */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gridTemplateRows: '1fr 1fr', width: '100%', height: '100%' }}>
                {[
                  { label: 'Challengers',   sub: 'High Scale · Rapidly Growing Mentorship',      bg: '#f5f9f6', br: '1px dashed #234b38', bb: '1px dashed #234b38', tc: '#2b543d' },
                  { label: 'Leaders 👑',    sub: 'High Mentorship · High Opportunity Scale',      bg: '#ebf5e9', bb: '1px dashed #234b38', tc: '#165731' },
                  { label: 'Niche Players', sub: 'Focused · Domain-Specific Roles',               bg: '#fdfdfb', br: '1px dashed #234b38', tc: '#57695c' },
                  { label: 'Visionaries',   sub: 'Exceptional Mentorship · Specialised Scale',    bg: '#f3f8fc', tc: '#265d8c' },
                ].map((q) => (
                  <div key={q.label} style={{
                    background: q.bg, padding: 14,
                    borderRight: q.br, borderBottom: q.bb,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: q.tc,
                                   textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {q.label}
                    </span>
                    <small style={{ display: 'block', color: '#68786c',
                                    fontSize: 10, marginTop: 3 }}>{q.sub}</small>
                  </div>
                ))}
              </div>

              {/* Partner nodes */}
              {displayPartners.map((partner, idx) => {
                const leftPct   = Math.max(12, Math.min(86, partner.x));
                const bottomPct = Math.max(12, Math.min(86, partner.y));
                const isHovered = hoveredPartner?.organization === partner.organization;
                const isFiltered = quadrantOrgFilter === partner.organization;
                const qColors   = QUADRANT_COLORS[partner.quadrant] || QUADRANT_COLORS['Niche Players'];

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredPartner(partner)}
                    onMouseLeave={() => setHoveredPartner(null)}
                    onClick={() => {
                      // Toggle: clicking the same org a second time clears the filter
                      const next = isFiltered ? '' : partner.organization;
                      setQuadrantOrgFilter(next);
                      if (next) setActiveTab('listings');
                    }}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`, bottom: `${bottomPct}%`,
                      transform: 'translate(-50%, 50%)',
                      cursor: 'pointer',
                      zIndex: isHovered ? 20 : 10,
                    }}
                  >
                    {/* Node bubble */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 20,
                      background: qColors.node, color: 'white',
                      boxShadow: isHovered || isFiltered
                        ? '0 8px 20px rgba(0,0,0,0.35)'
                        : '0 3px 10px rgba(0,0,0,0.15)',
                      fontSize: 11, fontWeight: 800,
                      border: isFiltered
                        ? '2px solid #d8ee92'
                        : '2px solid rgba(255,255,255,0.6)',
                      transform: (isHovered || isFiltered) ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}>
                      <span>🏢</span>
                      <span>{partner.organization}</span>
                      {isFiltered && <span style={{ fontSize: 9, opacity: 0.8 }}>✓</span>}
                    </div>

                    {/* Hover popover */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute',
                        [bottomPct > 55 ? 'top' : 'bottom']: '115%',
                        left: leftPct > 65 ? 'auto' : '50%',
                        right: leftPct > 65 ? 0 : 'auto',
                        transform: leftPct > 65 ? 'none' : 'translateX(-50%)',
                        width: 245, padding: 14, borderRadius: 8,
                        background: '#1d3b2c', color: 'white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                        zIndex: 30, fontSize: 11, lineHeight: 1.6,
                        pointerEvents: 'none',
                      }}>
                        <strong style={{ display: 'block', fontSize: 13,
                                         color: '#dcf09e', marginBottom: 4 }}>
                          {partner.organization}
                        </strong>
                        <span style={{ display: 'inline-block', padding: '2px 6px',
                                       borderRadius: 4, background: '#36614a',
                                       fontSize: 9, fontWeight: 800,
                                       textTransform: 'uppercase', marginBottom: 8 }}>
                          {partner.quadrant}
                        </span>
                        <div>• Active Roles: {partner.activeInternships}</div>
                        <div>• Credits Offered: {partner.totalCreditsOffered} cr</div>
                        <div>• Applicants Hired: {partner.totalApplicantsHired}</div>
                        <div>• Mentorship Rating: {partner.x}%</div>
                        <div>• Opportunity Score: {partner.y}%</div>
                        <div style={{ marginTop: 8, paddingTop: 8,
                                      borderTop: '1px solid rgba(255,255,255,.15)',
                                      fontSize: 9, color: '#a8c9ae' }}>
                          Click to filter listings by this company →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>{/* end plot area */}

            {/* X-axis label */}
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <span style={{ display: 'inline-block', background: '#234b38', color: 'white',
                             padding: '3px 12px', borderRadius: 12, fontSize: 10, fontWeight: 800 }}>
                Completeness of Vision / Mentorship Rating (X-axis) ▶
              </span>
            </div>
          </div>{/* end matrix wrapper */}

          {/* Quadrant legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10,
                        justifyContent: 'center', marginTop: 18 }}>
            {Object.entries(QUADRANT_COLORS).map(([name, c]) => (
              <span key={name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 20,
                background: c.bg, color: c.text, fontSize: 10, fontWeight: 800,
                border: `1px solid ${c.node}30`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                               background: c.node, display: 'inline-block' }} />
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── APPLICATION MODAL ── */}
      {selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="apply-title">
          <section className="modal">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <p className="eyebrow">Application</p>
            <h2 id="apply-title">{selected.title}</h2>
            <p className="muted">
              {selected.organization} · {selected.credits} academic credits on verified completion.
            </p>
            {/* Resume match context reminder */}
            {resumeActive && selected.resumeScore !== undefined && (
              <div style={{
                padding: '8px 12px', marginBottom: 16, borderRadius: 6,
                background: badgeStyle(selected.resumeScore).bg,
                color: badgeStyle(selected.resumeScore).color,
                fontSize: 11, fontWeight: 700,
              }}>
                {selected.resumeScore}% resume match — your skills align with{' '}
                {selected.skills.filter((s) =>
                  resumeTokens.has(SKILL_ALIASES[s.toLowerCase()] || s.toLowerCase())
                ).join(', ') || 'some of the requirements'}.
              </div>
            )}
            <label>
              Why are you a strong fit? <span className="optional">optional</span>
              <textarea
                maxLength={1800}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="Briefly describe relevant skills, work, or motivation."
              />
            </label>
            <button className="button button-full" onClick={apply}>Submit application</button>
          </section>
        </div>
      )}
    </div>
  );
}
