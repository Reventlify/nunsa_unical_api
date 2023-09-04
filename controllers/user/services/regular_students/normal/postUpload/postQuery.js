const pool = require("../../../../../../db");

exports.postQuery = async (req, res) => {
  const user = req.user;
  const sch_session = req.user_session;
  const { session } = req.params;

  const postsToGet = (sch_sess) => {
    if (sch_sess === "yes") {
      return sch_session;
    } else {
      return null;
    }
  };

  const helper = postsToGet(session);
  try {
    const query = `
        WITH PostStats AS (
            SELECT
              p.post_id,
              p.post_text,
              p.post_date,
              p.post_media,
              s.student_fname || ' ' || s.student_lname AS student_name,
              COALESCE(l.like_count, 0) AS like_count,
              COALESCE(d.dislike_count, 0) AS dislike_count,
              COALESCE(c.comment_count, 0) AS comment_count
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
              ${
                helper === null
                  ? `WHERE sch_session IS NULL`
                  : `WHERE sch_session = '${helper}'`
              }
              
            ORDER BY p.post_date DESC
            OFFSET 0  -- Replace with the appropriate offset for pagination
            LIMIT 20  -- Adjust the limit to control the number of posts per page
          )
          SELECT
            post_id,
            post_text,
            post_media,
            post_date,
            student_name,
            like_count,
            dislike_count,
            comment_count
          FROM
            PostStats
        `;

    // const { rows } = await pool.query(query, [helper]);
    const { rows } = await pool.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
