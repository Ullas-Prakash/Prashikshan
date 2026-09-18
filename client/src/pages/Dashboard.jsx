import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const label = (value) => String(value || '').replaceAll('-', ' ');

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ courses: [], enrollments: [], applications: [], internships: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [courseData, enrollmentData, applicationData, internshipData] = await Promise.all([api('/courses/recommended'), api('/courses/me/enrollments'), api('/internships/applications/mine'), api('/internships/recommended')]);
        if (active) setData({ courses: courseData.courses, enrollments: enrollmentData.enrollments, applications: applicationData.applications, internships: internshipData.internships });
      } catch (requestError) { if (active) setError(requestError.message); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const enroll = async (courseId) => {
    setNotice('');
    try { await api(`/courses/${courseId}/enroll`, { method: 'POST' }); setData((current) => ({ ...current, courses: current.courses.map((course) => course._id === courseId ? { ...course, enrolled: true } : course) })); setNotice('Course added to your learning plan.'); }
    catch (requestError) { setError(requestError.message); }
  };
  const completeCourse = async (id) => {
    try { const { enrollment } = await api(`/courses/enrollments/${id}`, { method: 'PATCH', body: { progress: 100 } }); setData((current) => ({ ...current, enrollments: current.enrollments.map((item) => item._id === id ? enrollment : item) })); setNotice('Course marked complete — its credits are now on your record.'); }
    catch (requestError) { setError(requestError.message); }
  };
  if (loading) return <div className="page-loader">Preparing your learning pathway…</div>;
  const completed = data.enrollments.filter((item) => item.status === 'completed').length;
  return <div className="workspace page-width">
    <section className="workspace-hero"><div><p className="eyebrow">Student workspace</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p>Keep your skills, experience, and academic credit moving in the same direction.</p></div><Link className="button" to="/assessment">Take a skill assessment</Link></section>
    {(error || notice) && <p className={error ? 'form-alert' : 'form-success'}>{error || notice}</p>}
    <div className="metric-grid"><div className="metric-card"><span>Credit balance</span><strong>{user.creditTotal || 0}</strong><small>NEP-aligned credits earned</small></div><div className="metric-card"><span>Active learning</span><strong>{data.enrollments.filter((item) => item.status === 'enrolled').length}</strong><small>{completed} course{completed === 1 ? '' : 's'} completed</small></div><div className="metric-card"><span>Applications</span><strong>{data.applications.length}</strong><small>{data.applications.filter((item) => ['accepted', 'in-progress'].includes(item.status)).length} active opportunity</small></div><div className="metric-card metric-card-accent"><span>Skills profiled</span><strong>{user.skillProfile?.length || 0}</strong><small>Update through an assessment</small></div></div>
    <div className="workspace-layout"><div className="workspace-main">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Your learning plan</p><h2>Recommended next steps</h2></div><Link to="/courses" className="text-action">Browse all <span>→</span></Link></div><div className="course-list">{data.courses.slice(0, 4).map((course) => <article className="course-row" key={course._id}><div className="course-code">{course.code.split('-')[0]}</div><div><span className="tag">{course.level}</span><h3>{course.title}</h3><p>{course.skills.join(' · ')}</p></div><div className="course-meta"><span>{course.hours} hrs</span><b>{course.credits} cr</b></div>{course.enrolled ? <span className="status status-active">Enrolled</span> : <button className="button button-small" onClick={() => enroll(course._id)}>Add course</button>}</article>)}{data.courses.length === 0 && <p className="empty-inline">Complete a skill assessment to unlock a tailored learning plan.</p>}</div></section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Experience record</p><h2>Applications & milestones</h2></div><Link to="/internships" className="text-action">Find opportunities <span>→</span></Link></div>{data.applications.length ? <div className="application-list">{data.applications.map((application) => <article className="application-row" key={application._id}><div><h3>{application.internship?.title}</h3><p>{application.internship?.organization} · Applied {formatDate(application.createdAt)}</p></div><div className="application-status"><span className={`status status-${application.status}`}>{label(application.status)}</span><small>{application.progress}% milestone progress</small></div></article>)}</div> : <div className="empty-state compact"><strong>No applications yet.</strong><p>Explore verified internships matched to your evolving skill profile.</p><Link className="button button-small" to="/internships">Browse internships</Link></div>}</section>
    </div><aside className="workspace-side"><section className="panel"><p className="eyebrow">My skill profile</p><h2>Where you are today</h2>{user.skillProfile?.length ? <div className="skill-stack">{user.skillProfile.map((skill) => <div key={skill.skill}><div><span>{skill.skill}</span><b>{skill.score}%</b></div><div className="progress"><i style={{ width: `${skill.score}%` }} /></div><small>{skill.level}</small></div>)}</div> : <div className="empty-inline">Your profile starts with a quick assessment.</div>}<Link className="button button-outline button-full" to="/assessment">{user.skillProfile?.length ? 'Reassess skills' : 'Start assessment'}</Link></section><section className="panel opportunity-panel"><p className="eyebrow">Matched opportunities</p><h2>Worth a closer look</h2>{data.internships.slice(0, 2).map((item) => <div className="opportunity-mini" key={item._id}><span>{item.matchScore}% match</span><h3>{item.title}</h3><p>{item.organization} · {item.mode}</p></div>)}<Link className="text-action" to="/internships">View all verified roles <span>→</span></Link></section></aside></div>
    <section className="panel progress-panel"><div className="panel-heading"><div><p className="eyebrow">Course activity</p><h2>Continue learning</h2></div></div>{data.enrollments.length ? data.enrollments.map((enrollment) => <div className="enrollment-row" key={enrollment._id}><div><h3>{enrollment.course?.title}</h3><p>{enrollment.course?.code} · {enrollment.course?.credits} credits</p></div><div className="enrollment-progress"><div className="progress"><i style={{ width: `${enrollment.progress}%` }} /></div><small>{enrollment.progress}% complete</small></div>{enrollment.status === 'completed' ? <span className="status status-completed">Completed</span> : <button className="button button-small button-outline" onClick={() => completeCourse(enrollment._id)}>Mark complete</button>}</div>) : <p className="empty-inline">When you add a course, its progress and earned credits will appear here.</p>}</section>
  </div>;
}
