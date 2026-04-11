const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

// (Add later)
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);


// ✅ Test route
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