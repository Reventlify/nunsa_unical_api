const pool = require("../../db");


/**
 * This is a function that handles voting of candidates
 *
 * @param {string} candidate_id - The candidate ID.
 * @returns {number} - 200: success, !200: failure
 */
exports.vote = async(candidate_id) => {
  try {
    // Get the election ID with status 'pending'
    const electionQuery = await pool.query(
      "SELECT election_id FROM elections WHERE election_status = $1",
      ["pending"]
    );

    if (electionQuery.rows.length === 0) return 400;

    const electionId = electionQuery.rows[0].election_id;
    const voterId = req.user; // Assuming req.user contains the student ID

    // Check if the voter is a student
    const voterDetails = await pool.query(
      `SELECT * FROM students WHERE student_id = $1`,
      [voterId]
    );

    if (voterDetails.rows.length === 0) return 400;

    // Check if the candidate is valid
    const candidateQuery = await pool.query(
      "SELECT * FROM candidates WHERE candidate_id = $1",
      [candidate_id]
    );

    if (candidateQuery.rows.length === 0) return 400;

    // Cast the vote
    const voteQuery = await pool.query(
      "INSERT INTO votes (election_id, candidate_id, voter_id, votedat) VALUES ($1, $2, $3, $4)",
      [electionId, candidate_id, voterId, new Date()]
    );

    return 200;
  } catch (error) {
    console.error("Vote Error:", error);
    return 500;
  }
};
