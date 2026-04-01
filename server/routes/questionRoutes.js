const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// ➕ ADD QUESTION
router.post("/add", async (req, res) => {
    try {
        console.log("API HIT - ADD QUESTION");
        console.log(req.body);

        const question = new Question(req.body);
        await question.save();

        res.status(201).json({
            message: "Question added successfully",
            question
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;