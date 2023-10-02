const pool = require("../../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { levelDeterminant } = require("../../../utilities/schoolSession");
const { getNotifications } = require("../../../utilities/capNsmalz");

//login begin
exports.logger = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Email Check
    const users = await pool.query(
      `
      SELECT 
      sch_sessions.sch_session,
      students.student_email,
      students.student_photo,
      students.student_role,
      students.student_fname,
      students.student_mname,
      students.student_lname,
      students.student_about,
      students.student_id,
      students.student_mat_no,
      students.student_password
      FROM students 
      LEFT JOIN sch_sessions 
      ON 
      students.sch_session_id = sch_sessions.sch_session_id
      WHERE students.student_email = $1
      GROUP BY 
      sch_sessions.sch_session,
      students.student_email,
      students.student_photo,
      students.student_role,
      students.student_fname,
      students.student_mname,
      students.student_lname,
      students.student_about,
      students.student_id,
      students.student_mat_no,
      students.student_password;
      `,
      [email]
    );
    if (users.rows.length === 0)
      return res.status(401).json("Email is incorrect!");

    //Password Check
    const validPassword = await bcrypt.compare(
      password,
      users.rows[0].student_password
    );
    if (!validPassword) return res.status(401).json("Incorrect password!");

    //JWT
    const user_session = users.rows[0].sch_session;
    const user_mat_no = users.rows[0].student_mat_no;
    const user_email = users.rows[0].student_email;
    const user_fname = users.rows[0].student_fname;
    const user_mname = users.rows[0].student_mname;
    const user_lname = users.rows[0].student_lname;
    const user_id = users.rows[0].student_id;
    const photo = users.rows[0].student_photo;
    const about = users.rows[0].student_about;
    const user_role = users.rows[0].student_role;

    const notDetails = await getNotifications(user_id);
    const user_permissions =
      // permissions for normal members
      user_role === "member"
        ? {
            electionCo: false,
            election: false,
            blockClass: false,
            blockGen: false,
            approveBlog: false,
            viewStudents: false,
            clearDues: false,
            approvePDF: false,
          }
        : // permissions for class rep
        user_role === "course rep"
        ? {
            electionCo: false,
            election: false,
            blockClass: true,
            blockGen: false,
            approveBlog: false,
            viewStudents: false,
            clearDues: false,
            approvePDF: true,
          }
        : // permissions for the presidents
        user_role === "president" || user_role === "vice president"
        ? {
            electionCo: false,
            election: true,
            blockClass: true,
            blockGen: true,
            approveBlog: true,
            viewStudents: true,
            clearDues: user_role === "president" ? true : false,
            approvePDF: true,
          }
        : // permissions for eleco chair
        user_role === "eleco"
        ? {
            electionCo: true,
            election: true,
            blockClass: false,
            blockGen: false,
            approveBlog: false,
            viewStudents: true,
            clearDues: false,
            approvePDF: false,
          }
        : // permissions for developer
          user_role === "developer"
          ? {
              electionCo: true,
              election: true,
              blockClass: true,
              blockGen: true,
              approveBlog: true,
              viewStudents: true,
              clearDues: false,
              approvePDF: true,
            }
          // permissions for other executives
          :
          {
            electionCo: false,
            election: false,
            blockClass: true,
            blockGen: true,
            approveBlog: true,
            viewStudents: true,
            clearDues: false,
            approvePDF: true,
          };
    const token = jwt.sign(
      {
        user_id,
        user_mat_no,
        user_session,
        user_email,
        user_fname,
        user_mname,
        user_lname,
        user_permissions,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "60m",
      }
    );
    const expiresAt = jwt.decode(token);
    // gets user level
    const level = await levelDeterminant(user_session);

    return res.status(200).json({
      auth: true,
      expiresAt: expiresAt.exp,
      user: {
        token: token,
        user_id,
        user_mat_no,
        user_session,
        user_email,
        user_fname,
        user_mname,
        user_lname,
        user_role,
        photo,
        about,
        level,
        user_permissions,
        notifications:
          notDetails.notifications > 0 ? notDetails.notifications : null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong.");
  }
};
