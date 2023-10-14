const pool = require("../../../../../db");
const moment = require("moment");
const { electionID } = require("../../../../../utilities/IDGenerator");
const {
  getTimeStamp,
  currentTimestamp,
} = require("../../../../../utilities/capNsmalz");
const {
  year_to_session_converter,
} = require("../../../../../utilities/schoolSession");

exports.electionCreation = async (req, res) => {
  try {
    const { eleco, start_date, start_time } = req.body;
    const president = req.user;
    const currentSession = await pool.query(
      `select * from sch_sessions order by sch_session desc limit 1`
    );
    const session = currentSession.rows[0].sch_session;

    const electionRunning = await pool.query(
      `SELECT * FROM elections WHERE election_status = 'pending' or election_status = 'started' or election_status = 'concluded'`
    );
    // checks if there is a current election running
    if (electionRunning.rows.length !== 0)
      return res
        .status(400)
        .json(
          "Can not create a new election when there is a current election running."
        );

    const start_date_timestamp = getTimeStamp(
      moment(start_date).format("MM/DD/YYYY")
    );
    const current_timestamp = currentTimestamp();

    // checks if the user selected a date that is not the future.
    // if (start_date_timestamp <= current_timestamp)
    //   return res
    //     .status(400)
    //     .json(
    //       "You have to select a date that is not the past or present, we only travel to the future. 😉"
    //     );

    const president_details = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [president]
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

    // refines the session string to e.g 16/17
    const refinedSession = await year_to_session_converter(session);

    const session_details = await pool.query(
      "SELECT * FROM sch_sessions WHERE sch_session = $1",
      [refinedSession]
    );

    const eleco_details = await pool.query(
      "SELECT * FROM students WHERE student_mat_no = $1",
      [eleco]
    );

    // carries on with the action if the user is not the Pres or VP
    if (
      eleco_details.rows[0].student_role !== "president" &&
      eleco_details.rows[0].student_role !== "vice president" &&
      eleco_details.rows[0].student_role !== "developer"
    ) {
      const createEleco = `
          INSERT INTO elections(
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
        moment(start_date).format("YYYY-MM-DD"),
        start_time,
        "pending",
      ]);

      const must = await pool.query(
        "UPDATE students SET student_role = 'eleco' WHERE student_mat_no = $1",
        [eleco]
      );

      return res.status(200).json({
        election: refinedSession,
        eleco,
        start_date,
        start_time,
      });
    }

    // If the president is trying to make himself/herself or his/her VP the electoral chairman.
    // or vice president(vise versa above)
    return res
      .status(400)
      .json("You can not make yourself the electoral chairman..");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
