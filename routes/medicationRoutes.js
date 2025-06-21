const express = require('express');
const authenticateToken = require('../middleware/auth')
const { markMedicationAsTaken, addMedication, getMedication,getHistory } = require("../controllers/medicationController");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();
const db = require('../db')


router.post("/mark",authenticateToken, upload.single("image"), markMedicationAsTaken);
router.get("/history/:userId",authenticateToken, getHistory);
router.post("/add",authenticateToken, addMedication)
router.get("/get/:userId",authenticateToken, getMedication)

module.exports = router;


