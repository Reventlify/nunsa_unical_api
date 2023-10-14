CREATE DATABASE nunsaunical;
CREATE TABLE dev(
  dev_id TEXT NOT NULL,
  dev_email TEXT NOT NULL,
  dev_password TEXT NOT NULL
) CREATE TABLE sch_sessions(
  sch_session_id TEXT NOT NULL UNIQUE,
  sch_session TEXT NOT NULL UNIQUE,
  createdat TIMESTAMP NOT NULL
);
CREATE TABLE studentslimbo (
  student_email TEXT NOT NULL UNIQUE,
  code TEXT,
  client_status TEXT NOT NULL,
  createdat TIMESTAMP NOT NULL
) CREATE TABLE students (
  student_id TEXT NOT NULL UNIQUE,
  sch_session_id TEXT NOT NULL REFERENCES sch_sessions(sch_session_id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_email TEXT NOT NULL UNIQUE,
  student_mat_no TEXT NOT NULL UNIQUE,
  student_fname TEXT NOT NULL,
  student_mname TEXT NOT NULL,
  student_lname TEXT NOT NULL,
  student_role TEXT NOT NULL,
  student_about TEXT,
  student_phone TEXT,
  student_address TEXT,
  student_city TEXT,
  student_state TEXT,
  student_nationality TEXT,
  student_password TEXT NOT NULL,
  student_gender TEXT,
  student_photo TEXT,
  student_photo_id TEXT,
  student_genotype TEXT,
  student_blood_group TEXT,
  student_dob DATE,
  createdat TIMESTAMP NOT NULL,
  lastseenat TIMESTAMP
);
CREATE TABLE dues (
  dues_id Text NOT NULL UNIQUE,
  sch_session TEXT NOT NULL REFERENCES sch_sessions(sch_session) ON DELETE CASCADE ON UPDATE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  cleared_by TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  dues_status TEXT NOT NULL
);
CREATE TABLE elections (
  election_id Text NOT NULL UNIQUE,
  sch_session_id TEXT NOT NULL REFERENCES sch_sessions(sch_session_id) ON DELETE CASCADE ON UPDATE CASCADE,
  eleco TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  election_date DATE NOT NULL,
  election_time TIME NOT NULL,
  election_status TEXT NOT NULL
);
CREATE TABLE candidates (
  election_id TEXT NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE ON UPDATE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  candidate_role TEXT NOT NULL,
  candidate_status TEXT NOT NULL
);
CREATE TABLE votes (
  election_id TEXT NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE ON UPDATE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  voter_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  votedat TIMESTAMP NOT NULL
);
CREATE TABLE excos (
  sch_session_id TEXT NOT NULL REFERENCES sch_sessions(sch_session_id) ON DELETE CASCADE ON UPDATE CASCADE,
  exco_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  exco_role TEXT NOT NULL,
  exco_status TEXT NOT NULL
);
CREATE TABLE materials (
  material_id TEXT NOT NULL UNIQUE,
  sch_session_id TEXT NOT NULL REFERENCES sch_sessions(sch_session_id) ON DELETE CASCADE ON UPDATE CASCADE,
  uploadedby TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  level_year TEXT NOT NULL,
  material_media TEXT NOT NULL,
  material_media_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  course_abbr TEXT,
  topic TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  uploadstatus TEXT NOT NULL,
  uploadedat TIMESTAMP NOT NULL
) CREATE TABLE conversations (
  conversation_id TEXT NOT NULL UNIQUE,
  user1_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user2_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE messages (
  message_id TEXT NOT NULL UNIQUE,
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  message_text TEXT,
  message_media TEXT,
  message_media_id TEXT,
  delete_message TEXT,
  seen TEXT,
  sent_at TIMESTAMP NOT NULL
);
-- Create a table to store posts made by students
CREATE TABLE posts (
  post_id TEXT NOT NULL UNIQUE,
  sch_session TEXT REFERENCES sch_sessions(sch_session) ON DELETE CASCADE ON UPDATE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_text TEXT NOT NULL,
  post_media TEXT,
  post_media_id TEXT,
  post_date TIMESTAMP NOT NULL -- Add other post-related fields
);
-- Create a table to store likes on posts
CREATE TABLE post_likes (
  like_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  like_date TIMESTAMP NOT NULL
);
-- Create a table to store dislikes on posts
CREATE TABLE post_dislikes (
  dislike_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  dislike_date TIMESTAMP NOT NULL
);
-- Create a table to store comments on posts
CREATE TABLE post_comments (
  comment_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  comment_text TEXT NOT NULL,
  comment_date TIMESTAMP NOT NULL -- Add other comment-related fields
);
-- Create a table to store likes on comments
CREATE TABLE comment_likes (
  like_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  comment_id TEXT NOT NULL REFERENCES post_comments(comment_id) ON DELETE CASCADE ON UPDATE CASCADE,
  like_date TIMESTAMP NOT NULL
);
-- Create a table to store dislikes on comments
CREATE TABLE comment_dislikes (
  dislike_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  comment_id TEXT NOT NULL REFERENCES post_comments(comment_id) ON DELETE CASCADE ON UPDATE CASCADE,
  dislike_date TIMESTAMP NOT NULL
);
-- Create a table to store replies to comments
CREATE TABLE comment_replies (
  reply_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  comment_id TEXT NOT NULL REFERENCES post_comments(comment_id) ON DELETE CASCADE ON UPDATE CASCADE,
  reply_text TEXT NOT NULL,
  reply_date TIMESTAMP NOT NULL -- Add other reply-related fields
);
-- Create a table to store likes on comment replies
CREATE TABLE reply_likes (
  like_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  reply_id TEXT NOT NULL REFERENCES comment_replies(reply_id) ON DELETE CASCADE ON UPDATE CASCADE,
  like_date TIMESTAMP NOT NULL
);
-- Create a table to store dislikes on comment replies
CREATE TABLE reply_dislikes (
  dislike_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  reply_id TEXT NOT NULL REFERENCES comment_replies(reply_id) ON DELETE CASCADE ON UPDATE CASCADE,
  dislike_date TIMESTAMP NOT NULL
);
WITH PostStats AS (
  SELECT p.post_id,
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
  FROM posts p
    INNER JOIN students s ON p.student_id = s.student_id
    LEFT JOIN (
      SELECT post_id,
        COUNT(*) AS like_count
      FROM post_likes
      GROUP BY post_id
    ) l ON p.post_id = l.post_id
    LEFT JOIN (
      SELECT post_id,
        COUNT(*) AS dislike_count
      FROM post_dislikes
      GROUP BY post_id
    ) d ON p.post_id = d.post_id
    LEFT JOIN (
      SELECT post_id,
        COUNT(*) AS comment_count
      FROM post_comments
      GROUP BY post_id
    ) c ON p.post_id = c.post_id
    LEFT JOIN post_likes pl ON p.post_id = pl.post_id
    AND pl.student_id = '3301920602'
    LEFT JOIN post_dislikes pd ON p.post_id = pd.post_id
    AND pd.student_id = '3301920602'
    LEFT JOIN post_comments pc ON p.post_id = pc.post_id
    AND pc.student_id = '3301920602'
  WHERE p.post_id = 'zb6S8Lbpsa0rOrUT'
  ORDER BY p.post_date DESC
) -- Now, you can use the PostStats CTE in subsequent queries
SELECT post_id,
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
FROM PostStats;
SELECT post_id,
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
FROM PostStats
SELECT rm.conversation_id,
  rm.sender_id,
  rm.message_text,
  rm.message_media,
  rm.message_media_id,
  rm.delete_message,
  rm.seen,
  rm.sent_at
FROM RankedMessages rm
WHERE rm.row_num = 1;
-- 
SELECT messages.message_id,
  messages.conversation_id,
  messages.sender_id,
  messages.message_text,
  messages.message_media,
  messages.sent_at
FROM messages
  LEFT JOIN conversations ON messages.conversation_id = conversations.conversation_id
WHERE conversations.user1_id = $1
  AND conversations.user2_id = $2
  OR conversations.user1_id = $2
  AND conversations.user2_id = $1;
GROUP BY messages.message_id,
  messages.conversation_id,
  messages.sender_id,
  messages.message_text,
  messages.message_media,
  messages.sent_at
ORDER BY (messages.sent_at) ASC;
SELECT *
FROM messages
  LEFT JOIN conversations ON messages.conversation_id = conversations.conversation_id
WHERE conversations.user1_id = $1
  AND conversations.user2_id = $2
  OR conversations.user1_id = $2
  AND conversations.user2_id = $1;
SELECT sch_sessions.sch_session,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_id,
  students.student_mat_no,
  students.student_password
FROM students
  LEFT JOIN sch_sessions ON students.sch_session_id = sch_sessions.sch_session_id
WHERE students.student_email = 'edijay17@gmail.com'
GROUP BY sch_sessions.sch_session,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_id,
  students.student_mat_no,
  students.student_password;
SELECT sch_sessions.sch_session,
  materials.material_id,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_mat_no,
  materials.level_year,
  materials.material_media,
  materials.course_code,
  materials.course_abbr,
  materials.topic,
  materials.lecturer,
  materials.uploadstatus,
  materials.uploadedat
FROM materials
  LEFT JOIN sch_sessions ON materials.sch_session_id = sch_sessions.sch_session_id
  LEFT JOIN students ON materials.uploadedby = students.student_id
GROUP BY students.student_id,
  sch_sessions.sch_session,
  materials.material_id,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_mat_no,
  materials.level_year,
  materials.material_media,
  materials.course_code,
  materials.course_abbr,
  materials.topic,
  materials.lecturer,
  materials.uploadstatus,
  materials.uploadedat
ORDER BY LEFT(sch_sessions.sch_session, 2) DESC,
  (materials.topic) ASC;
SELECT sch_sessions.sch_session,
  materials.material_id,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_mat_no,
  materials.level_year,
  materials.material_media,
  materials.course_code,
  materials.course_abbr,
  materials.topic,
  materials.lecturer,
  materials.uploadstatus,
  materials.uploadedat
FROM materials
  LEFT JOIN sch_sessions ON materials.sch_session_id = sch_sessions.sch_session_id
  LEFT JOIN students ON materials.uploadedby = students.student_id
WHERE materials.uploadstatus = 'pending'
  AND materials.material_id LIKE '18%'
  AND materials.course_abbr = 'ana'
  AND materials.course_code = '519'
GROUP BY students.student_id,
  sch_sessions.sch_session,
  materials.material_id,
  students.student_email,
  students.student_fname,
  students.student_mname,
  students.student_lname,
  students.student_mat_no,
  materials.level_year,
  materials.material_media,
  materials.course_code,
  materials.course_abbr,
  materials.topic,
  materials.lecturer,
  materials.uploadstatus,
  materials.uploadedat
ORDER BY (materials.uploadedat) DESC;
WITH LastMessage AS (
  SELECT DISTINCT ON (c.conversation_id) c.conversation_id,
    m.sender_id,
    m.message_text,
    m.message_media,
    m.message_media_id,
    m.delete_message,
    m.seen,
    m.sent_at,
    c.user1_id,
    c.user2_id
  FROM conversations c
    LEFT JOIN messages m ON c.conversation_id = m.conversation_id
  WHERE c.user1_id = '5893913749'
    OR c.user2_id = '5893913749'
  ORDER BY c.conversation_id,
    m.sent_at DESC
)
SELECT lm.conversation_id,
  lm.message_text,
  lm.message_media,
  lm.message_media_id,
  lm.delete_message,
  lm.seen,
  lm.sent_at,
  CASE
    WHEN lm.user1_id = '5893913749' THEN other_user.student_fname
    ELSE sender_user.student_fname
  END AS other_user_fname,
  CASE
    WHEN lm.user1_id = '5893913749' THEN other_user.student_lname
    ELSE sender_user.student_lname
  END AS other_user_lname,
  CASE
    WHEN lm.user1_id = '5893913749' THEN other_user.student_id
    ELSE sender_user.student_id
  END AS other_user_id
FROM LastMessage lm
  LEFT JOIN students sender_user ON lm.sender_id = sender_user.student_id
  LEFT JOIN students other_user ON (
    (
      lm.user1_id = '5893913749'
      AND lm.user2_id = other_user.student_id
    )
    OR (
      lm.user2_id = '5893913749'
      AND lm.user1_id = other_user.student_id
    )
  )
SELECT 
  e.election_id,
  s.sch_session,
  s.sch_session_id,
  e.eleco,
  u.student_fname,
  u.student_lname,
  e.election_date,
  e.election_time,
  e.election_status FROM elections e
  LEFT JOIN sch_sessions s
  ON e.sch_session_id = s.sch_session_id
  LEFT JOIN students u
  ON e.eleco = u.student_id
  WHERE e.election_status = 'pending'
  GROUP BY
  e.election_id,
  s.sch_session,
  s.sch_session_id,
  e.eleco,
  u.student_fname,
  u.student_lname,
  e.election_date,
  e.election_time,
  e.election_status;
  
-- function
CREATE OR REPLACE FUNCTION GetStudentById(student_id_param TEXT)
RETURNS TABLE (
    student_id TEXT, 
    sch_session_id TEXT,
    student_email TEXT,
    student_mat_no TEXT,
    student_fname TEXT,
    student_mname TEXT,
    student_lname TEXT,
    student_role TEXT,
    student_photo TEXT
)
AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        s.student_id, 
        s.sch_session_id,
        s.student_email,
        s.student_mat_no,
        s.student_fname,
        s.student_mname,
        s.student_lname,
        s.student_role,
        s.student_photo
    FROM students s WHERE s.student_id = student_id_param;
END;
$$ LANGUAGE plpgsql;


SELECT * FROM GetStudentById('3047886569');

DROP FUNCTION IF EXISTS GetStudentById(TEXT);

-- election results
SELECT
  candidates.candidate_id,
  candidates.candidate_role,
  students.student_fname,
  students.student_lname,
  COUNT(votes.voter_id) AS vote_count
FROM
  candidates
LEFT JOIN
  votes ON candidates.candidate_id = votes.candidate_id
LEFT JOIN
  students ON candidates.candidate_id = students.student_id
WHERE
  candidates.candidate_role = 'president'
  AND votes.election_id = 'your_election_id'
GROUP BY
  candidates.candidate_id, candidates.candidate_role, students.student_fname, students.student_lname;

-- total election results
SELECT
  candidate_roles.role_name,
  COUNT(votes.voter_id) AS vote_count
FROM (
  SELECT 'president' AS role_name
  UNION SELECT 'vice president'
  UNION SELECT 'financial secretary'
  UNION SELECT 'general secretary'
  UNION SELECT 'treasurer'
  UNION SELECT 'director of welfare'
  UNION SELECT 'director of socials'
  UNION SELECT 'director of sports'
  UNION SELECT 'director of health'
  UNION SELECT 'director of information'
) AS candidate_roles
LEFT JOIN candidates ON candidate_roles.role_name = candidates.candidate_role
LEFT JOIN votes ON candidates.candidate_id = votes.candidate_id
GROUP BY candidate_roles.role_name
ORDER BY
  CASE
    WHEN candidate_roles.role_name = 'president' THEN 1
    WHEN candidate_roles.role_name = 'vice president' THEN 2
    WHEN candidate_roles.role_name = 'financial secretary' THEN 3
    WHEN candidate_roles.role_name = 'general secretary' THEN 4
    WHEN candidate_roles.role_name = 'treasurer' THEN 5
    WHEN candidate_roles.role_name = 'director of welfare' THEN 6
    WHEN candidate_roles.role_name = 'director of socials' THEN 7
    WHEN candidate_roles.role_name = 'director of sports' THEN 8
    WHEN candidate_roles.role_name = 'director of health' THEN 9
    WHEN candidate_roles.role_name = 'director of information' THEN 10
  END;


SELECT
    candidates.candidate_id,
    candidates.candidate_role,
    CONCAT(students.student_fname, ' ', students.student_lname) AS candidate_name,
    COUNT(votes.voter_id) AS votes,
    CASE WHEN COUNT(CASE WHEN votes.voter_id = '3301920602' THEN 1 END) > 0 THEN 'yes' ELSE 'no' END AS voted_for
FROM
    candidates
LEFT JOIN
    votes ON candidates.candidate_id = votes.candidate_id
LEFT JOIN
    students ON candidates.candidate_id = students.student_id
WHERE
    candidates.candidate_role = 'president' AND candidates.candidate_status = 'approved'
    AND votes.election_id = 'AvQPeTMOlG'
GROUP BY
    candidates.candidate_id, candidates.candidate_role, CONCAT(students.student_fname, ' ', students.student_lname), candidates.candidate_status;


SELECT
    candidates.candidate_id,
    candidates.candidate_role,
    CONCAT(students.student_fname, ' ', students.student_lname) AS candidate_name,
    COUNT(votes.voter_id) AS votes,
    CASE WHEN MAX(votes.voter_id = '3301920602') THEN 'yes' ELSE 'no' END AS voted_for
FROM
    candidates
LEFT JOIN
    votes ON candidates.candidate_id = votes.candidate_id
LEFT JOIN
    students ON candidates.candidate_id = students.student_id
WHERE
    candidates.candidate_role = 'president' AND candidates.candidate_status = 'approved'
    AND votes.election_id = 'AvQPeTMOlG'
GROUP BY
    candidates.candidate_id, candidates.candidate_role, CONCAT(students.student_fname, ' ', students.student_lname), candidates.candidate_status;
