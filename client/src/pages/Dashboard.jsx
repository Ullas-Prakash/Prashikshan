import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const levelColor = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

const mockCourses = [
  { id: 1, title: 'React for Beginners', platform: 'YouTube', skill: 'react', duration: '6 hrs', link: '#', thumb: '⚛️' },
  { id: 2, title: 'JavaScript Mastery', platform: 'Coursera', skill: 'javascript', duration: '12 hrs', link: '#', thumb: '⚡' },
  { id: 3, title: 'Python Crash Course', platform: 'YouTube', skill: 'python', duration: '4 hrs', link: '#', thumb: '🐍' },
]

const mockInternships = [
  { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp', skills: ['react', 'javascript'], location: 'Remote', link: '#' },
  { id: 2, title: 'Python Developer Intern', company: 'DataLabs', skills: ['python'], location: 'Bengaluru', link: '#' },
]

export default function Dashboard() {
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    if (!studentId) return

    fetch(`http://localhost:5000/api/students/${studentId}`)
      .then(res => res.json())
      .then(data => setStudent(data))
      .catch(err => console.error(err))
  }, [])

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // Build skills display from quizHistory if available, else from skills array, else from localStorage
  const localSkills = JSON.parse(localStorage.getItem('selectedSkills') || '[]')
  const baseSkills = student.skills && student.skills.length > 0 ? student.skills : localSkills

  const skillsDisplay = student.quizHistory && student.quizHistory.length > 0
    ? student.quizHistory.map(q => ({ skill: q.skill, level: q.level }))
    : baseSkills.map(s => ({ skill: s, level: 'beginner' }))

  // Filter courses relevant to student's skills
  const studentSkillsLower = baseSkills.map(s => s.toLowerCase())
  const relevantCourses = mockCourses.filter(c => studentSkillsLower.includes(c.skill))
  const displayCourses = relevantCourses.length > 0 ? relevantCourses : mockCourses

  // Filter internships relevant to student's skills
  const relevantInternships = mockInternships.filter(job =>
    job.skills.some(s => studentSkillsLower.includes(s))
  )
  const displayInternships = relevantInternships.length > 0 ? relevantInternships : mockInternships

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Welcome Banner */}
        <div className="bg-blue-700 text-white rounded-2xl p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold">Welcome back, {student.name} 👋</h1>
            <p className="text-blue-200 mt-1 text-sm">Here's your personalized learning dashboard</p>
          </div>
          <Link
            to="/skill-assessment"
            className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
          >
            Update Skills
          </Link>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🧠 Your Skills</h2>
          <div className="flex flex-wrap gap-3">
            {skillsDisplay.map((s, i) => (
              <span
                key={i}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${levelColor[s.level] || levelColor.beginner}`}
              >
                {s.skill} — {s.level}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">📚 Recommended Courses</h2>
            <Link to="/courses" className="text-blue-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {displayCourses.map(course => (
              <div key={course.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="text-4xl mb-3">{course.thumb}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{course.platform} · {course.duration}</p>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{course.skill}</span>
                <a
                  href={course.link}
                  className="block mt-3 text-center bg-blue-700 text-white text-xs py-1.5 rounded-lg hover:bg-blue-800 transition"
                >
                  Start Course →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Internships */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">💼 Recommended Internships</h2>
            <Link to="/internships" className="text-blue-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="flex flex-col gap-4">
            {displayInternships.map(job => (
              <div key={job.id} className="flex justify-between items-center border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                <div>
                  <h3 className="font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
                  <div className="flex gap-2 mt-2">
                    {job.skills.map((s, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{s}</span>
                    ))}
                  </div>
                </div>
                <a
                  href={job.link}
                  className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Apply →
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}