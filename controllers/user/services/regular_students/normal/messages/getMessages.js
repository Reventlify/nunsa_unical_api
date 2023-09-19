const pool = require("../../../../../../db");
const { getNotifications } = require("../../../../../../utilities/capNsmalz");

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

    if (rows.length !== 0) {
      await pool.query(
        `update messages set seen = 'yes' where seen = 'no' 
        and conversation_id = $1
        and sender_id != $2
        `,
        [rows[0].conversation_id, user]
      );
    }

    const notifications = await getNotifications(user);
    return res.status(200).json({
      msg: rows,
      notifications: notifications.notifications,
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

    const details = await getNotifications(user);

    // Return the combined response with rows and notifications count
    return res
      .status(200)
      .json({ rows: details.rows, notifications: details.notifications });
  } catch (error) {
    console.error("Error executing database query:", error);
    return res.status(500).json("Something went wrong");
  }
};
