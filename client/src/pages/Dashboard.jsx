import { Link } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./Dashboard.css";

function Dashboard() {
  const { student } = useStudent();

  return (
    <div className="dashboard-container">
      <h2>Welcome{student ? `, ${student.name}` : ""}!</h2>
      {student && (
        <p className="dashboard-level">Level: <span>{student.level}</span></p>
      )}
      <div className="dashboard-cards">
        <Link to="/courses" className="dash-card">
          <h3>📚 Courses</h3>
          <p>Browse courses tailored to your skills</p>
        </Link>
        <Link to="/internships" className="dash-card">
          <h3>💼 Internships</h3>
          <p>Explore internship opportunities</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
