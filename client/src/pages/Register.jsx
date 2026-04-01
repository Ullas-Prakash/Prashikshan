import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import API from "../Services/api";
import "./Login.css";

function Register() {
  const [form, setForm] = useState({
    name: "", email: "", skills: "", interests: "", level: "beginner",
  });
  const [error, setError] = useState("");
  const { setStudent } = useStudent();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.skills || !form.interests) {
      setError("All fields are required.");
      return;
    }
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await API.post("/api/students/add", payload);
      setStudent(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Register</h2>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="skills" placeholder="Skills (e.g. React, Node)" value={form.skills} onChange={handleChange} />
          <input name="interests" placeholder="Interests (e.g. Web Dev, AI)" value={form.interests} onChange={handleChange} />
          <select name="level" value={form.level} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
