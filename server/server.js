require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//require("dotenv").config();

const app = express();

// ✅ VERY IMPORTANT — middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ THEN routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

const quizRoutes = require("./routes/quizRoutes");
app.use("/api/quiz", quizRoutes);

// const questionRoutes = require("./routes/questionRoutes");
// app.use("/api/questions", questionRoutes);

// test route
app.get("/", (req, res) => {
    res.send("Prashikshan API Running");
});

// ✅ Port
const PORT = process.env.PORT || 5000;

// ✅ DB + Server start
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    });
})
.catch(err => console.log(err));