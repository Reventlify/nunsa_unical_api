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

    // Insert the comment into the 'post_comments' table
    const commentQuery = `
        INSERT INTO post_comments (comment_id, student_id, post_id, comment_text, comment_date)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING comment_id;
      `;

    const { rows } = await pool.query(commentQuery, [
      await postCommentsID(),
      user,
      postId,
      studentOpinion,
    ]);
    const commentId = rows[0].comment_id;

    res
      .status(200)
      .json({ comment_id: commentId, message: "Comment created successfully" });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
