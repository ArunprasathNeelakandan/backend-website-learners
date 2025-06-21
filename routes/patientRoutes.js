const authenticateToken = require('../middleware/auth')
const db = require("../db");

const express = require("express");
const router = express.Router();

const {getPadients} =  require('../controllers/patientsController')

router.get("/get", authenticateToken, getPadients);

module.exports = router;