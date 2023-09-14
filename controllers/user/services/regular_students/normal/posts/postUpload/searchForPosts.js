const pool = require("../../../../../../../db");

exports.searchForPosts = async (req, res) => {
  const { searchTerm } = req.params;
  const user = req.user;
  try {
    const query = `
        WITH PostStats AS (
          SELECT DISTINCT
            p.post_id,
            p.post_text,
            p.post_media,
            p.post_date,
            s.student_id,
            s.student_fname || ' ' || s.student_lname AS student_name,
            COALESCE(l.like_count, 0) AS like_count,
            COALESCE(d.dislike_count, 0) AS dislike_count,
            COALESCE(c.comment_count, 0) AS comment_count,
            CASE WHEN pl.student_id IS NOT NULL THEN 'yes' ELSE 'no' END AS liked,
            CASE WHEN pd.student_id IS NOT NULL THEN 'yes' ELSE 'no' END AS disliked,
            CASE WHEN pc.student_id IS NOT NULL THEN 'yes' ELSE 'no' END AS commented
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
            LEFT JOIN post_likes pl ON p.post_id = pl.post_id AND pl.student_id = $1
            LEFT JOIN post_dislikes pd ON p.post_id = pd.post_id AND pd.student_id = $1
            LEFT JOIN post_comments pc ON p.post_id = pc.post_id AND pc.student_id = $1
            WHERE 
            student_fname ILIKE $2 OR
            student_lname ILIKE $2 OR
            (student_fname || ' ' || student_mname) ILIKE $2 OR
            (student_fname || ' ' || student_lname) ILIKE $2 OR
            (student_lname || ' ' || student_fname) ILIKE $2 OR
            (student_fname || ' ' || student_mname || ' ' || student_lname) ILIKE $2 OR
            (student_lname || ' ' || student_mname || ' ' || student_fname) ILIKE $2 OR
            student_mat_no ILIKE $2
          ORDER BY p.post_date DESC
        )
        SELECT
          post_id,
          post_text,
          post_media,
          post_date,
          student_id,
          student_name,
          like_count,
          dislike_count,
          comment_count,
          liked,
          disliked,
          commented
        FROM
          PostStats
            `;

    const { rows } = await pool.query(query, [user, searchTerm]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
