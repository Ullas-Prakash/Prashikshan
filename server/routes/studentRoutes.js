const express = require("express");
<<<<<<< HEAD
const router = express.Router();   // ✅ MUST be here at top
const Student = require("../models/Student");


// ➕ CREATE STUDENT
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { score, total, skill } = req.body;
=======
const router = express.Router();
const Student = require("../models/Student");
const { getCourses } = require("../services/youtubeService");


// 🔥 RECOMMENDATION ROUTE FIRST (IMPORTANT)
router.get("/recommend/:id", async (req, res) => {
    try {
        console.log("🚀 YOUTUBE ROUTE RUNNING");
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

<<<<<<< HEAD
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
=======
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
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


<<<<<<< HEAD
// 📥 GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        console.log("API HIT - GET QUESTIONS");

        const questions = await Question.find();

        res.json(questions);

=======
// GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


<<<<<<< HEAD
// 📥 GET STUDENT BY ID
=======
// GET STUDENT BY ID (KEEP LAST)
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
<<<<<<< HEAD

=======
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


<<<<<<< HEAD
// 🧠 SAVE QUIZ RESULT
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { score, total, skill } = req.body;
=======
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
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.quizHistory.push({
            skill,
            score,
<<<<<<< HEAD
            total
=======
            total,
            percentage,
            level
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
        });

        await student.save();

        res.json({
            message: "Quiz result saved",
<<<<<<< HEAD
            student
=======
            result: { skill, score, total, percentage, level }
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


<<<<<<< HEAD
module.exports = router;   // ✅ MUST be at bottom
=======
module.exports = router;
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
