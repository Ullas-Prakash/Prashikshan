import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Quiz() {
  const navigate = useNavigate()
  const [quizData, setQuizData] = useState([])   // [{ skill, questions[] }]
  const [loading, setLoading] = useState(true)
  const [loadingSkill, setLoadingSkill] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState({})   // { "skill|qIndex": option }
  const [submitted, setSubmitted] = useState(false)
  const [scores, setScores] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('selectedSkills')
    if (!raw) { navigate('/skill-assessment'); return }

    const skills = JSON.parse(raw)
    if (!Array.isArray(skills) || skills.length === 0) { navigate('/skill-assessment'); return }

    async function loadAll() {
      try {
        const results = []
        for (const skill of skills) {
          setLoadingSkill(skill)
          const res = await fetch('http://localhost:5000/api/students/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill, level: 'beginner' })
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || `Failed to load quiz for ${skill}`)
          }
          const data = await res.json()
          if (data.questions && data.questions.length > 0) {
            results.push({ skill, questions: data.questions })
          }
        }
        if (results.length === 0) throw new Error('No questions available for selected skills')
        setQuizData(results)
      } catch (err) {
        setError(err.message || 'Failed to load quiz. Please try again.')
      } finally {
        setLoading(false)
        setLoadingSkill('')
      }
    }

    loadAll()
  }, [navigate])

  const handleSelect = (skill, qIndex, option) => {
    if (submitted) return
    setSelected(prev => ({ ...prev, [`${skill}|${qIndex}`]: option }))
  }

  const handleSubmit = async () => {
    for (const { skill, questions } of quizData) {
      for (let i = 0; i < questions.length; i++) {
        if (!selected[`${skill}|${i}`]) {
          setError('Please answer all questions before submitting.')
          return
        }
      }
    }

    const computed = {}
    for (const { skill, questions } of quizData) {
      let score = 0
      questions.forEach((q, i) => {
        if (selected[`${skill}|${i}`] === q.answer) score++
      })
      computed[skill] = { score, total: questions.length }
    }

    setScores(computed)
    setSubmitted(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const studentId = localStorage.getItem('studentId')
    if (studentId) {
      setSaving(true)
      try {
        for (const { skill, questions } of quizData) {
          const { score } = computed[skill]
          await fetch(`http://localhost:5000/api/students/quiz-result/${studentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill, score, total: questions.length })
          })
        }
      } catch (err) {
        console.error('Failed to save quiz results:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: 18, color: '#333', marginBottom: 8 }}>Loading your quiz...</p>
            {loadingSkill && (
              <p style={{ fontSize: 13, color: '#4a90d9' }}>
                Fetching questions for: <strong>{loadingSkill}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error && quizData.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>{error}</p>
          <button style={styles.btn} onClick={() => navigate('/skill-assessment')}>← Back to Skill Assessment</button>
        </div>
      </div>
    )
  }

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s.score, 0)
  const totalQuestions = Object.values(scores).reduce((sum, s) => sum + s.total, 0)
  const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Skill Quiz 🎯</h1>
        <p style={styles.subtitle}>Answer all questions and submit to see your score</p>

        {quizData.map(({ skill, questions }) => (
          <div key={skill} style={styles.skillSection}>
            <h2 style={styles.skillTitle}>{skill.charAt(0).toUpperCase() + skill.slice(1)}</h2>
            {questions.map((q, i) => {
              const key = `${skill}|${i}`
              const userAnswer = selected[key]
              return (
                <div key={i} style={styles.questionBlock}>
                  <p style={styles.questionText}>{i + 1}. {q.question}</p>
                  <div style={styles.options}>
                    {q.options.map((opt, j) => {
                      const isSelected = userAnswer === opt
                      const isCorrect = opt === q.answer
                      let bg = '#fff', border = '#ddd', color = '#333'
                      if (submitted) {
                        if (isCorrect) { bg = '#dcfce7'; border = '#22c55e'; color = '#15803d' }
                        else if (isSelected) { bg = '#fee2e2'; border = '#ef4444'; color = '#b91c1c' }
                      } else if (isSelected) {
                        bg = '#e8f0fe'; border = '#4a90d9'; color = '#1a56a0'
                      }
                      return (
                        <button
                          key={j}
                          style={{ ...styles.optionBtn, background: bg, borderColor: border, color }}
                          onClick={() => handleSelect(skill, i, opt)}
                          disabled={submitted}
                        >
                          <span style={styles.optionLetter}>{String.fromCharCode(65 + j)}</span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {submitted && userAnswer !== q.answer && (
                    <p style={{ fontSize: 13, color: '#15803d', marginTop: 6 }}>
                      ✓ Correct answer: {q.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {error && <p style={styles.error}>{error}</p>}

        {!submitted ? (
          <button style={styles.btn} onClick={handleSubmit}>Submit Quiz</button>
        ) : (
          <>
            <div style={{ ...styles.scoreBox, marginTop: '2rem' }}>
              <p style={styles.scoreLabel}>
                Overall Score: <span style={{ color: '#1d4ed8' }}>{totalScore}/{totalQuestions} ({percentage}%)</span>
              </p>
              {Object.entries(scores).map(([skill, { score, total }]) => (
                <div key={skill} style={styles.scoreRow}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{skill}</span>
                  <span style={{ color: '#4a90d9', fontWeight: 700 }}>{score} / {total}</span>
                </div>
              ))}
            </div>
            <button
              style={{ ...styles.btn, background: saving ? '#9ca3af' : '#16a34a' }}
              onClick={() => navigate('/recommendations')}
              disabled={saving}
            >
              {saving ? 'Saving results...' : 'View My Recommendations →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f7fa', display: 'flex', justifyContent: 'center', padding: '2rem 1rem' },
  card: { background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 680, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', alignSelf: 'flex-start' },
  title: { fontSize: 26, fontWeight: 600, margin: '0 0 4px', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', margin: '0 0 1.5rem' },
  scoreBox: { background: '#f0f7ff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' },
  scoreLabel: { fontSize: 15, fontWeight: 700, color: '#333', margin: '0 0 10px' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '4px 0', borderBottom: '1px solid #e5e7eb' },
  skillSection: { marginBottom: '2rem' },
  skillTitle: { fontSize: 18, fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #bfdbfe', paddingBottom: 6, marginBottom: 16 },
  questionBlock: { marginBottom: 20 },
  questionText: { fontSize: 15, fontWeight: 500, color: '#111', margin: '0 0 10px', lineHeight: 1.5 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  optionBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, border: '1.5px solid #ddd', cursor: 'pointer', fontSize: 14, textAlign: 'left', transition: 'all 0.15s' },
  optionLetter: { fontWeight: 600, minWidth: 22 },
  btn: { width: '100%', padding: '12px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600, marginTop: 16 },
  error: { color: '#ef4444', fontSize: 13, marginTop: 8 },
}
