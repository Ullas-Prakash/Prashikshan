import { Link } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./Navbar.css";

function Navbar() {
  const { student } = useStudent();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Prashikshan</Link>
      <div className="navbar-links">
        {student ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/internships">Internships</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
