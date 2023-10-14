const pool = require("../../../../../db");
const nodemailer = require("nodemailer");
const { startWithCase } = require("../../../../../utilities/capNsmalz");

exports.approveCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.body;
    const elecoId = req.user;
    // Check if the election status is 'pending'
    const electionStatusQuery = await pool.query(
      `SELECT election_id, sch_session_id FROM elections WHERE election_status = 'pending' ORDER BY election_date DESC LIMIT 1`
    );
    const election = electionStatusQuery.rows;

    if (election.length === 0) {
      return res.status(400).json("No election in progress.");
    }
    const election_id = electionStatusQuery.rows[0].election_id;

    // Check if the student has the 'eleco' role
    const userDetails = await pool.query(
      `SELECT student_role FROM students WHERE student_id = $1`,
      [elecoId]
    );
    const student_role = userDetails.rows[0].student_role;

    if (student_role !== "eleco") {
      return res
        .status(400)
        .json("You are not authorized to approve candidates.");
    }

    // Fetch candidate's email and role by joining candidates and students tables
    const candidateInfo = await pool.query(
      `SELECT candidates.candidate_id, students.student_email, candidates.candidate_role
       FROM candidates
       INNER JOIN students
       ON candidates.candidate_id = students.student_id
       WHERE candidates.candidate_id = $1`,
      [candidate_id]
    );

    const candidateEmail = candidateInfo.rows[0].student_email;
    const candidateRole = candidateInfo.rows[0].candidate_role;

    // Update candidate status to 'approved'
    await pool.query(
      "UPDATE candidates SET candidate_status = 'approved' WHERE candidate_id = $1",
      [candidate_id]
    );

    // Send an email to the candidate with a customized subject
    const transport = nodemailer.createTransport({
      host: "eleven.qservers.net",
      secure: true,
      port: 465,
      auth: {
        user: "info@nunsaunical.com.ng",
        pass: process.env.MAIL,
      },
    });

    const mailOptions = {
      from: "NUNSA UCC <info@nunsaunical.com.ng>",
      to: candidateEmail,
      subject: `Your ${startWithCase(
        candidateRole
      )} Candidate Application Approval`,
      text: "Congratulations! Your candidate application has been approved.",
    };

    await transport.sendMail(mailOptions);

    const president = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'president'`,
      [election_id]
    );
    const vPresident = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'vice president'`,
      [election_id]
    );
    const finSec = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'financial secretary'`,
      [election_id]
    );
    const genSec = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'general secretary'`,
      [election_id]
    );
    const treasurer = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'treasurer'`,
      [election_id]
    );
    const dirOfWelfare = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of welfare'`,
      [election_id]
    );
    const dirOfSocials = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of socials'`,
      [election_id]
    );
    const dirOfSports = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of sports'`,
      [election_id]
    );
    const dirOfHealth = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of health'`,
      [election_id]
    );
    const dirOfInfo = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of information'`,
      [election_id]
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
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Something went wrong.");
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const user = req.user;
    // Check if the election status is 'pending'
    const electionStatusQuery = await pool.query(
      `SELECT election_id, sch_session_id FROM elections WHERE election_status = 'pending' ORDER BY election_date DESC LIMIT 1`
    );
    const election = electionStatusQuery.rows;

    if (election.length === 0) {
      return res.status(400).json("No election in progress.");
    }
    const election_id = electionStatusQuery.rows[0].election_id;
    const president = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'president'`,
      [election_id]
    );
    const vPresident = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'vice president'`,
      [election_id]
    );
    const finSec = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'financial secretary'`,
      [election_id]
    );
    const genSec = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'general secretary'`,
      [election_id]
    );
    const treasurer = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'treasurer'`,
      [election_id]
    );
    const dirOfWelfare = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of welfare'`,
      [election_id]
    );
    const dirOfSocials = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of socials'`,
      [election_id]
    );
    const dirOfSports = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of sports'`,
      [election_id]
    );
    const dirOfHealth = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of health'`,
      [election_id]
    );
    const dirOfInfo = await pool.query(
      `SELECT
    c.candidate_id,
    c.candidate_role,
    c.candidate_status,
    CONCAT(s.student_fname, ' ', s.student_lname) AS candidate_name FROM candidates c
  LEFT JOIN
    students s ON c.candidate_id = s.student_id
     WHERE c.election_id = $1 and c.candidate_role = 'director of information'`,
      [election_id]
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
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Something went wrong.");}
};
