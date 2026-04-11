const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Student = require("../models/Student");


// ➕ ADD QUESTION
router.post("/add", async (req, res) => {
    try {
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


// 📥 GET ALL QUESTIONS
router.get("/", async (req, res) => {
    try {
        console.log("GET QUESTIONS HIT");

        const questions = await Question.find();

        res.json(questions);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🧠 SUBMIT QUIZ + AUTO SAVE
router.post("/submit", async (req, res) => {
    try {
        console.log("SUBMIT QUIZ HIT");

        const { answers, studentId, skill } = req.body;

        let score = 0;

        for (let ans of answers) {
            const question = await Question.findById(ans.questionId);

            if (question && question.correctAnswer === ans.selectedAnswer) {
                score++;
            }
        }

        // 🔥 AUTO SAVE RESULT
        if (studentId) {
            await Student.findByIdAndUpdate(
                studentId,
                {
                    $push: {
                        quizHistory: {
                            skill,
                            score,
                            total: answers.length
                        }
                    }
                }
            );
        }

        res.json({
            message: "Quiz submitted and saved",
            score,
            total: answers.length
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;