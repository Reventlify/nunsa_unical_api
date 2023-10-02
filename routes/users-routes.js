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
// gets messages
router.get("/get_messages/:participants", authenticateToken, user.getMessages);
// gets conversations
router.get("/get_conversations", authenticateToken, user.getConversations);
/* Messaging APIs ends */

/* Profile APIs begins */
router.patch("/upload_dp", authenticateToken, user.uploadDP);
router.get(
  "/student_profile/:student",
  authenticateToken,
  user.viewStudentProfile
);
router.patch("/edit_about", authenticateToken, user.editAbout);
/* Profile APIs ends */

/* Post APIs begins */
router.post("/postupload", authenticateToken, user.postUpload);
router.get("/getposts/:session", authenticateToken, user.getPosts);
router.get("/searchposts/:searchTerm", authenticateToken, user.searchForPosts);
router.post("/posts/:postId/comment", authenticateToken, user.comment);
router.get("/posts/:postId/comment", authenticateToken, user.queryComments);
router.post(
  "/posts/:postId/comment/:comment_action",
  authenticateToken,
  user.commentAction
);
/* Post APIs ends */

/* Dues services begins */
router.get("/exco/get_students", authenticateToken, user.viewStudent);
router.get(
  "/exco/get_students/:student",
  authenticateToken,
  user.seeThroughStudents
);
router.get("/exco/get_students/:student/dues", authenticateToken, user.getDues);
router.post(
  "/exco/clear_students/:student/dues",
  authenticateToken,
  user.clearDues
);
/* Dues services ends */

/* Election APIs begins */
router.post("/exco/create_election", authenticateToken, user.createElection);
router.get("/get_election", authenticateToken, user.getCurrentElection);
router.get("/verify_eleco/:eleco", authenticateToken, user.getNewElecoDetails);
/* Election APIs ends */

module.exports = router;
