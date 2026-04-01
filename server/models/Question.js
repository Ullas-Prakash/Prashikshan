const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    skill: String,   // e.g., "JavaScript", "React", "AI"
    level: {
        type: String,
        enum: ["easy", "medium", "hard"]
    }
});

module.exports = mongoose.model("Question", questionSchema);