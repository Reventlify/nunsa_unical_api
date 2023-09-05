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
) 
CREATE TABLE students (
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
) 
CREATE TABLE conversations (
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
  comment_date TIMESTAMP NOT NULL
  -- Add other comment-related fields
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
  reply_date TIMESTAMP NOT NULL
  -- Add other reply-related fields
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
-- 
WITH RankedMessages AS (
  SELECT m.conversation_id,
    m.sender_id,
    m.message_text,
    m.message_media,
    m.message_media_id,
    m.delete_message,
    m.seen,
    m.sent_at,
    ROW_NUMBER() OVER (
      PARTITION BY m.conversation_id
      ORDER BY m.sent_at DESC
    ) AS row_num
  FROM messages m
    INNER JOIN conversations c ON m.conversation_id = c.conversation_id
  WHERE c.user1_id = '26363'
    OR c.user2_id = '26363'
)
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