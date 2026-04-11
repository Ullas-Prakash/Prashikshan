const express = require("express");
const router = express.Router();   // ✅ MUST be here at top
const Student = require("../models/Student");


// ➕ CREATE STUDENT
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { score, total, skill } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Student.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    quizHistory: { skill, score, total }
                }
            },
            { new: true }
        );

        res.json({
            message: "Quiz result saved"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 📥 GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        console.log("API HIT - GET QUESTIONS");

        const questions = await Question.find();

        res.json(questions);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 📥 GET STUDENT BY ID
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🧠 SAVE QUIZ RESULT
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { score, total, skill } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.quizHistory.push({
            skill,
            score,
            total
        });

        await student.save();

        res.json({
            message: "Quiz result saved",
            student
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;   // ✅ MUST be at bottom