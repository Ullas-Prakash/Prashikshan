import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold tracking-wide">
        🎓 Prashikshan
      </Link>

      {/* Nav Links */}
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-yellow-300 transition">Home</Link>
        <Link to="/courses" className="hover:text-yellow-300 transition">Courses</Link>
        <Link to="/internships" className="hover:text-yellow-300 transition">Internships</Link>
        <Link to="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link>
      </div>

      {/* Auth Buttons */}
      <div className="flex gap-3">
        <Link
          to="/login"
          className="border border-white px-4 py-1.5 rounded-full hover:bg-white hover:text-blue-700 transition text-sm"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-yellow-400 text-blue-900 px-4 py-1.5 rounded-full font-semibold hover:bg-yellow-300 transition text-sm"
        >
          Register
        </Link>
      </div>
    </nav>
  )
}