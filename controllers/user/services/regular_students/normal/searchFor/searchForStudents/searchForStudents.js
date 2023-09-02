exports.searchForStudents = async (req, res) => {
  try {
    const { searchfor } = req.params;

    // Define the SQL query to search for a student
    const query = `
    SELECT student_id, student_fname, student_lname, student_photo FROM students WHERE 
    student_fname ILIKE $1 OR
	student_lname ILIKE $1 OR
    (student_fname || ' ' || student_mname) ILIKE $1 OR
    (student_fname || ' ' || student_lname) ILIKE $1 OR
	(student_lname || ' ' || student_fname) ILIKE $1 OR
    (student_fname || ' ' || student_mname || ' ' || student_lname) ILIKE $1 OR
    (student_lname || ' ' || student_mname || ' ' || student_fname) ILIKE $1 OR
    student_mat_no ILIKE $1
        `;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [`%${searchfor}%`]);

    if (rows.length === 0) {
      return res.status(404).json("Student not found");
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error executing database query:", error);
    res.status(500).json("Something went wrong");
  }
};
