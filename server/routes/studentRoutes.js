const express = require("express");
const router = express.Router();
const Student = require("../models/Student");


// ✅ GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ GET STUDENT BY ID
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


// ✅ CREATE STUDENT (Onboarding)
router.post("/add", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🔥 SAVE QUIZ RESULT (CORE FEATURE)
router.post("/quiz-result/:id", async (req, res) => {
    try {
        const { skill, score, total } = req.body;

        if (!skill || score == null || total == null) {
            return res.status(400).json({ message: "Missing fields" });
        }

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
            result: {
                skill,
                score,
                total,
                percentage,
                level
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🚀 RECOMMENDATION ENGINE (CORE USP)
router.get("/recommend/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const recommendations = [];

        student.quizHistory.forEach((quiz) => {
            if (quiz.level === "beginner") {
                recommendations.push({
                    skill: quiz.skill,
                    suggestion: `Start with beginner tutorials for ${quiz.skill}`
                });
            } 
            else if (quiz.level === "intermediate") {
                recommendations.push({
                    skill: quiz.skill,
                    suggestion: `Practice intermediate problems in ${quiz.skill}`
                });
            } 
            else {
                recommendations.push({
                    skill: quiz.skill,
                    suggestion: `Apply for internships or advanced projects in ${quiz.skill}`
                });
            }
        });

        res.json({
            student: student.name,
            recommendations
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;