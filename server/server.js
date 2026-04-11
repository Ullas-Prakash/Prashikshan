const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//require("dotenv").config();

const app = express();

<<<<<<< HEAD
// ✅ Middleware
=======
// ✅ VERY IMPORTANT — middleware FIRST
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// ✅ Routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

// (Add later)
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);


// ✅ Test route
=======
// ✅ THEN routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

// const questionRoutes = require("./routes/questionRoutes");
// app.use("/api/questions", questionRoutes);

// test route
>>>>>>> 42ff518863b2bcb019098237e8fcb9b250791707
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