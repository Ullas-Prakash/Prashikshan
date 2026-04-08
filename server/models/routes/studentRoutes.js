const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { getCourses } = require("../services/youtubeService");


// 🔥 RECOMMENDATION FIRST (VERY IMPORTANT)
router.get("/recommend/:id", async (req, res) => {
    try {
        console.log("NEW ROUTE HIT");

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


// GET STUDENT BY ID (KEEP THIS LAST)
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