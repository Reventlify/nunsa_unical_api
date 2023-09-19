const pool = require("../db");
const {
  postCommentsID,
  postLikesID,
  postDislikesID,
  postCommentDislikesID,
  postCommentLikesID,
} = require("./IDGenerator");

exports.neat = function (yourName) {
  let firstChar = yourName.slice(0, 1);
  firstChar = firstChar.toUpperCase();
  let restChar = yourName.slice(1, yourName.length);
  restChar = restChar.toLowerCase();
  const newName = firstChar + restChar;

  return newName;
};

exports.levelHandler = (level) => {
  let refinedLevel;
  if (typeof level === "string") {
    const isANumber_from_1_to_5 = /[12345]/.test(level);
    if (level.length === 1 && isANumber_from_1_to_5) {
      refinedLevel = `${level}00`;
      return refinedLevel;
    } else if (
      level.length === 3 &&
      /[12345]/.test(level.slice(0, 1)) &&
      /[0]/.test(level.slice(1, 2)) &&
      /[0]/.test(level.slice(2, 3))
    ) {
      refinedLevel = level;
      return refinedLevel;
    } else if (
      level.length === 6 &&
      /[12345]/.test(level.slice(-1)) &&
      level.slice(0, 4).toLowerCase() === "year" &&
      (level.slice(4, 5) === "_" || level.slice(4, 5) === " ")
    ) {
      refinedLevel = `${level.slice(-1)}00`;
      return refinedLevel;
    } else {
      return "Syntax error: Please enter year_X or year X, or X00 or X. Where X is a number from 1 to 5.";
    }
  }
  return "Syntax error: Please enter a string for the level or year";
};

exports.materialNameHandler = async (name, session_id) => {
  try {
    const material_name = await pool.query(
      "SELECT * FROM materials WHERE topic like $1 AND sch_session_id = $2",
      [`${name.toLowerCase()}%`, session_id]
    );
    if (material_name.rows.length === 0) {
      return name.toLowerCase();
    } else if (material_name.rows.length === 2) {
      if (/[1234567890]/.test(name.slice(-1))) {
        const refinery = 1;
        const refined = `${name.slice(
          0,
          name.length
        )}_${refinery}`.toLowerCase();
        return refined;
      } else {
        return `${name}_1`;
      }
    } else {
      const refinery = material_name.rows.length - 1;
      const refined = `${name.slice(0, name.length)}_${refinery}`.toLowerCase();
      return refined;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.postActionHandler = async (action, postID, userID, comment) => {
  try {
    if (action.toLowerCase() === "comment") {
      // Insert the comment
      const insertCommentQuery = {
        text: `
      INSERT INTO post_comments (comment_id, student_id, post_id, comment_text, comment_date)
      VALUES ($1, $2, $3, $4, NOW())
    `,
        values: [await postCommentsID(), userID, postID, comment],
      };

      // Execute the INSERT query
      await pool.query(insertCommentQuery);
      return "done";
    } else if (action.toLowerCase() === "like") {
      // Insert the comment
      const likePostQuery = `
        DO $$ 
        BEGIN 
          -- Check if the student exists in post_dislikes
          IF EXISTS (SELECT 1 FROM post_dislikes WHERE student_id = '${userID}' AND post_id = '${postID}') THEN
            -- Student exists in post_dislikes, delete the student
            DELETE FROM post_dislikes WHERE student_id = '${userID}' AND post_id = '${postID}';
            RAISE NOTICE 'Student deleted from post_dislikes';
          END IF;
        
          -- Check if the student exists in post_likes
          IF EXISTS (SELECT 1 FROM post_likes WHERE student_id = '${userID}' AND post_id = '${postID}') THEN
          -- Student exists in post_likes, delete the student
          DELETE FROM post_likes WHERE student_id = '${userID}' AND post_id = '${postID}';
            RAISE NOTICE 'Student exists in post_likes';
          ELSE
            -- Student does not exist in post_likes, insert the student
            INSERT INTO post_likes (like_id, student_id, post_id, like_date)
            VALUES ('${await postLikesID()}', '${userID}', '${postID}', NOW());
            RAISE NOTICE 'Student inserted into post_likes';
          END IF;
        END $$;      
    `;

      // Execute the INSERT query
      await pool.query(likePostQuery);
      return "done";
    } else if (action.toLowerCase() === "dislike") {
      // Insert the comment
      const disLikePostQuery = `
        DO $$ 
        BEGIN 
          -- Check if the student exists in post_likes
          IF EXISTS (SELECT 1 FROM post_likes WHERE student_id = '${userID}' AND post_id = '${postID}') THEN
            -- Student exists in post_likes, delete the student
            DELETE FROM post_likes WHERE student_id = '${userID}' AND post_id = '${postID}';
            RAISE NOTICE 'Student deleted from post_likes';
          END IF;
        
          -- Check if the student exists in post_dislikes
          IF EXISTS (SELECT 1 FROM post_dislikes WHERE student_id = '${userID}' AND post_id = '${postID}') THEN
          -- Student exists in post_dislikes, delete the student
          DELETE FROM post_dislikes WHERE student_id = '${userID}' AND post_id = '${postID}';
            RAISE NOTICE 'Student exists in post_dislikes';
          ELSE
            -- Student does not exist in post_dislikes, insert the student
            INSERT INTO post_dislikes (dislike_id, student_id, post_id, dislike_date)
            VALUES ('${await postDislikesID()}', '${userID}', '${postID}', NOW());
            RAISE NOTICE 'Student inserted into post_dislikes';
          END IF;
        END $$;
    `;

      // Execute the INSERT query
      await pool.query(disLikePostQuery);
      return "done";
    } else if (action.toLowerCase() === "like_comment") {
      const likeCommentQuery = `
  DO $$ 
  BEGIN 
    -- Check if the student exists in comment_dislikes
    IF EXISTS (SELECT 1 FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_dislikes, delete the student
      DELETE FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_dislikes';
    END IF;

    -- Check if the student exists in comment_likes
    IF EXISTS (SELECT 1 FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_likes, delete the student
      DELETE FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_likes';
    ELSE
      -- Student does not exist in comment_likes, insert the student
      INSERT INTO comment_likes (like_id, student_id, comment_id, like_date)
      VALUES ('${await commentLikesID()}', '${userID}', '${commentID}', NOW());
      RAISE NOTICE 'Student inserted into comment_likes';
    END IF;
  END $$;      
`;
    } else {
      return console.log(`
      postActionHandler error: Action not recognized, 
      postActionHandler only accepts - comment, like, dislike actions.
      `);
    }
  } catch (error) {
    return console.log(error);
  }
};
exports.commentActionHandler = async (action, userID, commentID) => {
  try {
    if (action.toLowerCase() === "like_comment") {
      const likeCommentQuery = `
  DO $$ 
  BEGIN 
    -- Check if the student exists in comment_dislikes
    IF EXISTS (SELECT 1 FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_dislikes, delete the student
      DELETE FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_dislikes';
    END IF;

    -- Check if the student exists in comment_likes
    IF EXISTS (SELECT 1 FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_likes, delete the student
      DELETE FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_likes';
    ELSE
      -- Student does not exist in comment_likes, insert the student
      INSERT INTO comment_likes (like_id, student_id, comment_id, like_date)
      VALUES ('${await postCommentLikesID()}', '${userID}', '${commentID}', NOW());
      RAISE NOTICE 'Student inserted into comment_likes';
    END IF;
  END $$;      
`;
      // Execute the INSERT query
      await pool.query(likeCommentQuery);
      return "done";
    } else if (action.toLowerCase() === "dislike_comment") {
      const disLikeCommentQuery = `
  DO $$ 
  BEGIN 
    -- Check if the student exists in comment_likes
    IF EXISTS (SELECT 1 FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_likes, delete the student
      DELETE FROM comment_likes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_likes';
    END IF;

    -- Check if the student exists in comment_dislikes
    IF EXISTS (SELECT 1 FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}') THEN
      -- Student exists in comment_dislikes, delete the student
      DELETE FROM comment_dislikes WHERE student_id = '${userID}' AND comment_id = '${commentID}';
      RAISE NOTICE 'Student deleted from comment_dislikes';
    ELSE
      -- Student does not exist in comment_dislikes, insert the student
      INSERT INTO comment_dislikes (dislike_id, student_id, comment_id, dislike_date)
      VALUES ('${await postCommentDislikesID()}', '${userID}', '${commentID}', NOW());
      RAISE NOTICE 'Student inserted into comment_dislikes';
    END IF;
  END $$;      
`;
      // Execute the INSERT query
      await pool.query(disLikeCommentQuery);
      return "done";
    } else {
      return console.log(`
      commentActionHandler error: Action not recognized, 
      commentActionHandler only accepts - like_comment, dislike_comment actions.
      `);
    }
  } catch (error) {
    return console.log(error);
  }
};

exports.getNotifications = async (userID) => {
  try {
    // Define the SQL query to get conversation
    const conversationQuery = `
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
        CASE
          WHEN c.user1_id = $1 THEN c.user2_id
          ELSE c.user1_id
        END AS other_user_id
      FROM conversations c
      LEFT JOIN messages m ON c.conversation_id = m.conversation_id
      WHERE
        (c.user1_id = $1 AND c.user2_id != $1) OR
        (c.user1_id != $1 AND c.user2_id = $1)
      ORDER BY c.conversation_id, m.sent_at DESC
    )
    SELECT
      lm.conversation_id,
      lm.sender_id,
      lm.message_text,
      lm.message_media,
      lm.message_media_id,
      lm.delete_message,
      lm.seen,
      lm.sent_at,
      other_user.student_fname AS other_user_fname,
      other_user.student_lname AS other_user_lname,
      other_user.student_photo AS other_user_photo,
      lm.other_user_id
    FROM LastMessage lm
    LEFT JOIN students other_user ON lm.other_user_id = other_user.student_id
    `;

    // Define the SQL query to get notifications
    const notificationsQuery = `
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
        CASE
          WHEN c.user1_id = $1 THEN c.user2_id
          ELSE c.user1_id
        END AS other_user_id
      FROM conversations c
      LEFT JOIN messages m ON c.conversation_id = m.conversation_id
      WHERE
        (c.user1_id = $1 AND c.user2_id != $1) OR
        (c.user1_id != $1 AND c.user2_id = $1)
      ORDER BY c.conversation_id, m.sent_at DESC
    )
    SELECT *
    FROM LastMessage lm
    LEFT JOIN students other_user ON lm.other_user_id = other_user.student_id
    WHERE lm.seen = 'no' AND lm.sender_id != $1
    ORDER BY lm.sent_at DESC
    `;

    // Execute the first SQL query to get conversation rows
    const { rows } = await pool.query(conversationQuery, [userID]);

    // Execute the second SQL query to get notifications
    const notifications = await pool.query(notificationsQuery, [userID]);

    return {
      rows,
      notifications: notifications.rows.length,
    };
  } catch (error) {
    return console.log(error);
  }
};
