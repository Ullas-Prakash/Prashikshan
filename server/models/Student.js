const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true,
        trim: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 1
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: true
    },
<<<<<<< HEAD

    // 🧠 NEW FIELD (IMPORTANT)
    quizHistory: [
        {
            skill: String,
            score: Number,
            total: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
=======
    date: {
        type: Date,
        default: Date.now
    }
});


const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    skills: {
        type: [String],
        required: true
    },
    interests: {
        type: [String],
        required: true
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: true
    },

    // 🔥 MAIN FEATURE
    quizHistory: {
        type: [quizSchema],
        default: []
    },
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707

    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Student", studentSchema);