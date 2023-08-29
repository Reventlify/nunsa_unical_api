//packages and utilities and APIs
require("dotenv").config();
const router = require("express").Router();
const user = require("../controllers/user/userController");
const authenticateToken = require("../utilities/authenticateToken");
//router
const { Router } = require("express");
// send code for email verification

// uploads pdf
router.post("/upload_material", authenticateToken, user.uploadMaterial);

// view pdfs awaiting approval
router.get(
  "/pending_materials/:level",
  authenticateToken,
  user.pendingMaterials
);

// approves the pdf file
router.patch("/approve_material", authenticateToken, user.approveMaterial);
module.exports = router;
