const express = require("express");
const router = express.Router();
const { searchCourses } = require("../services/courseAggregator");

// GET /api/courses/search?skill=react&level=beginner&platform=youtube
router.get("/search", async (req, res) => {
  try {
    const { skill = "javascript", level = "beginner", platform = "youtube" } = req.query;

    if (skill === "git" && platform === "pdf") {
      return res.json([]);
    }

    const results = await searchCourses(skill, level, platform);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
