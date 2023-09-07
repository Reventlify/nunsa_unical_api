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
