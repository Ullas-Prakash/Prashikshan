import { useState, useEffect } from 'react'

const SKILLS = ['react', 'javascript', 'python', 'nodejs', 'mongodb', 'ml', 'git', 'sql']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const PLATFORMS = ['youtube', 'pdf']

const platformLabel = { youtube: '▶ YouTube', pdf: '📄 PDFs' }
const levelColor = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}
const platformColor = {
  youtube: 'bg-red-50 text-red-600',
  pdf: 'bg-orange-50 text-orange-600',
}

export default function Courses() {
  const [skillFilter, setSkillFilter] = useState('javascript')
  const [levelFilter, setLevelFilter] = useState('beginner')
  const [platformFilter, setPlatformFilter] = useState('youtube')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/search?skill=${skillFilter}&level=${levelFilter}&platform=${platformFilter}`
      )
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError('Failed to fetch courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [skillFilter, levelFilter, platformFilter])

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">📚 Courses</h1>
          <p className="text-gray-500 mt-1">Browse courses based on your skill, level and platform</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-8">

          {/* Skill Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Skill</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button
                  key={s}
                  onClick={() => setSkillFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition
                    ${skillFilter === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Level</p>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition
                    ${levelFilter === l ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Platform</p>
            <div className="flex gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition
                    ${platformFilter === p ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  {platformLabel[p]}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* State: Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">⏳</div>
            <p>Fetching courses...</p>
          </div>
        )}

        {/* State: Error */}
        {!loading && error && (
          <div className="text-center py-20 text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* State: No results */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm">Try changing your filters</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && courses.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">{courses.length} result{courses.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="flex gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${platformColor[course.platform]}`}>
                      {platformLabel[course.platform]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${levelColor[levelFilter]}`}>
                      {levelFilter}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm leading-snug line-clamp-2">{course.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{skillFilter}</span>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-center bg-blue-700 text-white text-sm py-2 rounded-xl hover:bg-blue-800 transition"
                  >
                    Start Course →
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
