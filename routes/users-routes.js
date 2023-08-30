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

// view pdfs
router.get(
  "/approved_materials/:level",
  authenticateToken,
  user.approvedMaterials
);

// view pdfs awaiting approval
router.get(
  "/pending_materials/:level",
  authenticateToken,
  user.pendingMaterials
);

// approves the pdf file
router.patch("/approve_material", authenticateToken, user.approveMaterial);

// disapproves the pdf file
router.delete(
  "/disapprove_material",
  authenticateToken,
  user.disapproveMaterial
);

// view Pending Materials for a course
router.get(
  "/pending_materials/:uploadstatus/:session/:course",
  authenticateToken,
  user.pendingMatsCourse
);
module.exports = router;
