const pool = require("../../../../../db");

exports.getStudents = async (req, res) => {
  try {
    const query = `SELECT student_id, student_fname, student_lname, student_photo FROM students`;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json("No student found");
    }

    return res.status(200).json(rows);
    // return res.status(200).json("No student found");
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};

exports.getStudentsExceptSeeker = async (req, res) => {
  try {
    const { seeker } = req.params;
    const query = `SELECT student_id, student_fname, student_lname, student_photo FROM students WHERE student_id <> $1`;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [seeker]);

    if (rows.length === 0) {
      return res.status(404).json("No student found");
    }

    return res.status(200).json(rows);
    // return res.status(200).json("No student found");
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};
