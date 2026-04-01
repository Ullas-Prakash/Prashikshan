const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// CREATE STUDENT (Onboarding)
router.post("/add", async (req, res) => {
    try {
        console.log("API HIT"); 
        console.log(req.body);
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;