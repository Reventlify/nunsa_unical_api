//packages and utilities and APIs
require("dotenv").config();
const router = require("express").Router();
//router
const { Router } = require("express");
const dev = require("../controllers/dev/devController");

// login user
router.get("/homepage", dev.homepage);

// login user
router.post("/search_students", dev.searchStudents);

module.exports = router;
