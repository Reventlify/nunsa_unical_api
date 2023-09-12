const pool = require("../../../../../db");
const { duesID } = require("../../../../../utilities/IDGenerator");
const {
  sessionIncrementor,
} = require("../../../../../utilities/schoolSession");

exports.clearDues = async (req, res) => {
  try {
    const user = req.user;
    const { student } = req.params;
    const { number } = req.body;
    // const permissions = req.permissions;
    const studentRole = await pool.query(
      "SELECT student_id, student_role FROM students WHERE student_id = $1",
      [user]
    );

    if (studentRole.rows.length === 0) return res.status(400).json("Not found");

    // if (studentRole.rows[0].student_role !== "member")
    if (studentRole.rows[0].student_role !== "president")
      // if (studentRole.rows[0].student_role !== "financial secretary")
      return res.status(400).json("Bad guy");

    const student_session = await pool.query(
      `  
        SELECT s.student_id, s.student_fname, s.student_lname, ss.sch_session FROM
        students AS s
        JOIN
        sch_sessions AS ss
        ON
        s.sch_session_id = ss.sch_session_id
        WHERE
        s.student_id = $1;
`,
      [student]
    );

    if (student_session.rows.length === 0)
      return res.status(400).json("Not found");

    const theSession = sessionIncrementor(
      student_session.rows[0].sch_session,
      Number(number)
    );
    const insertDuesQuery = `
    INSERT INTO dues(
        dues_id,
        sch_session,
        student_id,
        cleared_by,
        dues_status
    ) VALUES($1, $2, $3, $4, $5)
    `;

    const insertDues = await pool.query(insertDuesQuery, [
      await duesID(),
      theSession,
      student,
      user,
      "cleared",
    ]);

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
    return res.status(200).json({
      student_name: `${student_session.rows[0].student_fname} ${student_session.rows[0].student_lname}`,
      rows: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
