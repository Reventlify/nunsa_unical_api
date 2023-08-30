const pool = require("../../../../../../db");
const {
  get_materials_for_a_course,
} = require("../../../../../../utilities/materialQueryForACourse");

exports.viewMaterialsPending = async (req, res) => {
  try {
    const { level } = req.params;
    const permissions = req.permissions;
    if (permissions.approvePDF)
      return res
        .status(400)
        .json(
          "You are not authorized to view materials waiting to be approved."
        );
    const pendingMaterials = await pool.query(
      `
      SELECT 
      sch_sessions.sch_session,
      materials.material_id,
      students.student_email,
      students.student_fname,
      students.student_mname,
      students.student_lname,
      students.student_mat_no,
      materials.level_year,
      materials.material_media,
      materials.course_code,
      materials.course_abbr,
      materials.topic,
      materials.lecturer,
      materials.uploadstatus,
      materials.uploadedat
      FROM materials 
      LEFT JOIN sch_sessions 
      ON 
      materials.sch_session_id = sch_sessions.sch_session_id
      LEFT JOIN students 
      ON 
      materials.uploadedby = students.student_id
      WHERE materials.uploadstatus = $1 AND materials.level_year = $2
      GROUP BY 
	    students.student_id,
      sch_sessions.sch_session,
      materials.material_id,
      students.student_email,
      students.student_fname,
      students.student_mname,
      students.student_lname,
      students.student_mat_no,
      materials.level_year,
      materials.material_media,
      materials.course_code,
      materials.course_abbr,
      materials.topic,
      materials.lecturer,
      materials.uploadstatus,
      materials.uploadedat
      ORDER BY LEFT(sch_sessions.sch_session, 2) DESC, (materials.topic) ASC
      `,
      ["pending", level]
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
    const { uploadstatus, session, course } = req.params;
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

exports.viewMaterialsApproved_courseCodeOnly = async (req, res) => {
  try {
    return;
  } catch (error) {
    return;
  }
};

exports.viewMaterialsApproved = async (req, res) => {
  try {
    return;
  } catch (error) {
    return;
  }
};
