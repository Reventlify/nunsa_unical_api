const pool = require("../../../../../../db");

exports.editAbout = async (req, res) => {
  try {
    const user = req.user;
    const { msg } = req.body;
    // updates the database
    const about = await pool.query(
      "UPDATE students SET student_about = $1 WHERE student_id = $2 RETURNING student_about",
      [msg, user]
    );
    return res.status(200).json(about.rows[0].student_about);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
