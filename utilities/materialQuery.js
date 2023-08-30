const pool = require("../db");

exports.get_materials_for_a_course = async (
  uploadstatus,
  session,
  course_abbr,
  course_code
) => {
  try {
    const materials = await pool.query(
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
        WHERE materials.uploadstatus = $1 AND
        materials.material_id LIKE $2 AND
        materials.course_abbr = $3 AND materials.course_code = $4
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
        ORDER BY (materials.uploadedat) DESC
        `,
      [uploadstatus, `${session}%`, `${course_abbr}`, `${course_code}`]
    );
    return materials;
  } catch (error) {
    return console.console.log(error);
  }
};

exports.get_materials_for_a_level = async (uploadstatus, level) => {
  try {
    const materials = await pool.query(
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
      [uploadstatus, level]
    );
    return materials;
  } catch (error) {
    return console.console.log(error);
  }
};
