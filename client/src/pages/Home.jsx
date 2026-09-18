import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pillars = [
  ['01', 'Assess with clarity', 'An evidence-based skills baseline turns interests into a focused learning plan.'],
  ['02', 'Learn with purpose', 'Structured, industry-aligned courses carry visible progress and credit value.'],
  ['03', 'Experience transparently', 'Verified opportunities, milestone tracking, mentor notes, and completion records.'],
];

export default function Home() {
  const { user } = useAuth();
  const workspace = user?.role === 'partner' ? '/partner' : user?.role === 'coordinator' ? '/coordination' : '/dashboard';
  return <>
    <section className="hero-section page-width">
      <div className="hero-copy">
        <p className="eyebrow">Experiential learning, made accountable</p>
        <h1>From potential to<br /><em>proven practice.</em></h1>
        <p className="hero-lede">Prashikshan connects students, learning pathways, industry partners, and academic credits in one transparent career ecosystem.</p>
        <div className="hero-actions">
          <Link className="button button-large" to={user ? workspace : '/register'}>{user ? 'Open my workspace' : 'Start your pathway'}</Link>
          <Link className="text-action" to="/internships">Explore verified opportunities <span>→</span></Link>
        </div>
        <div className="hero-proof"><span><b>Skills</b> assessed</span><span><b>Courses</b> aligned</span><span><b>Internships</b> verified</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a learner pathway">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="path-card path-card-top"><span className="path-icon">01</span><div><small>SKILL BASELINE</small><strong>Assessment complete</strong></div><i>✓</i></div>
        <div className="path-card path-card-middle"><span className="path-icon">02</span><div><small>LEARNING PATH</small><strong>React Application Studio</strong></div><b>4 cr</b></div>
        <div className="path-card path-card-bottom"><span className="path-icon">03</span><div><small>EXPERIENCE</small><strong>Frontend Engineering Intern</strong></div><i>↗</i></div>
        <div className="hero-seal"><span>NEP</span><strong>READY</strong></div>
      </div>
    </section>
    <section className="trust-strip"><div className="page-width"><span>One connected system for</span><b>Students</b><i>•</i><b>Educators</b><i>•</i><b>Industry partners</b></div></section>
    <section className="section page-width">
      <div className="section-intro"><p className="eyebrow">Designed for real outcomes</p><h2>A clear path from classroom to contribution.</h2></div>
      <div className="pillar-grid">{pillars.map(([number, title, text]) => <article className="pillar" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><div className="pillar-line" /></article>)}</div>
    </section>
    <section className="callout page-width"><div><p className="eyebrow">A platform with accountability built in</p><h2>Make every learning experience count.</h2></div><Link className="button button-light" to={user ? workspace : '/register'}>{user ? 'Go to workspace' : 'Create your account'}</Link></section>
  </>;
}
