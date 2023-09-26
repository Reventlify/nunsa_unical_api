const pool = require("../../../../../../db");

exports.checkCurrentElection = async (req, res) => {
  try {
    const currentElectionQuery = `
    SELECT 
    e.election_id,
    s.sch_session,
    s.sch_session_id,
    e.eleco,
    u.student_fname,
    u.student_lname,
    e.election_date,
    e.election_time,
    e.election_status FROM elections e
    LEFT JOIN sch_sessions s
    ON e.sch_session_id = s.sch_session_id
    LEFT JOIN students u
    ON e.eleco = u.student_id
    WHERE e.election_status = 'pending'
    GROUP BY
    e.election_id,
    s.sch_session,
    s.sch_session_id,
    e.eleco,
    u.student_fname,
    u.student_lname,
    e.election_date,
    e.election_time,
    e.election_status
    `;
    const { rows } = await pool.query(currentElectionQuery);
    return res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};
