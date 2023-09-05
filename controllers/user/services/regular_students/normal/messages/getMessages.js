const pool = require("../../../../../../db");

exports.getMessages = async (req, res) => {
  try {
    const { participants } = req.params;
    const user = req.user;
    const who = participants.split("_");
    const whoIs = (a, b) => {
      if (user === a) {
        return {
          sender: a,
          receiver: b,
        };
      } else if (user === b) {
        return {
          sender: b,
          receiver: a,
        };
      } else {
        return null;
      }
    };

    if (whoIs(who[0], who[1]) === null) {
      return res.status(400).json("You are a bad student 😒");
    }
    const sender = whoIs(who[0], who[1]).sender;
    const receiver = whoIs(who[0], who[1]).receiver;

    const participant = await pool.query(
      "SELECT student_id, student_photo, student_fname, student_lname FROM students WHERE student_id = $1",
      [receiver]
    );

    if (participant.rows === 0) {
      return res.status(400).json("You are a bad student 😒");
    }

    // Define the SQL query to get conversation
    const query = `
    WITH RankedMessages AS (
      SELECT
        m.conversation_id,
        m.sender_id,
        m.message_text,
        m.message_media,
        m.message_media_id,
        m.delete_message,
        m.seen,
        m.sent_at,
        ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.sent_at DESC) AS row_num,
        c.user1_id AS user1,
        c.user2_id AS user2
      FROM
        messages m
        INNER JOIN conversations c ON m.conversation_id = c.conversation_id
      WHERE
        c.user1_id = $1 OR c.user2_id = $1
    )
    SELECT DISTINCT ON (rm.conversation_id)
      rm.conversation_id,
      rm.sender_id,
      rm.message_text,
      rm.message_media,
      rm.message_media_id,
      rm.delete_message,
      rm.seen,
      rm.sent_at,
      CASE
        WHEN rm.sender_id = $1 THEN other_user.student_fname
        ELSE sender_user.student_fname
      END AS other_user_fname,
      CASE
        WHEN rm.sender_id = $1 THEN other_user.student_lname
        ELSE sender_user.student_lname
      END AS other_user_lname,
      CASE
        WHEN rm.sender_id = $1 THEN
          CASE
            WHEN rm.user1 = $1 THEN rm.user2
            ELSE rm.user1
          END
        ELSE
          CASE
            WHEN rm.user1 = $1 THEN rm.user1
            ELSE rm.user2
          END
      END AS other_user_id
    FROM
      RankedMessages rm
      LEFT JOIN students sender_user ON rm.sender_id = sender_user.student_id
      LEFT JOIN students other_user ON (rm.user1 = other_user.student_id OR rm.user2 = other_user.student_id)
    WHERE
      rm.row_num = 1
`;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [user]);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};
