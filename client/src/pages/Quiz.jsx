import { useState } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function generateQuiz(topic, numQuestions = 5) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a quiz generator. Always respond in valid JSON only, no extra text.",
      },
      {
        role: "user",
        content: `Generate ${numQuestions} multiple choice questions about "${topic}".
Return JSON in this exact format:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "..."
    }
  ]
}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  const json = JSON.parse(clean);
  return json.questions;
}

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setSelected({});
    setSubmitted(false);
    setCurrentIndex(0);
    try {
      const result = await generateQuiz(topic.trim(), numQuestions);
      setQuestions(result);
    } catch (err) {
      setError("Failed to generate quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(selected).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const handleRetry = () => {
    setQuestions([]);
    setSelected({});
    setSubmitted(false);
    setCurrentIndex(0);
    setError("");
  };

  const score = submitted
    ? questions.filter((q, i) => selected[i] === q.answer).length
    : 0;

  const q = questions[currentIndex];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Quiz Generator</h1>
        <p style={styles.subtitle}>Powered by Groq AI</p>

        {/* Input Section */}
        {questions.length === 0 && (
          <div style={styles.inputSection}>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter a topic (e.g. World War 2, Python, Cricket)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <div style={styles.row}>
              <label style={styles.label}>Number of questions:</label>
              <select
                style={styles.select}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {/* Quiz Section */}
        {questions.length > 0 && !submitted && (
          <div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <p style={styles.question}>{q.question}</p>

            <div style={styles.options}>
              {q.options.map((opt, i) => {
                const isSelected = selected[currentIndex] === opt;
                return (
                  <button
                    key={i}
                    style={{
                      ...styles.optionBtn,
                      background: isSelected ? "#e8f0fe" : "#fff",
                      borderColor: isSelected ? "#4a90d9" : "#ddd",
                      color: isSelected ? "#1a56a0" : "#333",
                    }}
                    onClick={() => handleSelect(currentIndex, opt)}
                  >
                    <span style={styles.optionLetter}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={styles.navRow}>
              <button
                style={{ ...styles.navBtn, opacity: currentIndex === 0 ? 0.4 : 1 }}
                onClick={() => setCurrentIndex((p) => p - 1)}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  style={styles.navBtn}
                  onClick={() => setCurrentIndex((p) => p + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={{ ...styles.btn, margin: 0 }}
                  onClick={handleSubmit}
                >
                  Submit Quiz
                </button>
              )}
            </div>

            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {/* Results Section */}
        {submitted && (
          <div>
            <div style={styles.scoreBox}>
              <p style={styles.scoreLabel}>Your Score</p>
              <p style={styles.scoreValue}>
                {score} / {questions.length}
              </p>
              <p style={styles.scorePercent}>
                {Math.round((score / questions.length) * 100)}%{" "}
                {score === questions.length
                  ? "Perfect!"
                  : score >= questions.length / 2
                  ? "Good job!"
                  : "Keep practicing!"}
              </p>
            </div>

            {questions.map((q, i) => {
              const isCorrect = selected[i] === q.answer;
              return (
                <div
                  key={i}
                  style={{
                    ...styles.resultCard,
                    borderLeft: `4px solid ${isCorrect ? "#22c55e" : "#ef4444"}`,
                  }}
                >
                  <p style={styles.resultQ}>
                    {i + 1}. {q.question}
                  </p>
                  <p style={{ color: isCorrect ? "#15803d" : "#b91c1c", fontSize: 14 }}>
                    {isCorrect ? "Correct" : `Your answer: ${selected[i]}`}
                  </p>
                  {!isCorrect && (
                    <p style={{ color: "#15803d", fontSize: 14 }}>
                      Correct answer: {q.answer}
                    </p>
                  )}
                  <p style={styles.explanation}>{q.explanation}</p>
                </div>
              );
            })}

            <button style={styles.btn} onClick={handleRetry}>
              Try Another Quiz
            </button>
          </div>
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
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "2rem",
    width: "100%",
    maxWidth: 620,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
    margin: "0 0 4px",
    color: "#111",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    margin: "0 0 1.5rem",
  },
  inputSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    outline: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  select: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
  },
  btn: {
    padding: "10px 20px",
    background: "#4a90d9",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 8,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    margin: 0,
  },
  progressBar: {
    height: 6,
    background: "#eee",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    background: "#4a90d9",
    borderRadius: 99,
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 13,
    color: "#888",
    margin: "0 0 1rem",
  },
  question: {
    fontSize: 17,
    fontWeight: 500,
    color: "#111",
    margin: "0 0 1rem",
    lineHeight: 1.5,
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #ddd",
    cursor: "pointer",
    fontSize: 14,
    textAlign: "left",
    transition: "all 0.15s",
  },
  optionLetter: {
    fontWeight: 600,
    minWidth: 22,
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  scoreBox: {
    textAlign: "center",
    padding: "1.5rem",
    background: "#f0f7ff",
    borderRadius: 12,
    marginBottom: "1.5rem",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    margin: "0 0 4px",
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: 700,
    color: "#4a90d9",
    margin: "0 0 4px",
  },
  scorePercent: {
    fontSize: 15,
    color: "#444",
    margin: 0,
  },
  resultCard: {
    padding: "12px 16px",
    borderRadius: 8,
    background: "#fafafa",
    marginBottom: 12,
    border: "1px solid #eee",
  },
  resultQ: {
    fontWeight: 500,
    fontSize: 14,
    margin: "0 0 6px",
    color: "#111",
  },
  explanation: {
    fontSize: 13,
    color: "#666",
    margin: "6px 0 0",
    lineHeight: 1.5,
  },
};