const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
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


// ✅ CREATE STUDENT (Onboarding)
router.post("/add", async (req, res) => {
    try {
        console.log("API HIT - ADD STUDENT");
        console.log(req.body);

        const { name, email, skills, interests, level } = req.body;

        // Basic validation
        if (!name || !email || !skills || !interests || !level) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const student = new Student({
            name,
            email,
            skills,
            interests,
            level
        });

        await student.save();

        res.status(201).json({
            message: "Student created successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// ✅ GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        console.log("API HIT - GET ALL STUDENTS");

        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// ✅ GET STUDENT BY ID
router.get("/:id", async (req, res) => {
    try {
        console.log("API HIT - GET STUDENT BY ID");

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


module.exports = router;