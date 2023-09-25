const pool = require("../../../../../../db");

exports.checkCurrentElection = async (req, res) => {
  try {
    const currentElectionQuery = `
      SELECT * FROM elections WHERE election_status = 'pending'
    `;
    const { rows } = await pool.query(currentElectionQuery);
    return res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};
