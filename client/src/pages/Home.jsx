import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to Prashikshan</h1>
        <p>Your platform for skill-based learning, courses, and internship opportunities.</p>
        <div className="home-actions">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
