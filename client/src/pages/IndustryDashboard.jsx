import { useEffect, useState } from "react";
import API from "../Services/api";
import "./IndustryDashboard.css";

function IndustryDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/api/students")
      .then((res) => setStudents(res.data))
      .catch(() => setError("Failed to load students. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="industry-container">
      <h2>Industry Partner Dashboard</h2>
      <p className="industry-subtitle">Browse registered student profiles</p>

      {loading && <p>Loading students...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && students.length === 0 && (
        <p>No students registered yet.</p>
      )}

      <div className="students-grid">
        {students.map((s) => (
          <div key={s._id} className="student-card">
            <h3>{s.name}</h3>
            <p className="student-email">📧 {s.email}</p>
            <p><span className={`level-tag ${s.level}`}>{s.level}</span></p>
            <div className="skills-list">
              {s.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndustryDashboard;
