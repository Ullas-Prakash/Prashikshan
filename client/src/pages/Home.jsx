import { Link } from 'react-router-dom'
<<<<<<< HEAD

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      {/* Hero Section */}
=======
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

>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 leading-tight">
          Grow Your Skills. <br /> Land Your Internship.
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mb-8">
          Prashikshan helps students discover the right courses, track their progress,
          and connect with internships that match their skills.
        </p>
        <div className="flex gap-4">
<<<<<<< HEAD
          <Link
            to="/register"
            className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition"
          >
            Get Started Free
          </Link>
          <Link
            to="/courses"
            className="border border-blue-700 text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
          >
=======
          <Link to="/register" className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition">
            Get Started Free
          </Link>
          <Link to="/courses" className="border border-blue-700 text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
            Browse Courses
          </Link>
        </div>
      </section>

<<<<<<< HEAD
      {/* Features Section */}
      <section className="px-8 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Prashikshan?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Skill Assessment</h3>
            <p className="text-gray-600 text-sm">
              Take a quick quiz during onboarding and we'll map your current skill level instantly.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-yellow-600 mb-2">Course Recommendations</h3>
            <p className="text-gray-600 text-sm">
              Get personalized course suggestions from YouTube, Coursera, and more — based on your skills.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Internship Matching</h3>
            <p className="text-gray-600 text-sm">
              Discover internships that match your skills and interests — powered by real industry data.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
        <p className="text-blue-100 mb-8 text-lg">
          Join hundreds of students already building their future with Prashikshan.
        </p>
        <Link
          to="/register"
          className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition text-lg"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-6">
        © 2025 Prashikshan. Built with ❤️ by Team Prashikshan.
      </footer>

=======
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
    </div>
  )
}