const pool = require("../../../../../../db");

exports.viewStudentProfile = async (req, res) => {
  try {
    const { student } = req.params;
    const query = `
    SELECT
    s.student_id,
    s.sch_session_id,
    s.student_email,
    s.student_mat_no,
    s.student_fname,
    s.student_mname,
    s.student_lname,
    s.student_role,
    s.student_about,
    s.student_photo,
    s.student_phone,
    s.student_state,
    ss.sch_session
     FROM 
     students AS s
     LEFT JOIN
     sch_sessions AS ss ON s.sch_session_id = ss.sch_session_id
    WHERE s.student_id = $1
    GROUP BY
    s.student_id,
    s.sch_session_id,
    s.student_email,
    s.student_mat_no,
    s.student_fname,
    s.student_mname,
    s.student_lname,
    s.student_role,
    s.student_about,
    s.student_photo,
    s.student_phone,
    s.student_state,
    ss.sch_session
    `;
    const userExists = await pool.query(query, [student]);
    if (userExists.rows.length === 0)
      return res.status(404).json("No student found...");
    return res.status(200).json(userExists.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
