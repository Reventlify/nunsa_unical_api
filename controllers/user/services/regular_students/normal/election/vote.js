const pool = require("../../../../../../db");
const { getElectionResults } = require("../../../../../../utilities/capNsmalz");

exports.voteForCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.body;
    console.log(candidate_id);
    const voterId = req.user;
    // Get the election ID with status 'pending'
    // const electionQuery = await pool.query(
    //   "SELECT election_id FROM elections WHERE election_status = $1",
    //   ["pending"]
    // );

    // if (electionQuery.rows.length === 0) {
    //   return res
    //     .status(400)
    //     .json("Invalid election ID or the election is not in progress.");
    // }
    // Get the election ID with status 'pending'
    const electionQuery1 = await pool.query(
      "SELECT * FROM elections WHERE election_status = $1",
      ["started"]
    );

    if (electionQuery1.rows.length === 0) {
      return res.status(400).json("election has not started come back later.");
    }

    const electionId = electionQuery1.rows[0].election_id;
    // Check if the candidate is valid
    const candidateQuery = await pool.query(
      "SELECT * FROM candidates WHERE candidate_id = $1",
      [candidate_id]
    );

    if (candidateQuery.rows.length === 0) {
      return res.status(400).json("Invalid candidate ID.");
    }

    // Check if the student has paid at least one due
    const duesQuery = await pool.query(
      "SELECT * FROM dues WHERE student_id = $1 LIMIT 1",
      [voterId]
    );

    if (duesQuery.rows.length === 0) {
      return res
        .status(400)
        .json("You need to pay at least one due before voting.");
    }

    const votedBefore = await pool.query(
      `
      SELECT
      c.candidate_role,
      v.voter_id,
      COUNT(*) AS count_of_votes
  FROM
      students s
  INNER JOIN
      votes v ON s.student_id = v.voter_id
  INNER JOIN
      candidates c ON v.candidate_id = c.candidate_id
  WHERE
      c.candidate_role = $2
      AND v.voter_id = $1
  GROUP BY
      c.candidate_role, v.voter_id;
    `,
      [voterId, candidateQuery.rows[0].candidate_role]
    );

    if (votedBefore.rows.length > 0) {
      return res.status(400).json("You can't vote in this cathegory again");
    }
    // Cast the vote
    const voteQuery = await pool.query(
      "INSERT INTO votes (election_id, candidate_id, voter_id, votedat) VALUES ($1, $2, $3, $4)",
      [electionId, candidate_id, voterId, new Date()]
    );
    const president = await getElectionResults(
      "president",
      electionId,
      voterId
    );
    const vPresident = await getElectionResults(
      "vice president",
      electionId,
      voterId
    );
    const finSec = await getElectionResults(
      "financial secretary",
      electionId,
      voterId
    );
    const genSec = await getElectionResults(
      "general secretary",
      electionId,
      voterId
    );
    const treasurer = await getElectionResults(
      "treasurer",
      electionId,
      voterId
    );
    const dirOfWelfare = await getElectionResults(
      "director of welfare",
      electionId,
      voterId
    );
    const dirOfSocials = await getElectionResults(
      "director of socials",
      electionId,
      voterId
    );
    const dirOfSports = await getElectionResults(
      "director of sports",
      electionId,
      voterId
    );
    const dirOfHealth = await getElectionResults(
      "director of health",
      electionId,
      voterId
    );
    const dirOfInfo = await getElectionResults(
      "director of information",
      electionId,
      voterId
    );

    return res.status(200).json({
      president: president.rows,
      vPresident: vPresident.rows,
      finSec: finSec.rows,
      genSec: genSec.rows,
      treasurer: treasurer.rows,
      dirOfWelfare: dirOfWelfare.rows,
      dirOfSocials: dirOfSocials.rows,
      dirOfSports: dirOfSports.rows,
      dirOfHealth: dirOfHealth.rows,
      dirOfInfo: dirOfInfo.rows,
    });

    // return res.status(200).json("Vote cast successfully.");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Internal server error.");
  }
};
