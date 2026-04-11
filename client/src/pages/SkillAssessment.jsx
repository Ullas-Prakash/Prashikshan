import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SKILLS = [
  { id: 'html', label: 'HTML', icon: '🌐' },
  { id: 'css', label: 'CSS', icon: '🎨' },
  { id: 'javascript', label: 'JavaScript', icon: '⚡' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'nodejs', label: 'Node.js', icon: '🟢' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'mongodb', label: 'MongoDB', icon: '🍃' },
  { id: 'sql', label: 'SQL', icon: '🗄️' },
  { id: 'git', label: 'Git', icon: '🔧' },
  { id: 'ml', label: 'Machine Learning', icon: '🤖' },
  { id: 'dsa', label: 'DSA', icon: '📊' },
  { id: 'figma', label: 'UI/UX (Figma)', icon: '🖌️' },
]

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out', color: 'green' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Know the basics', color: 'yellow' },
  { id: 'advanced', label: 'Advanced', desc: 'Confident & experienced', color: 'red' },
]

export default function SkillAssessment() {
  const [step, setStep] = useState(1)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [levels, setLevels] = useState({})
  const [interests, setInterests] = useState('')
  const navigate = useNavigate()

  const toggleSkill = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const setLevel = (skillId, levelId) => {
    setLevels(prev => ({ ...prev, [skillId]: levelId }))
  }

  const allLevelsSelected = selectedSkills.every(s => levels[s])

  // ✅ UPDATED: Now navigates to /quiz with skills & interests
  const handleSubmit = () => {
    const skillNames = selectedSkills.map(id => {
      const skill = SKILLS.find(s => s.id === id)
      return `${skill.label} (${levels[id]})`
    })

    navigate('/quiz', {
      state: {
        skills: skillNames,
        interests
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700">Skill Assessment 🧠</h1>
          <p className="text-gray-500 mt-2">Help us understand you better to recommend the right courses & internships</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Pick Skills', 'Set Levels', 'Interests'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-blue-700 text-white' :
                  'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? 'text-blue-700' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 2 && <div className="w-10 h-0.5 bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Pick Skills */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Select the skills you know or want to learn:
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SKILLS.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-medium text-sm transition
                    ${selectedSkills.includes(skill.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}
                >
                  <span className="text-xl">{skill.icon}</span>
                  {skill.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedSkills.length === 0}
              className="mt-8 w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next → Set Skill Levels ({selectedSkills.length} selected)
            </button>
          </div>
        )}

        {/* STEP 2: Set Levels */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-6">
              What's your level in each skill?
            </h2>
            <div className="flex flex-col gap-6">
              {selectedSkills.map(skillId => {
                const skill = SKILLS.find(s => s.id === skillId)
                return (
                  <div key={skillId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="font-semibold text-gray-700 mb-3">
                      {skill.icon} {skill.label}
                    </p>
                    <div className="flex gap-3">
                      {LEVELS.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setLevel(skillId, level.id)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition
                            ${levels[skillId] === level.id
                              ? level.color === 'green' ? 'bg-green-100 border-green-500 text-green-700'
                              : level.color === 'yellow' ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                              : 'bg-red-100 border-red-500 text-red-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                        >
                          {level.label}
                          <span className="block text-xs font-normal">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-blue-700 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!allLevelsSelected}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next → Interests
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Interests */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              What are you interested in? 🎯
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Tell us your career goals or topics you're passionate about.
            </p>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. I want to become a full-stack developer and build real-world projects..."
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-blue-700 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!interests.trim()}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start Quiz 🎯
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}