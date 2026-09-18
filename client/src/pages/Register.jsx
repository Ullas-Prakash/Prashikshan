import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', organization: '', department: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth(); const navigate = useNavigate();
  const update = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      const session = await api('/auth/register', { method: 'POST', body: payload });
      authenticate(session); navigate(session.user.role === 'student' ? '/assessment' : '/partner', { replace: true });
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };
  return <div className="auth-page"><section className="auth-aside"><Link className="brand brand-inverse" to="/"><span className="brand-mark">P</span><span>Prashikshan</span></Link><div><p className="eyebrow eyebrow-light">Start your pathway</p><h1>Learning that leads<br />somewhere real.</h1><p>Build a visible record of skills, credits, and industry experience.</p></div><small>For learners and verified industry partners.</small></section><section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><Link className="mobile-brand brand" to="/"><span className="brand-mark">P</span>Prashikshan</Link><div><p className="eyebrow">Create account</p><h2>Choose your role.</h2><p className="muted">Students can assess and apply. Partners submit opportunities for verification.</p></div>{error && <p className="form-alert">{error}</p>}<div className="role-picker"><button type="button" className={form.role === 'student' ? 'selected' : ''} onClick={() => update('role', 'student')}><b>Student</b><span>Learn, apply and earn credits</span></button><button type="button" className={form.role === 'partner' ? 'selected' : ''} onClick={() => update('role', 'partner')}><b>Industry partner</b><span>Offer supervised internships</span></button></div><div className="field-grid"><label>Full name<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your full name" /></label><label>Email address<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></label></div>{form.role === 'partner' && <label>Organisation<input required value={form.organization} onChange={(event) => update('organization', event.target.value)} placeholder="Organisation name" /></label>}<label>Department or programme <span className="optional">optional</span><input value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="e.g. Computer Science" /></label><div className="field-grid"><label>Password<input type="password" minLength="8" required value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 8 characters" /></label><label>Confirm password<input type="password" minLength="8" required value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repeat password" /></label></div><button className="button button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button><p className="form-footer">Already have an account? <Link to="/login">Sign in</Link></p></form></section></div>;
}
