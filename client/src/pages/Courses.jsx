import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const levels = ['all', 'beginner', 'intermediate', 'advanced'];

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]); const [filter, setFilter] = useState('all'); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    api('/courses').then((data) => { if (active) setCourses(data.courses); }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const enroll = async (id) => { setError(''); setNotice(''); try { await api(`/courses/${id}/enroll`, { method: 'POST' }); setNotice('Course added to your learning plan.'); } catch (requestError) { setError(requestError.message); } };
  const shown = courses.filter((course) => filter === 'all' || course.level === filter);
  return <div className="catalogue page-width"><section className="catalogue-heading"><div><p className="eyebrow">Structured learning</p><h1>Courses with a clear<br />career purpose.</h1><p>Build relevant capabilities through guided, credit-bearing learning modules.</p></div><div className="catalogue-note"><b>Every course includes</b><span>Industry-aligned outcomes</span><span>Visible progress tracking</span><span>Academic credit on completion</span></div></section>{(error || notice) && <p className={error ? 'form-alert' : 'form-success'}>{error || notice}</p>}<div className="filter-bar"><span>Filter by level</span>{levels.map((level) => <button key={level} className={filter === level ? 'active' : ''} onClick={() => setFilter(level)}>{level}</button>)}</div>{loading ? <div className="page-loader">Loading courses…</div> : <div className="course-grid">{shown.map((course) => <article className="catalogue-card" key={course._id}><div className="catalogue-card-top"><span className="course-code">{course.code}</span><span className={`level level-${course.level}`}>{course.level}</span></div><h2>{course.title}</h2><p>{course.summary}</p><div className="skill-chips">{course.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="course-card-footer"><div><b>{course.credits} credits</b><small>{course.hours} guided hours</small></div>{user?.role === 'student' ? <button className="button button-small" onClick={() => enroll(course._id)}>Add to plan</button> : <span className="muted">{course.provider}</span>}</div></article>)}</div>}</div>;
}
