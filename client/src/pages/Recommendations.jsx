import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LEVEL_COLOR = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function Recommendations() {
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const studentId = localStorage.getItem('studentId')

        if (!studentId) {
          navigate('/register')
          return
        }

        const res = await fetch(
          `http://localhost:5000/api/students/recommend/${studentId}`
        )

        const json = await res.json()

        console.log("FRONTEND DATA:", json)

        setData(json)
        setLoading(false)

      } catch (err) {
        console.log(err)
        setError('Failed to load recommendations')
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-700 font-semibold text-lg">
        Loading recommendations...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-700">
            Your Recommendations 🎯
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Hey{" "}
            <span className="font-semibold text-gray-700">
              {data?.student}
            </span>, here are courses picked for you
          </p>
        </div>

        {/* EMPTY STATE */}
        {data?.recommendations?.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No recommendations yet. Try completing the quiz.
          </div>
        )}

        {/* CONTENT */}
        <div className="flex flex-col gap-8">
          {data?.recommendations?.map((rec, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {/* SKILL HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                  {rec.skill}
                </h2>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    LEVEL_COLOR[rec.level] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rec.level}
                </span>
              </div>

              {/* COURSES */}
              <div className="flex flex-col gap-4">
                {rec.courses?.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No courses found for this skill.
                  </p>
                )}

                {rec.courses?.map((course, j) => (
                  <a
                    key={j}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition group"
                  >
                    {/* THUMBNAIL */}
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-36 h-20 object-cover rounded-lg"
                    />

                    {/* TEXT */}
                    <div className="flex flex-col justify-between">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition">
                        {course.title}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        YouTube • Recommended
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-10 w-full border border-blue-700 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  )
}