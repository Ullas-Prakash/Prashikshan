import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Courses from '../pages/Courses'
import Internships from '../pages/Internships'
import SkillAssessment from '../pages/SkillAssessment'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/internships" element={<Internships />} />
      <Route path="/skill-assessment" element={<SkillAssessment />} />
    </Routes>
  )
}