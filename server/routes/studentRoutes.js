const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { getCourses } = require("../services/youtubeService");


// 🔥 RECOMMENDATION ROUTE FIRST (IMPORTANT)
router.get("/recommend/:id", async (req, res) => {
    try {
        console.log("🚀 YOUTUBE ROUTE RUNNING");

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const recommendations = [];

        for (let quiz of student.quizHistory) {
            if (quiz.level === "beginner") {
                const courses = await getCourses(quiz.skill);

                recommendations.push({
                    skill: quiz.skill,
                    level: quiz.level,
                    courses
                });
            }
        }

        res.json({
            student: student.name,
            recommendations
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// GET STUDENT BY ID (KEEP LAST)
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


// CREATE STUDENT
router.post("/add", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// SAVE QUIZ RESULT
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { skill, score, total } = req.body;

        const percentage = (score / total) * 100;

        let level = "beginner";
        if (percentage >= 80) level = "advanced";
        else if (percentage >= 50) level = "intermediate";

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.quizHistory.push({
            skill,
            score,
            total,
            percentage,
            level
        });

        await student.save();

        res.json({
            message: "Quiz result saved",
            result: { skill, score, total, percentage, level }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;