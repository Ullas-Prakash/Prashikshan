const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Safely extract and parse JSON from AI response
function safeParseQuestions(raw) {
  // Strip markdown code fences and trim
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Extract the first {...} block in case there's surrounding text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed. Raw response:\n", raw);
    return null;
  }

  // Validate structure
  if (
    !parsed.questions ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length === 0
  ) {
    console.error("Invalid structure — missing questions array");
    return null;
  }

  // Filter out any malformed questions
  const valid = parsed.questions.filter(
    (q) =>
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      typeof q.answer === "string"
  );

  return valid.length > 0 ? valid : null;
}

// POST /api/quiz/generate
router.post("/generate", async (req, res) => {
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "skills array is required" });
  }

  try {
    const results = [];

    for (let idx = 0; idx < skills.length; idx++) {
      const skill = skills[idx];

      // Wait 15s between requests to avoid TPM rate limit (except first)
      if (idx > 0) await sleep(15000);

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a JSON-only quiz generator. Return ONLY valid JSON. No backticks, no markdown, no explanations, no comments. Strict JSON only.",
          },
          {
            role: "user",
            content: `Generate 5 multiple choice questions about "${skill}".
Return ONLY this JSON structure, nothing else:
{"questions":[{"question":"What does HTML stand for?","options":["HyperText Markup Language","High Transfer Markup Language","HyperText Machine Language","High Text Markup Language"],"answer":"HyperText Markup Language"}]}
Rules:
- options must be full text strings (not A/B/C/D letters)
- answer must exactly match one of the options strings
- output must be complete valid JSON with all 5 questions`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const raw = response.choices[0].message.content;
      const questions = safeParseQuestions(raw);

      if (!questions) {
        // Fallback: push a placeholder so the skill still appears
        results.push({
          skill,
          questions: [
            {
              question: `Failed to load questions for ${skill}. Please retake the quiz.`,
              options: ["Retry", "Go back", "Skip", "Continue"],
              answer: "Retry",
            },
          ],
        });
      } else {
        results.push({ skill, questions });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    res.status(500).json({ error: "Failed to generate quiz: " + err.message });
  }
});

module.exports = router;
