CREATE DATABASE nunsaunical;
CREATE TABLE dev(
    dev_id TEXT NOT NULL,
    dev_email TEXT NOT NULL,
    dev_password TEXT NOT NULL
)
CREATE TABLE sch_sessions(
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
    uploadedat  TIMESTAMP NOT NULL
)

SELECT 
    sch_sessions.sch_session,
    students.student_email,
    students.student_fname,
    students.student_mname,
    students.student_lname,
    students.student_id,
    students.student_mat_no,
    students.student_password
    FROM students 
    LEFT JOIN sch_sessions 
    ON 
    students.sch_session_id = sch_sessions.sch_session_id
    WHERE students.student_email = 'edijay17@gmail.com'
    GROUP BY 
    sch_sessions.sch_session,
    students.student_email,
    students.student_fname,
    students.student_mname,
    students.student_lname,
    students.student_id,
    students.student_mat_no,
    students.student_password;

SELECT 
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
    FROM materials 
    LEFT JOIN sch_sessions 
    ON 
    materials.sch_session_id = sch_sessions.sch_session_id
    LEFT JOIN students 
    ON 
    materials.uploadedby = students.student_id
    GROUP BY 
	  students.student_id,
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
    ORDER BY LEFT(sch_sessions.sch_session, 2) DESC, (materials.topic) ASC;


SELECT 
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
      FROM materials 
      LEFT JOIN sch_sessions 
      ON 
      materials.sch_session_id = sch_sessions.sch_session_id
      LEFT JOIN students 
      ON 
      materials.uploadedby = students.student_id
      WHERE materials.uploadstatus = 'pending' AND 
      materials.material_id LIKE '18%' AND 
      materials.course_abbr = 'ana' AND materials.course_code = '519'
      GROUP BY 
	    students.student_id,
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