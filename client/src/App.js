import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Internships from "./pages/Internships";
import IndustryDashboard from "./pages/IndustryDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/industry-dashboard" element={<IndustryDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;