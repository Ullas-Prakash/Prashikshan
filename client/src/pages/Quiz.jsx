import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const QUESTIONS = {
  javascript: [
    { q: 'What does `typeof null` return in JavaScript?', options: ['null', 'object', 'undefined', 'string'], answer: 'object' },
    { q: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], answer: 'push()' },
    { q: 'What is the output of `2 + "2"`?', options: ['4', '22', 'NaN', 'Error'], answer: '22' },
  ],
  python: [
    { q: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'define'], answer: 'def' },
    { q: 'What data type is `[1, 2, 3]` in Python?', options: ['tuple', 'dict', 'list', 'set'], answer: 'list' },
    { q: 'How do you start a comment in Python?', options: ['//', '#', '/*', '--'], answer: '#' },
  ],
  react: [
    { q: 'What hook is used for side effects in React?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], answer: 'useEffect' },
    { q: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JS Extra'], answer: 'JavaScript XML' },
    { q: 'Which method re-renders a component?', options: ['setState', 'render()', 'useState setter', 'forceUpdate'], answer: 'useState setter' },
  ],
  nodejs: [
    { q: 'Which module is used to create an HTTP server in Node.js?', options: ['fs', 'http', 'path', 'os'], answer: 'http' },
    { q: 'What does `npm` stand for?', options: ['Node Package Manager', 'New Project Module', 'Node Process Manager', 'None'], answer: 'Node Package Manager' },
    { q: 'Which function reads a file asynchronously in Node.js?', options: ['fs.readFile', 'fs.read', 'file.read', 'fs.open'], answer: 'fs.readFile' },
  ],
  mongodb: [
    { q: 'What type of database is MongoDB?', options: ['Relational', 'Graph', 'Document', 'Key-Value'], answer: 'Document' },
    { q: 'Which method inserts a document in MongoDB?', options: ['insertOne()', 'addOne()', 'create()', 'push()'], answer: 'insertOne()' },
    { q: 'What format does MongoDB store data in?', options: ['XML', 'CSV', 'BSON', 'JSON only'], answer: 'BSON' },
  ],
  html: [
    { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Text Machine Language', 'HyperText Machine Language', 'None'], answer: 'HyperText Markup Language' },
    { q: 'Which tag is used for the largest heading?', options: ['<h6>', '<h1>', '<head>', '<title>'], answer: '<h1>' },
    { q: 'Which attribute specifies an image source?', options: ['href', 'src', 'link', 'url'], answer: 'src' },
  ],
  css: [
    { q: 'Which property changes text color in CSS?', options: ['font-color', 'text-color', 'color', 'foreground'], answer: 'color' },
    { q: 'What does `display: flex` do?', options: ['Hides element', 'Enables flexbox layout', 'Adds border', 'Centers text'], answer: 'Enables flexbox layout' },
    { q: 'Which unit is relative to the viewport width?', options: ['px', 'em', 'vw', 'rem'], answer: 'vw' },
  ],
  git: [
    { q: 'Which command initializes a new Git repository?', options: ['git start', 'git init', 'git new', 'git create'], answer: 'git init' },
    { q: 'Which command stages all changes?', options: ['git commit', 'git push', 'git add .', 'git stage'], answer: 'git add .' },
    { q: 'What does `git pull` do?', options: ['Pushes changes', 'Fetches and merges remote changes', 'Deletes branch', 'Creates branch'], answer: 'Fetches and merges remote changes' },
  ],
  sql: [
    { q: 'Which SQL command retrieves data?', options: ['GET', 'FETCH', 'SELECT', 'READ'], answer: 'SELECT' },
    { q: 'Which clause filters rows in SQL?', options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 'WHERE' },
    { q: 'What does PRIMARY KEY ensure?', options: ['Unique + Not Null', 'Only Unique', 'Only Not Null', 'Foreign reference'], answer: 'Unique + Not Null' },
  ],
  ml: [
    { q: 'What does ML stand for?', options: ['Machine Learning', 'Model Logic', 'Meta Language', 'Module Layer'], answer: 'Machine Learning' },
    { q: 'Which algorithm is used for classification?', options: ['Linear Regression', 'K-Means', 'Decision Tree', 'PCA'], answer: 'Decision Tree' },
    { q: 'What is overfitting?', options: ['Model too simple', 'Model memorizes training data', 'Model ignores data', 'None'], answer: 'Model memorizes training data' },
  ],
  dsa: [
    { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 'O(log n)' },
    { q: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], answer: 'Stack' },
    { q: 'What does BFS stand for?', options: ['Binary First Search', 'Breadth First Search', 'Best First Search', 'None'], answer: 'Breadth First Search' },
  ],
  figma: [
    { q: 'What is Figma primarily used for?', options: ['Backend development', 'UI/UX design', 'Database management', 'Testing'], answer: 'UI/UX design' },
    { q: 'What is a "frame" in Figma?', options: ['A photo', 'A container for design elements', 'A plugin', 'A font'], answer: 'A container for design elements' },
    { q: 'What does "auto layout" do in Figma?', options: ['Exports design', 'Automatically arranges elements', 'Adds animations', 'Syncs with code'], answer: 'Automatically arranges elements' },
  ],
}

export default function Quiz() {
  const navigate = useNavigate()
  const [skills] = useState(() => {
    try {
      const stored = localStorage.getItem('selectedSkills')
      if (!stored) return []
      return JSON.parse(stored).filter(s => QUESTIONS[s])
    } catch {
      return []
    }
  })
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (skills.length === 0) navigate('/skill-assessment')
  }, [skills, navigate])

  const currentSkill = skills[currentSkillIndex]
  const questions = currentSkill ? QUESTIONS[currentSkill] : []

  const handleAnswer = (qIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [currentSkill]: { ...(prev[currentSkill] || {}), [qIndex]: option }
    }))
  }

  const currentAnswers = answers[currentSkill] || {}
  const allAnswered = questions.length > 0 && questions.every((_, i) => currentAnswers[i])

  const handleNext = async () => {
    if (currentSkillIndex < skills.length - 1) {
      setCurrentSkillIndex(i => i + 1)
    } else {
      await submitAll()
    }
  }

  const submitAll = async () => {
    setSaving(true)
    const studentId = localStorage.getItem('studentId')
    if (!studentId) { navigate('/register'); return }

    for (const skill of skills) {
      const qs = QUESTIONS[skill]
      const ans = answers[skill] || {}
      const score = qs.filter((q, i) => ans[i] === q.answer).length
      await fetch(`http://localhost:5000/api/students/quiz-result/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, score, total: qs.length })
      })
    }

    navigate('/recommendations')
  }

  if (skills.length === 0) return null

  const isLast = currentSkillIndex === skills.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">Skill Quiz 📝</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Skill {currentSkillIndex + 1} of {skills.length}: <span className="font-semibold capitalize">{currentSkill}</span>
          </p>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentSkillIndex + 1) / skills.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-6">
          {questions.map((q, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="font-semibold text-gray-800 mb-4">{i + 1}. {q.q}</p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(i, opt)}
                    className={`text-left px-4 py-2.5 rounded-lg border-2 text-sm transition
                      ${currentAnswers[i] === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!allAnswered || saving}
          className="mt-8 w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : isLast ? 'Submit & Get Recommendations 🚀' : `Next: ${skills[currentSkillIndex + 1]} →`}
        </button>

      </div>
    </div>
  )
}
