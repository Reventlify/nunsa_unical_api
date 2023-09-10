const pool = require("../../../../../db");

exports.getDues = async (req, res) => {
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
    d.*,
    s.student_fname,
    s.student_mname,
    s.student_lname,
    ss.sch_session
    FROM
    dues AS d
    JOIN
    students AS s
    ON
    d.student_id = s.student_id
    JOIN
    sch_sessions AS ss
    ON
    d.sch_session = ss.sch_session
    WHERE
    d.student_id = $1
    ORDER BY
    LEFT(ss.sch_session, 2) DESC;

      `;
    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [student]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
