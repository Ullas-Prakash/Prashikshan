import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Courses from '../pages/Courses'
import Internships from '../pages/Internships'
import SkillAssessment from '../pages/SkillAssessment'
import Quiz from '../pages/Quiz'

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
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  )
}