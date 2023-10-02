const pool = require("../../../../../db");

exports.verifyStudentMat = async (req, res) => {
  try {
    const { eleco } = req.params;
    const user = req.user;
    const newEleco = eleco.replace("_", "/");
    const president_details = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [user]
    );
    // If the student making the request is not the president or vice president
    if (
      president_details.rows[0].student_role !== "president" &&
      president_details.rows[0].student_role !== "vice president" &&
      president_details.rows[0].student_role !== "developer"
    )
      return res
        .status(400)
        .json("You are not authorized to perform this action.");
    const eleco_details = await pool.query(
      "SELECT * FROM students WHERE student_mat_no = $1",
      [newEleco]
    );

    // If the eleco is not found
    if (eleco_details.rows.length === 0)
      return res
        .status(400)
        .json("Student does not exist..");
    // If the eleco is the president or vice president
    if (
      eleco_details.rows[0].student_role === "president" ||
      eleco_details.rows[0].student_role === "vice president" ||
      eleco_details.rows[0].student_role === "developer"
    )
      return res
        .status(400)
        .json("You can not make yourself the electoral chairman..");

    // success
    return res
      .status(200)
      .json(
        `${eleco_details.rows[0].student_fname} ${eleco_details.rows[0].student_lname}`
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
