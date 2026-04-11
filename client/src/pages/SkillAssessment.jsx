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

export default function SkillAssessment() {
  const [selectedSkills, setSelectedSkills] = useState([])
  const navigate = useNavigate()

  const toggleSkill = (id) => {
    setSelectedSkills(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  const handleSubmit = () => {
    const skillNames = selectedSkills.map(id => {
      const skill = SKILLS.find(s => s.id === id)
      return skill.label
    })

    localStorage.setItem("selectedSkills", JSON.stringify(skillNames))
    navigate('/quiz')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700">Skill Assessment 🧠</h1>
          <p className="text-gray-500 mt-2">Select the skills you know to get personalized course & internship recommendations</p>
        </div>

        {/* Skill Grid */}
        <h2 className="text-xl font-bold text-gray-700 mb-1">
          Select the skills you know or want to learn:
        </h2>
        <p className="text-sm text-gray-400 mb-4">Pick up to 5 skills ({selectedSkills.length}/5 selected)</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SKILLS.map(skill => {
            const isSelected = selectedSkills.includes(skill.id)
            const isDisabled = !isSelected && selectedSkills.length >= 5
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                disabled={isDisabled}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-medium text-sm transition
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : isDisabled
                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}
              >
                <span className="text-xl">{skill.icon}</span>
                {skill.label}
              </button>
            )
          })}
        </div>

      <button
  onClick={handleSubmit}
  disabled={selectedSkills.length < 5}
  className="mt-8 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
>
  Start Quiz 🎯 ({selectedSkills.length}/5 selected)
</button>
      </div>
    </div>
  )
}