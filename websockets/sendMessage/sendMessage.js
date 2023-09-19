const dayjs = require("dayjs");
const pool = require("../../db");
const { conversationID, messageID } = require("../../utilities/IDGenerator");
const { createConversation } = require("./messageHelpers/createConversation");
const { saveMessage } = require("./messageHelpers/saveMessage");
const { getNotifications } = require("../../utilities/capNsmalz");

exports.sendMessage = async (msg, receiver_id, sender_id) => {
  try {
    const receiverExists = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [receiver_id]
    );
    if (receiverExists.rows === 0) return "No receiver";
    const conversationExists = await pool.query(
      "SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2 OR user1_id = $2 AND user2_id = $1",
      [sender_id, receiver_id]
    );

    // checks for conversation
    if (conversationExists.rows.length === 0) {
      const conversationCreated = await createConversation(
        sender_id,
        receiver_id
      );
      const savedMessage = await saveMessage(
        conversationCreated.rows[0].conversation_id,
        sender_id,
        msg
      );

      // on failed to save
      if (savedMessage.rows.length === 0) {
        return {
          delivered: false,
          notifications: null,
          savedMessage: null,
        };
      }
      const newNotification = await getNotifications(receiver_id);
      // on successful save
      return {
        delivered: true,
        notifications: newNotification.notifications,
        savedMessage: savedMessage.rows[0],
      };
    }
    const savedMessage = await saveMessage(
      conversationExists.rows[0].conversation_id,
      sender_id,
      msg
    );
    const newNotification = await getNotifications(receiver_id);
    // on failed to save
    if (savedMessage.rows.length === 0) {
      return {
        delivered: false,
        notifications: null,
        savedMessage: null,
      };
    }
    // on successful save
    return {
      delivered: true,
      notifications: newNotification.notifications,
      savedMessage: savedMessage.rows[0],
    };
  } catch (error) {
    return console.log(error.message);
  }
};
