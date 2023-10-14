const pool = require("../../../../../../db");
const { getElectionResults } = require("../../../../../../utilities/capNsmalz");

exports.electionResults = async (req, res) => {
  try {
    const voterId = req.user;
    // Get the election ID with status 'pending'
    const electionQuery = await pool.query(
      "SELECT election_id FROM elections WHERE election_status = 'pending' OR election_status = 'started' OR election_status = 'concluded'"
    );

    if (electionQuery.rows.length === 0) {
      return res.status(400).json({
        message: "No election in progress.",
      });
    }

    const electionId = electionQuery.rows[0].election_id;

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
      president: president,
      vPresident: vPresident,
      finSec: finSec,
      genSec: genSec,
      treasurer: treasurer,
      dirOfWelfare: dirOfWelfare,
      dirOfSocials: dirOfSocials,
      dirOfSports: dirOfSports,
      dirOfHealth: dirOfHealth,
      dirOfInfo: dirOfInfo,
    });
    // return res.status(200).json(president.rows)
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Internal server error.");
  }
};
