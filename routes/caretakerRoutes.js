const express = require("express");
const authenticateToken = require('../middleware/auth')
const {getSummery} = require('../controllers/medicationController')
const db = require("../db");

const router = express.Router();

router.get("/patient/:userId/summary", authenticateToken,getSummery);

module.exports = router;
