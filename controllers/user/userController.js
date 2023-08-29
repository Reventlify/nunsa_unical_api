const {
  approveAMaterial,
} = require("./services/regular_students/course_rep/materialApproval/materialApproval");
const {
  viewMaterialsPending,
} = require("./services/regular_students/normal/materialDisplay/materialDisplay");
const {
  materialUpload,
} = require("./services/regular_students/normal/materialUpload/materialUpload");

// uploads pdf
exports.uploadMaterial = materialUpload;

// view pdfs awaiting approval
exports.pendingMaterials = viewMaterialsPending;

// approves the pdf file
exports.approveMaterial = approveAMaterial;
