const {
  viewMaterialsPending,
} = require("./services/regular_students/normal/materialDisplay/materialDisplay");
const {
  materialUpload,
} = require("./services/regular_students/normal/materialUpload/materialUpload");

exports.uploadMaterial = materialUpload;
exports.pendingMaterials = viewMaterialsPending;
