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
      SELECT 
      messages.message_id,
      messages.conversation_id,
      messages.sender_id,
      messages.message_text,
      messages.message_media,
      messages.sent_at
      FROM messages
      LEFT JOIN conversations
      ON
      messages.conversation_id = conversations.conversation_id
      WHERE 
      conversations.user1_id = $1 AND conversations.user2_id = $2 
      OR 
      conversations.user1_id = $2 AND conversations.user2_id = $1
      GROUP BY
      messages.message_id,
      messages.conversation_id,
      messages.sender_id,
      messages.message_text,
      messages.message_media,
      messages.sent_at
      ORDER BY (messages.sent_at) ASC
          `;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [sender, receiver]);

    // if (rows.length === 0) {
    //   return res.status(404).json("No messages in this chat");
    // }

    return res.status(200).json({
      msg: rows,
      partner: participant.rows[0],
    });
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};

exports.getConversations = async (req, res) => {
  try {
    const user = req.user;
    // Define the SQL query to get conversation
    const query = `
    WITH LastMessage AS (
      SELECT DISTINCT ON (c.conversation_id)
        c.conversation_id,
        m.sender_id,
        m.message_text,
        m.message_media,
        m.message_media_id,
        m.delete_message,
        m.seen,
        m.sent_at,
        c.user1_id,
        c.user2_id
      FROM conversations c
      LEFT JOIN messages m ON c.conversation_id = m.conversation_id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.conversation_id, m.sent_at DESC
    )
    SELECT
      lm.conversation_id,
      lm.message_text,
      lm.message_media,
      lm.message_media_id,
      lm.delete_message,
      lm.seen,
      lm.sent_at,
      CASE
        WHEN lm.user1_id = $1 THEN other_user.student_fname
        ELSE sender_user.student_fname
      END AS other_user_fname,
      CASE
        WHEN lm.user1_id = $1 THEN other_user.student_lname
        ELSE sender_user.student_lname
      END AS other_user_lname,
      CASE
        WHEN lm.user1_id = $1 THEN other_user.student_id
        ELSE sender_user.student_id
      END AS other_user_id
    FROM LastMessage lm
    LEFT JOIN students sender_user ON lm.sender_id = sender_user.student_id
    LEFT JOIN students other_user ON (
      (lm.user1_id = $1 AND lm.user2_id = other_user.student_id) OR
      (lm.user2_id = $1 AND lm.user1_id = other_user.student_id)
    )        
`;

    // Execute the SQL query with the search criteria
    const { rows } = await pool.query(query, [user]);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};
