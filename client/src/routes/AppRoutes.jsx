import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/Guards';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Assessment from '../pages/Assessment';
import Courses from '../pages/Courses';
import Internships from '../pages/Internships';
import PartnerDashboard from '../pages/PartnerDashboard';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';
import CoordinatorSetup from '../pages/CoordinatorSetup';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/coordinator-setup" element={<PublicRoute><CoordinatorSetup /></PublicRoute>} />
    <Route path="/courses" element={<Courses />} />
    <Route path="/internships" element={<Internships />} />
    <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><Dashboard /></ProtectedRoute>} />
    <Route path="/assessment" element={<ProtectedRoute roles={['student']}><Assessment /></ProtectedRoute>} />
    <Route path="/skill-assessment" element={<Navigate to="/assessment" replace />} />
    <Route path="/partner" element={<ProtectedRoute roles={['partner']}><PartnerDashboard /></ProtectedRoute>} />
    <Route path="/coordination" element={<ProtectedRoute roles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
