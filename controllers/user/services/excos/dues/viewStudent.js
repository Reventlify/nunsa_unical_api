const pool = require("../../../../../db");

exports.viewStudent = async (req, res) => {
  const user = req.user;
  // const permissions = req.permissions;
  try {
    const studentRole = await pool.query(
      "SELECT student_id, student_role FROM students WHERE student_id = $1",
      [user]
    );

    if (studentRole.rows.length === 0) return res.status(400).json("Not found");

    if (studentRole.rows[0].student_role !== "member")
      return res.status(400).json("Bad guy");

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
    s.student_phone,
    s.student_address,
    s.student_city,
    s.student_state,
    ss.sch_session,
    COUNT(d.student_id) AS total_dues
    FROM
    students AS s
    LEFT JOIN
    sch_sessions AS ss ON s.sch_session_id = ss.sch_session_id
    LEFT JOIN
    dues AS d ON s.student_id = d.student_id
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
    s.student_phone,
    s.student_address,
    s.student_city,
    s.student_state,
    ss.sch_session
    ORDER BY
    s.student_fname ASC,  -- Ascending order by first name
    s.student_mname ASC,  -- Ascending order by middle name
    s.student_lname ASC;  -- Ascending order by last name

    `;
    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};

exports.seeThroughStudents = async (req, res) => {
  try {
    const user = req.user;
    const { student } = req.params;
    // const permissions = req.permissions;
    const studentRole = await pool.query(
      "SELECT student_id, student_role FROM students WHERE student_id = $1",
      [user]
    );

    if (studentRole.rows.length === 0) return res.status(400).json("Not found");

    if (studentRole.rows[0].student_role === "member")
      return res.status(400).json("Bad guy");

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
    s.student_photo,
    s.student_about,
    s.student_phone,
    s.student_address,
    s.student_city,
    s.student_state,
    ss.sch_session,
    COUNT(d.student_id) AS total_dues
    FROM
    students AS s
    LEFT JOIN
    sch_sessions AS ss ON s.sch_session_id = ss.sch_session_id
    LEFT JOIN
    dues AS d ON s.student_id = d.student_id
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
    s.student_photo,
    s.student_about,
    s.student_phone,
    s.student_address,
    s.student_city,
    s.student_state,
    ss.sch_session
    `;
    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [student]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
