const pool = require("../../../../../../../../db");
const {
  postCommentsID,
} = require("../../../../../../../../utilities/IDGenerator");

exports.comment = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const { studentOpinion } = req.body;
    console.log(postId);
    console.log(studentOpinion);

    // // Insert the comment into the 'post_comments' table
    // const commentQuery = `
    //     INSERT INTO post_comments (comment_id, student_id, post_id, comment_text, comment_date)
    //     VALUES ($1, $2, $3, $4, NOW())
    //     RETURNING comment_id;
    //   `;

    // const { rows } = await pool.query(commentQuery, [
    //   await postCommentsID(),
    //   user,
    //   postId,
    //   studentOpinion,
    // ]);
    // const commentId = rows[0].comment_id;

    // res
    //   .status(200)
    //   .json({ comment_id: commentId, message: "Comment created successfully" });

    // Insert the comment
    const insertCommentQuery = {
      text: `
    INSERT INTO post_comments (comment_id, student_id, post_id, comment_text, comment_date)
    VALUES ($1, $2, $3, $4, NOW())
  `,
      values: [await postCommentsID(), user, postId, studentOpinion],
    };

    // Execute the INSERT query
    await pool.query(insertCommentQuery);

    // Now, retrieve the post details along with comment information
    const selectPostWithCommentQuery = {
      text: `
    WITH PostStats AS (
      SELECT
        p.post_id,
        p.post_text,
        p.post_media,
        p.post_date,
        s.student_fname || ' ' || s.student_lname AS student_name,
        COALESCE(l.like_count, 0) AS like_count,
        COALESCE(d.dislike_count, 0) AS dislike_count,
        COALESCE(c.comment_count, 0) AS comment_count,
        CASE
          WHEN pl.student_id IS NOT NULL THEN 'yes'
          ELSE 'no'
        END AS liked,
        CASE
          WHEN pd.student_id IS NOT NULL THEN 'yes'
          ELSE 'no'
        END AS disliked,
        CASE
          WHEN pc.student_id IS NOT NULL THEN 'yes'
          ELSE 'no'
        END AS commented
      FROM
        posts p
        INNER JOIN students s ON p.student_id = s.student_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS like_count
          FROM post_likes
          GROUP BY post_id
        ) l ON p.post_id = l.post_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS dislike_count
          FROM post_dislikes
          GROUP BY post_id
        ) d ON p.post_id = d.post_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS comment_count
          FROM post_comments
          GROUP BY post_id
        ) c ON p.post_id = c.post_id
        LEFT JOIN post_likes pl ON p.post_id = pl.post_id AND pl.student_id = $2
        LEFT JOIN post_dislikes pd ON p.post_id = pd.post_id AND pd.student_id = $2
        LEFT JOIN post_comments pc ON p.post_id = pc.post_id AND pc.student_id = $2
      WHERE
        p.post_id = $1
      ORDER BY
        p.post_date DESC
    )
    SELECT
      post_id,
      post_text,
      post_media,
      post_date,
      student_name,
      like_count,
      dislike_count,
      comment_count,
      liked,
      disliked,
      commented
    FROM
      PostStats
  `,
      values: [postId, user],
    };

    // Execute the SELECT query to retrieve the post details along with comment information
    const result = await pool.query(selectPostWithCommentQuery);
    // Process the result as needed
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
