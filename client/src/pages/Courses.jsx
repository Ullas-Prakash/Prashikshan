import { useState } from 'react'

const ALL_COURSES = [
  { id: 1, title: 'React for Beginners', platform: 'YouTube', skill: 'react', duration: '6 hrs', level: 'beginner', link: '#', thumb: '⚛️' },
  { id: 2, title: 'JavaScript Mastery', platform: 'Coursera', skill: 'javascript', duration: '12 hrs', level: 'intermediate', link: '#', thumb: '⚡' },
  { id: 3, title: 'Python Crash Course', platform: 'YouTube', skill: 'python', duration: '4 hrs', level: 'beginner', link: '#', thumb: '🐍' },
  { id: 4, title: 'Node.js Full Course', platform: 'YouTube', skill: 'nodejs', duration: '8 hrs', level: 'intermediate', link: '#', thumb: '🟢' },
  { id: 5, title: 'MongoDB Basics', platform: 'Coursera', skill: 'mongodb', duration: '5 hrs', level: 'beginner', link: '#', thumb: '🍃' },
  { id: 6, title: 'Advanced React Patterns', platform: 'Udemy', skill: 'react', duration: '10 hrs', level: 'advanced', link: '#', thumb: '⚛️' },
  { id: 7, title: 'Machine Learning A-Z', platform: 'Coursera', skill: 'ml', duration: '20 hrs', level: 'intermediate', link: '#', thumb: '🤖' },
  { id: 8, title: 'Git & GitHub', platform: 'YouTube', skill: 'git', duration: '3 hrs', level: 'beginner', link: '#', thumb: '🔧' },
  { id: 9, title: 'SQL for Data Analysis', platform: 'Coursera', skill: 'sql', duration: '7 hrs', level: 'intermediate', link: '#', thumb: '🗄️' },
]

const SKILLS = ['all', 'react', 'javascript', 'python', 'nodejs', 'mongodb', 'ml', 'git', 'sql']
const LEVELS = ['all', 'beginner', 'intermediate', 'advanced']
const PLATFORMS = ['all', 'YouTube', 'Coursera', 'Udemy']

const levelColor = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function Courses() {
  const [skillFilter, setSkillFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_COURSES.filter(course => {
    const matchSkill = skillFilter === 'all' || course.skill === skillFilter
    const matchLevel = levelFilter === 'all' || course.level === levelFilter
    const matchPlatform = platformFilter === 'all' || course.platform === platformFilter
    const matchSearch = course.title.toLowerCase().includes(search.toLowerCase())
    return matchSkill && matchLevel && matchPlatform && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">📚 Courses</h1>
          <p className="text-gray-500 mt-1">Browse and filter courses based on your skills</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm">Try changing your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="text-5xl mb-4">{course.thumb}</div>
                <h3 className="font-bold text-gray-800 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.platform} · {course.duration}</p>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{course.skill}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${levelColor[course.level]}`}>{course.level}</span>
                </div>
                <a
                  href={course.link}
                  className="block text-center bg-blue-700 text-white text-sm py-2 rounded-xl hover:bg-blue-800 transition"
                >
                  Start Course →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}