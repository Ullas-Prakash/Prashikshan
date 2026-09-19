import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loader">Loading your workspace…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role === 'student' && !user.isAssessed && location.pathname !== '/assessment') {
    return <Navigate to="/assessment" replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AssessmentGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loader">Loading…</div>;
  if (user && user.role === 'student' && !user.isAssessed && location.pathname !== '/assessment') {
    return <Navigate to="/assessment" replace />;
  }
  return children;
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Loading…</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}
