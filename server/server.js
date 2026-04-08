const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//require("dotenv").config();

require("dotenv").config();

const app = express();

// ✅ VERY IMPORTANT — middleware FIRST
app.use(cors());
app.use(express.json());   // 🔥 THIS LINE IS KEY

// ✅ THEN routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

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
  });
})
.catch(err => console.log(err));