const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate quiz for ALL skills in ONE API call to avoid rate limits
async function generateQuizForSkills(skills, level = "beginner") {
    const prompt = `Generate 5 multiple choice questions for EACH of these topics: ${skills.join(", ")}.
Difficulty: ${level}

Return ONLY a valid JSON object like this, no extra text, no markdown:
{
  "SkillName": [
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct option text"}
  ]
}

Use the exact skill names as keys. Each skill must have exactly 5 questions.`;

    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
        try {
            const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                })
            });

            if (res.status === 429) {
                const wait = attempt * 5000;
                console.log(`Rate limited, retrying in ${wait / 1000}s...`);
                await sleep(wait);
                continue;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
            }

            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const cleaned = raw.replace(/```json|```/g, "").trim();

            return JSON.parse(cleaned); // { "CSS": [...], "HTML": [...] }
        } catch (err) {
            lastError = err;
            if (attempt < 4) await sleep(attempt * 3000);
        }
    }

    throw lastError || new Error("Failed to generate quiz after retries");
}

// Single-skill wrapper (kept for backward compat)
async function generateQuiz(skill, level = "beginner") {
    const result = await generateQuizForSkills([skill], level);
    // result key may differ in casing — find it
    const key = Object.keys(result).find(k => k.toLowerCase() === skill.toLowerCase()) || Object.keys(result)[0];
    return result[key];
}

module.exports = { generateQuiz, generateQuizForSkills };
