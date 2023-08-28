//packages and utilities and APIs
require("dotenv").config();
const router = require("express").Router();
const user = require("../controllers/user/userController");
const authenticateToken = require("../utilities/authenticateToken");
//router
const { Router } = require("express");
// send code for email verification
router.post("/upload_material", authenticateToken, user.uploadMaterial);
router.get("/pending_materials/:level", authenticateToken, user.pendingMaterials);
module.exports = router;
