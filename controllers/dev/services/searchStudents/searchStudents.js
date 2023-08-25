const pool = require("../../../../db");

exports.searchStudents = async (req, res) => {
  try {
    const { searchInput } = req.body;
    const searchResult = await pool.query(`
      SELECT 
      student_id, student_fname, student_lname, 
      student_mat_no FROM students WHERE
      student_mat_no like $1
      OR
      student_fname like $1
      OR
      student_mname like $1
      OR
      student_lname like $1
      ORDER BY (student_fname, student_lname) ASC;
    `, [`${searchInput.toLowerCase()}%`]);
    return res.status(200).json(searchResult.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong");
  }
};
