const pool = require("../../../../../db");
const { electionID } = require("../../../../../utilities/IDGenerator");
const {
  getTimeStamp,
  currentTimestamp,
} = require("../../../../../utilities/capNsmalz");
const {
  year_to_session_converter,
} = require("../../../../../utilities/schoolSession");

const electionCreation = async (req, res) => {
  try {
    const { eleco, session, start_date, start_time } = req.body;
    const president = req.user;

    const start_date_timestamp = getTimeStamp(start_date);
    const current_timestamp = currentTimestamp();

    console.log(`Is ${start_date_timestamp} <= ${current_timestamp}.`);

    // checks if the user selected a date that is not the future.
    if (start_date_timestamp <= current_timestamp)
      return res
        .status(400)
        .json(
          "You have to select a date that is not the past or present, we only travel to the future. 😉"
        );

    const president_details = await pool.query(
      "SELECT * FROM students WHERE students_id = $1",
      [president]
    );

    // If the student making the request is not the president
    if (president_details.rows[0].student_role !== "president")
      return res
        .status(400)
        .json("You are not authorized to perform this action.");

    // refines the session string to e.g 16/17
    const refinedSession = year_to_session_converter(session);

    const session_details = await pool.query(
      "SELECT * FROM sch_sessions WHERE sch_session = $1",
      [refinedSession]
    );

    const eleco_details = await pool.query(
      "SELECT * FROM students WHERE students_id = $1",
      [eleco]
    );

    // carries on with the action if the user is not the Pres or VP
    if (
      eleco_details.rows[0].student_role !== "president" &&
      eleco_details.rows[0].student_role !== "vice president"
    ) {
      const createEleco = `
          INSERT INTO messages(
            election_id,
            sch_session_id,
            eleco,
            election_date,
            election_time,
            election_status
          ) VALUES(
            $1, $2, $3, $4, $5, $6
          ) RETURNING *
        `;

      const { rows } = await pool.query(createEleco, [
        await electionID(),
        session_details.rows[0].sch_session_id,
        eleco_details.rows[0].student_id,
        start_date,
        start_time,
        "pending",
      ]);

      await pool.query(
        "UPDATE students SET student_role = $1 WHERE student_id = $2",
        ["eleco", eleco]
      );

      return res.status(200).json({
        election: refinedSession,
        eleco,
        start_date,
        start_time,
      });
    }

    // If the president is trying to make himself or any of his executives the electoral
    // the electoral chairman .
    return res
      .status(400)
      .json(
        "You can not make yourself or any of your executives the electoral chairman."
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};