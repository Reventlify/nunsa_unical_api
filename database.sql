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
    course_name TEXT,
    topic TEXT NOT NULL,
    lecturer TEXT NOT NULL,
    uploadstatus TEXT NOT NULL,
    uploadedat  TIMESTAMP NOT NULL
)