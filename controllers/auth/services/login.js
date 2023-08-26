const pool = require("../../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//login begin
exports.logger = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Email Check
    const users = await pool.query(
      `SELECT * FROM students WHERE student_email = $1`,
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
    const user_email = users.rows[0].student_email;
    const user_fname = users.rows[0].student_fname;
    const user_mname = users.rows[0].student_mname;
    const user_lname = users.rows[0].student_lname;
    const user_id = users.rows[0].student_id;
    const user_permissions =
      // permissions for normal members
      users.rows[0].student_role === "member"
        ? {
            election: false,
            blockClass: false,
            blockGen: false,
            approveBlog: false,
            approvePDF: false,
          }
        : // permissions for class rep
        users.rows[0].student_role === "class rep"
        ? {
            election: false,
            blockClass: true,
            blockGen: false,
            approveBlog: false,
            approvePDF: true,
          }
        : // permissions for the presidents
        users.rows[0].student_role === "pres" ||
          users.rows[0].student_role === "v_pres"
        ? {
            election: true,
            blockClass: true,
            blockGen: true,
            approveBlog: true,
            approvePDF: true,
          }
        : // permissions for eleco chair
        users.rows[0].student_role === "eleco"
        ? {
            election: true,
            blockClass: false,
            blockGen: false,
            approveBlog: false,
            approvePDF: false,
          }
        : // permissions for other executives
          {
            election: false,
            blockClass: true,
            blockGen: true,
            approveBlog: true,
            approvePDF: true,
          };
    const token = jwt.sign(
      {
        user_id,
        user_email,
        user_fname,
        user_mname,
        user_lname,
        user_permissions,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "55m",
      }
    );
    return res.status(200).json({
      auth: true,
      user: {
        token: token,
        user_email,
        user_fname,
        user_mname,
        user_lname,
        user_permissions,
      },
    });
  } catch (error) {
    return res.status(500).json("Something went wrong.");
  }
};
