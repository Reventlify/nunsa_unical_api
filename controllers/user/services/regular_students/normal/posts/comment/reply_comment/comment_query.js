exports.queryComments = async (req, res) => {
  try {
    `
    SELECT
    pc.comment_id,
    pc.comment_text,
    pc.comment_date,
    COUNT(cl.like_id) AS like_count,
    COUNT(cd.dislike_id) AS dislike_count,
    COUNT(pr.reply_id) AS reply_count,
    MAX(CASE WHEN cl.student_id = ? THEN 'yes' ELSE 'no' END) AS liked,
    MAX(CASE WHEN cd.student_id = ? THEN 'yes' ELSE 'no' END) AS disliked,
    MAX(CASE WHEN pr.student_id = ? THEN 'yes' ELSE 'no' END) AS replied
    FROM
    post_comments pc
    LEFT JOIN
    comment_likes cl ON pc.comment_id = cl.comment_id
    LEFT JOIN
    comment_dislikes cd ON pc.comment_id = cd.comment_id
    LEFT JOIN
    post_replies pr ON pc.comment_id = pr.comment_id
    WHERE
    pc.post_id = ? -- Replace with the specific post_id you want to retrieve comments for
    GROUP BY
    pc.comment_id, pc.comment_text, pc.comment_date
    ORDER BY
    pc.comment_date ASC;

    `;
    return;
  } catch (error) {
    return;
  }
};
