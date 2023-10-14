const pool = require("../../db");
const { getElectionResults } = require("../../utilities/capNsmalz");

exports.getVotes = async () => {
  try {
    // Get the election ID with status 'pending'
    const electionQuery = await pool.query(
      "SELECT election_id FROM elections WHERE election_status = $1",
      ["pending"]
    );

    if (electionQuery.rows.length === 0) return [];

    const electionId = electionQuery.rows[0].election_id;

    const president = await getElectionResults("president", electionId);
    const vPresident = await getElectionResults("vice president", electionId);
    const finSec = await getElectionResults("financial secretary", electionId);
    const genSec = await getElectionResults("general secretary", electionId);
    const treasurer = await getElectionResults("treasurer", electionId);
    const dirOfWelfare = await getElectionResults(
      "director of welfare",
      electionId
    );
    const dirOfSocials = await getElectionResults(
      "director of socials",
      electionId
    );
    const dirOfSports = await getElectionResults(
      "director of sports",
      electionId
    );
    const dirOfHealth = await getElectionResults(
      "director of health",
      electionId
    );
    const dirOfInfo = await getElectionResults(
      "director of information",
      electionId
    );

    return [
      president,
      vPresident,
      finSec,
      genSec,
      treasurer,
      dirOfWelfare,
      dirOfSocials,
      dirOfSports,
      dirOfHealth,
      dirOfInfo,
    ];
  } catch (error) {
    console.error("getVotes Error:", error);
    return [];
  }
};
