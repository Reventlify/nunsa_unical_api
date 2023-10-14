const pool = require("../../../../../../db");

exports.candidateApply = async (req, res) => {
  try {
    const user = req.user;
    const { candidate_role } = req.body;

    const userDetails = await pool.query(
      `SELECT * FROM students WHERE student_id = $1`,
      [user]
    );
    const student_role = userDetails.rows[0].student_role;

    // Check if the student can apply based on their role
    const ineligibleRoles = ["president", "vice president", "developer", "eleco"];
    if (ineligibleRoles.includes(student_role)) {
      return res
        .status(400)
        .json("You are not allowed to apply for a candidate role.");
    }

    // Check if the election status is 'pending'
    const electionStatusQuery = await pool.query(
      "SELECT election_id, sch_session_id FROM elections WHERE election_status = 'pending' ORDER BY election_date DESC LIMIT 1"
    );
    const election = electionStatusQuery.rows;

    if (election.length === 0) {
      return res.status(400).json("Cannot apply. No election in progress.");
    }
    const election_id = electionStatusQuery.rows[0].election_id;

    const duesQuery = await pool.query(
      `SELECT * FROM dues WHERE student_id = $1 AND dues_status = 'cleared'`,
      [user]
    );

    if (duesQuery.rows.length === 0) {
      return res
        .status(400)
        .json("Cannot apply. You need to pay your dues. 🙄");
    }

    const candidateExistence = await pool.query(
      `SELECT * FROM candidates WHERE candidate_id = $1 AND election_id = $2`,
      [user, election_id]
    );
    if (candidateExistence.rows.length > 0) {
      return res
        .status(400)
        .json(
          "Cannot apply. You have applied for a role already. how many things do you want to do boss? 🙄"
        );
    }
    const branded = String(candidate_role).trim();
    // Insert candidate application into the candidates table
    const insertCandidateQuery = await pool.query(
      "INSERT INTO candidates (election_id, candidate_id, candidate_role, candidate_status) VALUES ($1, $2, $3, $4) RETURNING *",
      [election_id, user, branded.toLowerCase(), "pending"]
    );

    return res.status(200).json(insertCandidateQuery.rows);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Something went wrong.");
  }
};

exports.appplicationCheck = async (req, res) => {
  try {
    const user = req.user;
    // Check if the election status is 'pending'
    const electionStatusQuery = await pool.query(
      "SELECT election_id, sch_session_id FROM elections WHERE election_status = 'pending' ORDER BY election_date DESC LIMIT 1"
    );
    const election = electionStatusQuery.rows;

    if (election.length === 0) {
      return res.status(400).json("Cannot apply. No election in progress.");
    }
    const election_id = electionStatusQuery.rows[0].election_id;

    const candidateExistence = await pool.query(
      `SELECT * FROM candidates WHERE candidate_id = $1 AND election_id = $2`,
      [user, election_id]
    );

    return res.status(200).json(candidateExistence.rows);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Something went wrong.");
  }
};
