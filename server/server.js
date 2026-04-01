const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());

const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);


app.get("/", (req, res) => {
    res.send("Prashikshan API Running");
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    });
})
.catch(err => console.log(err));
