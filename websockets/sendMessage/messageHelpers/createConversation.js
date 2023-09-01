const pool = require("../../../db");
const { conversationID } = require("../../../utilities/IDGenerator");

exports.createConversation = async (sender_id, receiver_id) => {
  try {
    const createConversationAction = await pool.query(
      `
            INSERT INTO conversations(
              conversation_id,
              user1_id,
              user2_id
            ) VALUES(
              $1, $2, $3
            ) RETURNING *
        `,
      [await conversationID(), sender_id, receiver_id]
    );

    return createConversationAction;
  } catch (error) {
    console.log(error);
    return "Failed to create";
  }
};
