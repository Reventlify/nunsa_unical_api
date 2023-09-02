//packages and utilities and APIs
require("dotenv").config();
const router = require("express").Router();
const user = require("../controllers/user/userController");
const authenticateToken = require("../utilities/authenticateToken");
//router
const { Router } = require("express");

/* General APIs begins */
// searches for students
router.get("/get_students", user.getStudents);
// gets all students except seeker
router.get("/get_students/:seeker", user.getStudentsExceptSeeker);
// searches for students
router.get("/search_for_students/:searchfor", user.searchForStudents);
/* General APIs ends */

/* Materials APIs begins */
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

// view Materials for a course
router.get(
  "/approved_materials/:session/:course",
  authenticateToken,
  user.approvedMatsCourse
);

// view Pending Materials for a course
router.get(
  "/pending_materials/:session/:course",
  authenticateToken,
  user.pendingMatsCourse
);
/* Materials APIs ends */

/* Messaging APIs begins */
/* Messaging APIs ends */

/* Profile APIs begins */
/* Profile APIs ends */

/* Post APIs begins */
/* Post APIs ends */

/* Election APIs begins */
/* Election APIs ends */

module.exports = router;
