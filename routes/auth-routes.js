//packages and utilities and APIs
require("dotenv").config();
const router = require("express").Router();
const auth = require("../controllers/auth/authController");
//router
const { Router } = require("express");

// send code for email verification
router.post("/sendcode", auth.sendCode);

// send code for email verification
router.post("/verifyemail", auth.verifyEmail);

// registers user
router.post("/register", auth.register);

// login user
router.post("/login", auth.login);

module.exports = router;
