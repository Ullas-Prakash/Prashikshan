import { Link } from 'react-router-dom'
import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
      fetch("http://localhost:5000/")
          .then(res => res.text())
          .then(data => console.log(data))
          .catch(err => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 leading-tight">
          Grow Your Skills. <br /> Land Your Internship.
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mb-8">
          Prashikshan helps students discover the right courses, track their progress,
          and connect with internships that match their skills.
        </p>
        <div className="flex gap-4">
          <Link to="/register" className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition">
            Get Started Free
          </Link>
          <Link to="/courses" className="border border-blue-700 text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
            Browse Courses
          </Link>
        </div>
      </section>

    </div>
  )
}