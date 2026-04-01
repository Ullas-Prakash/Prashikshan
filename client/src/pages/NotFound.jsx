import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>404 — Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ color: "#4CAF50", fontWeight: "bold" }}>Go Home</Link>
    </div>
  );
}

export default NotFound;
