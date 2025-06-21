
const express = require("express");
const cors = require("cors");

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const medicationRoutes = require("./routes/medicationRoutes");
const caretakerRoutes = require("./routes/caretakerRoutes")
const patientRoutes = require("./routes/patientRoutes")


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



app.use('/api/auth', authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/caretaker",caretakerRoutes)
app.use("/api/patients",patientRoutes)





app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
