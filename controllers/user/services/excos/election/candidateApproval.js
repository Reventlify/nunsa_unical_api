const pool = require("../../../../../db");
const nodemailer = require("nodemailer");
const { startWithCase } = require("../../../../../utilities/capNsmalz");

exports.approveCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.body;
    const elecoId = req.user; // Assuming req.user contains the student ID

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

    return res
      .status(200)
      .json(
        "Candidate application approved successfully. Email sent to the candidate."
      );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Internal server error.");
  }
};
