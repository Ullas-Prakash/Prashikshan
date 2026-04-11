import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Quiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]); // [{skill, questions:[]}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({}); // { "skill|qIndex": optionText }
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState({}); // { skill: { score, total } }

  useEffect(() => {
    const raw = localStorage.getItem("selectedSkills");
    if (!raw) {
      navigate("/skill-assessment");
      return;
    }

    const skills = JSON.parse(raw);
    if (!Array.isArray(skills) || skills.length === 0) {
      navigate("/skill-assessment");
      return;
    }

    axios
      .post("http://localhost:5000/api/quiz/generate", { skills })
      .then((res) => {
        setQuizData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load quiz: " + (err.response?.data?.error || err.message));
        setLoading(false);
      });
  }, [navigate]);

  const handleSelect = (skill, qIndex, option) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [`${skill}|${qIndex}`]: option }));
  };

  const handleSubmit = () => {
    // Check all questions answered
    let allAnswered = true;
    for (const { skill, questions } of quizData) {
      for (let i = 0; i < questions.length; i++) {
        if (!selected[`${skill}|${i}`]) {
          allAnswered = false;
          break;
        }
      }
      if (!allAnswered) break;
    }

    if (!allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    const computed = {};
    for (const { skill, questions } of quizData) {
      let score = 0;
      questions.forEach((q, i) => {
        if (selected[`${skill}|${i}`]?.trim().toLowerCase() === q.answer?.trim().toLowerCase()) score++;
      });
      computed[skill] = { score, total: questions.length };
    }

    setScores(computed);
    setSubmitted(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#555", fontSize: 16 }}>
            ⏳ Generating your quiz, please wait...
          </p>
          <p style={{ textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 8 }}>
            This may take up to a minute for multiple skills.
          </p>
        </div>
      </div>
    );
  }

  if (error && quizData.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>
          <button style={styles.btn} onClick={() => navigate("/skill-assessment")}>
            ← Back to Skill Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Skill Quiz 🎯</h1>
        <p style={styles.subtitle}>Answer all questions and submit to see your score</p>

        {/* Score Summary after submission */}
        {submitted && (
          <div style={styles.scoreBox}>
            <p style={styles.scoreLabel}>Score Summary</p>
            {Object.entries(scores).map(([skill, { score, total }]) => (
              <div key={skill} style={styles.scoreRow}>
                <span style={{ fontWeight: 600 }}>{skill}</span>
                <span style={{ color: "#4a90d9", fontWeight: 700 }}>
                  {score} / {total}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Questions grouped by skill */}
        {quizData.map(({ skill, questions }) => (
          <div key={skill} style={styles.skillSection}>
            <h2 style={styles.skillTitle}>{skill}</h2>
            {questions.map((q, i) => {
              const key = `${skill}|${i}`;
              const userAnswer = selected[key];
              return (
                <div key={i} style={styles.questionBlock}>
                  <p style={styles.questionText}>
                    {i + 1}. {q.question}
                  </p>
                  <div style={styles.options}>
                    {q.options.map((opt, j) => {
                      const isSelected = userAnswer === opt;
                      const isCorrect =
                        opt?.trim().toLowerCase() === q.answer?.trim().toLowerCase();
                      let bg = "#fff";
                      let border = "#ddd";
                      let color = "#333";

                      if (submitted) {
                        if (isCorrect) { bg = "#dcfce7"; border = "#22c55e"; color = "#15803d"; }
                        else if (isSelected && !isCorrect) { bg = "#fee2e2"; border = "#ef4444"; color = "#b91c1c"; }
                      } else if (isSelected) {
                        bg = "#e8f0fe"; border = "#4a90d9"; color = "#1a56a0";
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
                      );
                    })}
                  </div>
                  {submitted && userAnswer?.trim().toLowerCase() !== q.answer?.trim().toLowerCase() && (
                    <p style={{ fontSize: 13, color: "#15803d", marginTop: 6 }}>
                      ✓ Correct answer: {q.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {error && <p style={styles.error}>{error}</p>}

        {!submitted ? (
          <button style={styles.btn} onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button
            style={{ ...styles.btn, background: "#6b7280" }}
            onClick={() => navigate("/skill-assessment")}
          >
            ← Retake Assessment
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "2rem",
    width: "100%",
    maxWidth: 680,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    alignSelf: "flex-start",
  },
  title: { fontSize: 26, fontWeight: 600, margin: "0 0 4px", color: "#111" },
  subtitle: { fontSize: 13, color: "#888", margin: "0 0 1.5rem" },
  scoreBox: {
    background: "#f0f7ff",
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
    marginBottom: "1.5rem",
  },
  scoreLabel: { fontSize: 15, fontWeight: 700, color: "#333", margin: "0 0 10px" },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 15,
    padding: "4px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  skillSection: { marginBottom: "2rem" },
  skillTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1d4ed8",
    borderBottom: "2px solid #bfdbfe",
    paddingBottom: 6,
    marginBottom: 16,
  },
  questionBlock: { marginBottom: 20 },
  questionText: { fontSize: 15, fontWeight: 500, color: "#111", margin: "0 0 10px", lineHeight: 1.5 },
  options: { display: "flex", flexDirection: "column", gap: 8 },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 8,
    border: "1.5px solid #ddd",
    cursor: "pointer",
    fontSize: 14,
    textAlign: "left",
    transition: "all 0.15s",
  },
  optionLetter: { fontWeight: 600, minWidth: 22 },
  btn: {
    width: "100%",
    padding: "12px 20px",
    background: "#4a90d9",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 16,
  },
  error: { color: "#ef4444", fontSize: 13, marginTop: 8 },
};
