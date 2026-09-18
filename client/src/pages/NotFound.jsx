import { Link } from 'react-router-dom';

export default function NotFound() { return <div className="empty-state page-width not-found"><p className="eyebrow">404</p><h1>This pathway does not exist.</h1><p>Let’s get you back to a useful part of Prashikshan.</p><Link className="button" to="/">Go home</Link></div>; }
