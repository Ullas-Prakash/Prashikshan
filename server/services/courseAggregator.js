const axios = require("axios");
const { getCourses: getYoutubeCourses } = require("./youtubeService");

// Skill keyword aliases for title matching
const SKILL_KEYWORDS = {
  react: ["react"],
  javascript: ["javascript", "js"],
  python: ["python"],
  nodejs: ["node.js", "nodejs", "node js"],
  mongodb: ["mongodb", "mongo"],
  ml: ["machine learning", "deep learning", "neural network"],
  git: ["git", "github"],
  sql: ["sql", "mysql", "postgresql", "sqlite"],
};

// Open Library PDFs — free, no key needed
const getPDFCourses = async (skill) => {
  try {
    const response = await axios.get("https://openlibrary.org/search.json", {
      params: { title: skill, limit: 20 },
    });

    if (!response.data.docs) return [];

    const keywords = SKILL_KEYWORDS[skill] || [skill];

    const filtered = response.data.docs
      .filter((book) => {
        if (!book.title || !book.key) return false;
        const titleLower = book.title.toLowerCase();
        return keywords.some((kw) => titleLower.includes(kw));
      })
      .slice(0, 8)
      .map((book) => ({
        title: book.title,
        url: `https://openlibrary.org${book.key}`,
        platform: "pdf",
      }));

    return filtered;
  } catch (error) {
    console.log("❌ Open Library error:", error.message);
    return [];
  }
};

const searchCourses = async (skill, level, platform) => {
  try {
    if (platform === "youtube") {
      const results = await getYoutubeCourses(skill, level);
      return results.map((r) => ({ ...r, platform: "youtube" }));
    }

    if (platform === "pdf") {
      return await getPDFCourses(skill);
    }

    return [];
  } catch (error) {
    console.log("❌ courseAggregator error:", error.message);
    return [];
  }
};

module.exports = { searchCourses };
