const pool = require("../../../db");

exports.markRead = async (user, convo) => {
  try {
    await pool.query(
      `update messages set seen = 'yes' where seen = 'no' 
          and conversation_id = $1
          and sender_id != $2
          `,
      [convo, user]
    );

    return "marked";
  } catch (error) {
    console.log(error);
  }
};
