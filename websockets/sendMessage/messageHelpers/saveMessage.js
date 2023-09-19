const dayjs = require("dayjs");
const pool = require("../../../db");
const { messageID } = require("../../../utilities/IDGenerator");

exports.saveMessage = async (conversation_id, sender_id, msg) => {
  try {
    const saveMessageAction = await pool.query(
      `
        INSERT INTO messages(
          message_id,
          conversation_id,
          sender_id,
          message_text,
          delete_message,
          seen,
          sent_at
        ) VALUES(
          $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
        ) RETURNING *
      `,
      [await messageID(), conversation_id, sender_id, msg, "no", "no"]
    );

    return saveMessageAction;
  } catch (error) {
    console.log(error);
    return "Failed to create";
  }
};
