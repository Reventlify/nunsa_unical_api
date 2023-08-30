const {
  get_materials_for_a_course,
  get_materials_for_a_level,
} = require("../../../../../../utilities/materialQuery");

exports.viewMaterialsPending = async (req, res) => {
  try {
    const { level } = req.params;
    const uploadstatus = "pending";
    const permissions = req.permissions;
    if (permissions.approvePDF)
      return res
        .status(400)
        .json(
          "You are not authorized to view materials waiting to be approved."
        );
    const pendingMaterials = await get_materials_for_a_level(
      uploadstatus,
      level
    );
    if (pendingMaterials.rows.length === 0)
      return res.status(202).json("No pending materials");
    return res.status(200).json(pendingMaterials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};
exports.viewMaterialsPendingForACourse = async (req, res) => {
  try {
    const { session, course } = req.params;
    const uploadstatus = "pending";
    const courseParts = course.split("_");
    const course_abbr = courseParts[0];
    const course_code = courseParts[1];
    const permissions = req.permissions;
    if (permissions.approvePDF)
      return res
        .status(400)
        .json(
          "You are not authorized to view materials waiting to be approved."
        );

    const materials = await get_materials_for_a_course(
      uploadstatus,
      session,
      course_abbr,
      course_code
    );
    if (materials.rows.length === 0) return res.status(202).json([]);
    return res.status(200).json(materials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};

exports.viewMaterialsApproved = async (req, res) => {
  try {
    const { level } = req.params;
    const uploadstatus = "approved";
    const approvedMaterials = await get_materials_for_a_level(
      uploadstatus,
      level
    );
    if (approvedMaterials.rows.length === 0)
      return res.status(202).json("No material available");
    return res.status(200).json(approvedMaterials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};

exports.viewMaterialsApprovedForACourse = async (req, res) => {
  try {
    const { session, course } = req.params;
    const uploadstatus = "approved";
    const courseParts = course.split("_");
    const course_abbr = courseParts[0];
    const course_code = courseParts[1];

    const materials = await get_materials_for_a_course(
      uploadstatus,
      session,
      course_abbr,
      course_code
    );
    if (materials.rows.length === 0) return res.status(202).json([]);
    return res.status(200).json(materials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};
