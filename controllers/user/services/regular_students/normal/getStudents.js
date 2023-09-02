exports.getStudents = async (req, res) => {
  try {
    const query = `SELECT student_id, student_fname, student_lname, student_photo FROM students`;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json("Student not found");
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};
