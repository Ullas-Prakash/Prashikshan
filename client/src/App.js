import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StudentContextProvider } from "./context/StudentContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import Internships from "./pages/Internships.jsx";
import IndustryDashboard from "./pages/IndustryDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <StudentContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/industry-dashboard" element={<IndustryDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </StudentContextProvider>
  );
}

export default App;
