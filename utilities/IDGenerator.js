const pool = require("../db");
const randomString = require("random-string");

// generates sessions
exports.sessionID = async () => {
  // generates sessions ID string
  let id = randomString({
    length: 8,
    numeric: true,
    letters: false,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM sch_sessions WHERE sch_session_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return sessionID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates students IDs
exports.clientID = async () => {
  // generates students ID
  let id = randomString({
    length: 10,
    numeric: true,
    letters: false,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return clientID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates conversation IDs
exports.conversationID = async () => {
  // generates conversation ID
  let id = randomString({
    length: 10,
    numeric: true,
    letters: false,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM conversations WHERE conversation_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return conversationID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates students IDs
exports.messageID = async () => {
  // generates students ID
  let id = randomString({
    length: 16,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM messages WHERE message_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return messageID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};

// generates material IDs
exports.materialID = async (sessionPrefix, level) => {
  // generates material ID
  let id = randomString({
    length: 10,
    numeric: true,
    letters: false,
    special: false,
  });
  const begin = sessionPrefix.slice(0, 2);
  const end = sessionPrefix.slice(-2);
  try {
    // Checks if the ID already exists
    const checker = await pool.query(
      "SELECT * FROM materials WHERE material_id = $1",
      [`${begin}_${end}_${id}_${level}`]
    );

    if (checker.rows.length !== 0) {
      return materialID(sessionPrefix, level);
    } else {
      // Return Unique ID
      return `${begin}_${end}_${id}_${level}`;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postID = async () => {
  // generates students ID
  let id = randomString({
    length: 16,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query("SELECT * FROM posts WHERE post_id = $1", [
      id,
    ]);

    if (checker.rows.length !== 0) {
      return postID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postLikesID = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM post_likes WHERE like_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postLikesID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postDislikesID = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM post_dislikes WHERE dislike_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postDislikesID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentsID = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM post_comments WHERE comment_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentsID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentLikesID = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM comment_likes WHERE like_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentLikesID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentDislikesID = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM comment_dislikes WHERE dislike_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentDislikesID();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentReplies = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM comment_replies WHERE reply_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentReplies();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentReplyLikes = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM reply_likes WHERE like_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentReplyLikes();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
// generates posts IDs
exports.postCommentReplyDislikes = async () => {
  // generates students ID
  let id = randomString({
    length: 18,
    numeric: true,
    letters: true,
    special: false,
  });
  try {
    const checker = await pool.query(
      "SELECT * FROM reply_dislikes WHERE dislike_id = $1",
      [id]
    );

    if (checker.rows.length !== 0) {
      return postCommentReplyDislikes();
    } else {
      return id;
    }
  } catch (error) {
    return console.log(error);
  }
};
