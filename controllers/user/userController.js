const { clearDues } = require("./services/excos/dues/clearDues");
const { getDues } = require("./services/excos/dues/getDues");
const {
  viewStudent,
  seeThroughStudents,
} = require("./services/excos/dues/viewStudent");
const { approveCandidate, getCandidates } = require("./services/excos/election/candidateApproval");
const {
  electionCreation,
} = require("./services/excos/election/electionCreation");
const { verifyStudentMat } = require("./services/excos/students/verifyStudent");
const {
  approveAMaterial,
  materialNotApproved,
} = require("./services/regular_students/course_rep/materialApproval/materialApproval");
const {
  candidateApply, appplicationCheck,
} = require("./services/regular_students/normal/election/candidateApply");
const {
  checkCurrentElection,
} = require("./services/regular_students/normal/election/checksCurrentElection");
const { electionResults } = require("./services/regular_students/normal/election/getVotes");
const { voteForCandidate } = require("./services/regular_students/normal/election/vote");
const {
  getStudents,
  getStudentsExceptSeeker,
} = require("./services/regular_students/normal/getStudents");
const {
  viewMaterialsPending,
  viewMaterialsPendingForACourse,
  viewMaterialsApproved,
  viewMaterialsApprovedForACourse,
} = require("./services/regular_students/normal/materialDisplay/materialDisplay");
const {
  materialUpload,
} = require("./services/regular_students/normal/materialUpload/materialUpload");
const {
  getMessages,
  getConversations,
} = require("./services/regular_students/normal/messages/getMessages");
const {
  commentAction,
} = require("./services/regular_students/normal/posts/comment/commentAction/commentAction");
const {
  comment,
} = require("./services/regular_students/normal/posts/comment/make_comment/comment");
const {
  queryComments,
} = require("./services/regular_students/normal/posts/comment/reply_comment/comment_query");
const {
  postQuery,
} = require("./services/regular_students/normal/posts/postUpload/postQuery");
const {
  postUpload,
} = require("./services/regular_students/normal/posts/postUpload/postUpload");
const {
  searchForPosts,
} = require("./services/regular_students/normal/posts/postUpload/searchForPosts");
const {
  editAbout,
} = require("./services/regular_students/normal/profile/editAbout");
const {
  uploadDP,
} = require("./services/regular_students/normal/profile/uploadDP");
const {
  viewStudentProfile,
} = require("./services/regular_students/normal/profile/viewStudentProfile");
const {
  searchForStudents,
} = require("./services/regular_students/normal/searchFor/searchForStudents/searchForStudents");

/* General services begins */
// gets all students
exports.getStudents = getStudents;
// gets all students except seeker
exports.getStudentsExceptSeeker = getStudentsExceptSeeker;
// searches for students
exports.searchForStudents = searchForStudents;
/* General services ends */

/* Materials services begins */
// uploads pdf
exports.uploadMaterial = materialUpload;

// view pdfs
exports.approvedMaterials = viewMaterialsApproved;

// view pdfs awaiting approval
exports.pendingMaterials = viewMaterialsPending;

// approves the pdf file
exports.approveMaterial = approveAMaterial;

// disapproves the pdf file
exports.disapproveMaterial = materialNotApproved;

// view Materials for a course
exports.approvedMatsCourse = viewMaterialsApprovedForACourse;

// view Pending Materials for a course
exports.pendingMatsCourse = viewMaterialsPendingForACourse;
/* Materials services ends */

/* Messaging services begins */
// gets messages
exports.getMessages = getMessages;
// gets conversations
exports.getConversations = getConversations;
/* Messaging services ends */

/* Profile services begins */
exports.uploadDP = uploadDP;
exports.viewStudentProfile = viewStudentProfile;
exports.editAbout = editAbout;
/* Profile services ends */

/* Post services begins */
exports.postUpload = postUpload;
exports.getPosts = postQuery;
exports.searchForPosts = searchForPosts;
exports.comment = comment;
exports.queryComments = queryComments;
exports.commentAction = commentAction;
/* Post services ends */

/* Dues services begins */
exports.viewStudent = viewStudent;
exports.seeThroughStudents = seeThroughStudents;
exports.getDues = getDues;
exports.clearDues = clearDues;
/* Dues services ends */

/* Election services begins */
exports.createElection = electionCreation;
exports.getCurrentElection = checkCurrentElection;
exports.getNewElecoDetails = verifyStudentMat;
exports.getCandidates = getCandidates;
exports.candidateApply = candidateApply;
exports.appplicationCheck = appplicationCheck;
exports.candidateApproval = approveCandidate;
exports.electionResults = electionResults;
exports.vote = voteForCandidate;
/* Election services ends */
