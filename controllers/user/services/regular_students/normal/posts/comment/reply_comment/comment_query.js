const pool = require("../../../../../../../../db");

exports.queryComments = async (req, res) => {
  const student_id = req.user;
  const {postId} = req.params;
  console.log(student_id);
  console.log(postId);
  try {
    const query = `
    SELECT
    pc.comment_id,
    pc.comment_text,
    pc.comment_date,
    pc.student_id AS commenter_id,
    s.student_photo AS commenter_photo,
    s.student_fname AS commenter_fname,
    s.student_lname AS commenter_lname,
    COUNT(cl.like_id) AS like_count,
    COUNT(cd.dislike_id) AS dislike_count,
    COUNT(pr.reply_id) AS reply_count,
    MAX(CASE WHEN cl.student_id = $2 THEN 'yes' ELSE 'no' END) AS liked,
    MAX(CASE WHEN cd.student_id = $2 THEN 'yes' ELSE 'no' END) AS disliked,
    MAX(CASE WHEN pr.student_id = $2 THEN 'yes' ELSE 'no' END) AS replied
    FROM
    post_comments pc
    LEFT JOIN
    comment_likes cl ON pc.comment_id = cl.comment_id
    LEFT JOIN
    comment_dislikes cd ON pc.comment_id = cd.comment_id
    LEFT JOIN
    comment_replies pr ON pc.comment_id = pr.comment_id
    INNER JOIN
    students s ON pc.student_id = s.student_id
    WHERE
    pc.post_id = $1 -- Replace with the specific post_id you want to retrieve comments for
    GROUP BY
    pc.comment_id, pc.comment_text, pc.comment_date, pc.student_id, s.student_photo, s.student_fname, s.student_lname
    ORDER BY
    pc.comment_date ASC;

    `;

    const { rows } = await pool.query(query, [postId, student_id]);
    console.log(rows);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
