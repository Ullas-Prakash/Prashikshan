const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    skills: { type: [String], required: true },
    interests: { type: [String], required: true },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Student", studentSchema);