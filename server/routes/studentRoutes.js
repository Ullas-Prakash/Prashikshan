const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { getCourses } = require("../services/youtubeService");


// GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// GET STUDENT BY ID
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


// LOGIN STUDENT
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const student = await Student.findOne({ email: email.toLowerCase() });

        if (!student) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        if (student.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        res.json({ message: "Login successful", student });

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


// UPDATE STUDENT SKILLS
router.patch("/:id/skills", async (req, res) => {
    try {
        const { skills } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { skills },
            { new: true }
        );
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
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
            message: "Quiz result saved successfully",
            result: { skill, score, total, percentage, level }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🔥 FINAL RECOMMENDATION API (FIXED)
router.get("/recommend/:id", async (req, res) => {
    try {
        console.log("🚀 RECOMMENDATION API HIT");

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const recommendations = [];

        // ❗ IMPORTANT FIX: HANDLE EMPTY QUIZ HISTORY
        if (!student.quizHistory || student.quizHistory.length === 0) {
            return res.json({
                student: student.name,
                recommendations: []
            });
        }

        // 🔥 LOOP THROUGH ALL QUIZ RESULTS
        for (let quiz of student.quizHistory) {

            const courses = await getCourses(quiz.skill, quiz.level);

            recommendations.push({
                skill: quiz.skill,
                level: quiz.level,
                courses
            });
        }

        res.json({
            student: student.name,
            recommendations
        });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});


module.exports = router;