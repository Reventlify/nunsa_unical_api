const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const _ = require("lodash");
const {
  year_to_session_converter,
} = require("../../../../../../utilities/schoolSession");
const { sizeChecker } = require("../../../../../../utilities/sizeChecker");
const cloudinary = require("../../../../../../utilities/cloudinary");
const pool = require("../../../../../../db");
const { materialID } = require("../../../../../../utilities/IDGenerator");
const {
  levelHandler,
  neat,
  materialNameHandler,
} = require("../../../../../../utilities/capNsmalz");

const message = (
  fName,
  email,
  topic,
  course_code,
  uploader_firstName,
  uploader_lastName,
  refinedLevel
) => {
  //Mail to course rep
  return {
    from: "NUNSA UCC <reventlifyhub@outlook.com>", // sender address
    to: email, // list of receivers
    subject: "Material Upload", // Subject line
    text: `${neat(fName)}, your colleague ${neat(uploader_firstName)} ${neat(
      uploader_lastName
    )} uploaded ${topic.toUpperCase()}, a ${refinedLevel} level material, 
    with the course code: ${course_code}. Please login to the NUNSA UCC portal and review the upload. Thank you.
    `, // plain text body
    html: `<h2>Material Upload</h2>
      <p>
      ${neat(fName)}, your colleague ${neat(uploader_firstName)} ${neat(
      uploader_lastName
    )} uploaded <strong>${topic.toUpperCase()}</strong>, 
      a ${refinedLevel} level material, with the course code: ${course_code}. 
      Please login to the NUNSA UCC portal and review the upload. Thank you.
      </p>
      `, //HTML message
  };
};
exports.materialUpload = async (req, res) => {
  try {
    const { pdf, topic, session, courseCode, lecturer, level_year , courseAbbr} = req.body;
    const uploader = req.user;
    const uploader_email = req.email;
    const uploader_firstName = req.firstName;
    const uploader_lastName = req.lastName;
    const refinedSession = await year_to_session_converter(_.trim(session));
    const refinedLevel = levelHandler(_.trim(level_year));

    // if the session format is wrong
    if (refinedSession.slice(0, 1).toLowerCase() === "p")
      return res.status(400).json(refinedSession);

    // if level or year format is wrong
    if (refinedLevel.slice(0, 1).toLowerCase() === "s")
      return res.status(400).json(refinedLevel);

    // Checks media file size
    if (sizeChecker(pdf).MB > 10)
      return res.status(400).json("Media larger than 10MB");

    //uploads the material to cloudinary and gets the url and id
    const resultOfUpload = await cloudinary.uploader.upload(pdf, {
      folder: `${refinedSession.slice(0, 2)}_${refinedSession.slice(
        -2
      )}_materials`,
    });

    const sch_session_id = await pool.query(
      "SELECT sch_session_id FROM sch_sessions WHERE sch_session = $1",
      [refinedSession]
    );

    const courseRep = await pool.query(
      "SELECT student_id, student_fname FROM students WHERE student_role = $1 AND sch_session_id = $2",
      ["course_rep", sch_session_id]
    );
    // inserts material into the db
    const materialUploaded = await pool.query(
      `
      INSERT INTO materials(
        material_id, 
        sch_session_id, 
        uploadedby, 
        level_year,
        material_media,
        material_media_id,
        course_code,
        course_abbr,
        topic,
        lecturer,
        uploadstatus,
        uploadedat
        )
        VALUES(
          $1, $2, $3, $4, 
          $5, $6, $7, $8, 
          $9, $10, $11, $12
        ) RETURNING *
    `,
      [
        await materialID(refinedSession, refinedLevel),
        sch_session_id.rows[0].sch_session_id,
        uploader,
        refinedLevel,
        resultOfUpload.secure_url,
        resultOfUpload.public_id,
        courseCode,
        courseAbbr.toLowerCase(),
        await materialNameHandler(topic, sch_session_id.rows[0].sch_session_id),
        lecturer.toLowerCase(),
        "pending",
        dayjs().format(),
      ]
    );
    // //credentials for email transportation
    // const transport = nodemailer.createTransport({
    //   host: "smtp.office365.com",
    //   post: 587,
    //   auth: {
    //     user: "reventlifyhub@outlook.com",
    //     pass: process.env.MAIL,
    //   },
    // });

    // //Mail to uploader
    // const msg = {
    //   from: "NUNSA UCC <reventlifyhub@outlook.com>", // sender address
    //   to: uploader_email, // list of receivers
    //   subject: "Material Upload", // Subject line
    //   text: `${neat(
    //     uploader_firstName
    //   )}, you have successfully uploaded ${materialUploaded.rows[0].topic.toUpperCase()}, a ${refinedLevel} level material,
    //   with the course code: ${courseCode}. Your upload is going to be reviewed before it can be visibile to your colleagues,
    //   you will be notified immediately it gets approved. Thank you.
    //   `, // plain text body
    //   html: `<h2>Material Upload</h2>
    //     <p>
    //     ${neat(
    //       uploader_firstName
    //     )} you have successfully uploaded <strong>${materialUploaded.rows[0].topic.toUpperCase()}</strong>,
    //     a ${refinedLevel} level material, with the course code: ${courseCode}.
    //     Your upload is going to be reviewed before it can be visibile to your colleagues,
    //     you will be notified immediately it gets approved. Thank you.
    //     </p>
    //     `, //HTML message
    // };
    // let msg1;
    // if (courseRep.rows.length !== 0) {
    //   msg1 = message(
    //     courseRep.rows[0].fName,
    //     courseCode.rows[0].student_email,
    //     materialUploaded.rows[0].topic,
    //     courseCode,
    //     uploader_firstName,
    //     uploader_lastName,
    //     refinedLevel
    //   );

    //   // send mail with defined transport object
    //   await transport.sendMail(msg);
    //   await transport.sendMail(msg1);
    //   // response
    //   return res.status(200).json("Upload successful!");
    // } else {
    //   msg1 = message(
    //     "edidiong",
    //     "edijay17@gmail.com",
    //     materialUploaded.rows[0].topic,
    //     courseCode,
    //     uploader_firstName,
    //     uploader_lastName,
    //     refinedLevel
    //   );
    //   // send mail with defined transport object
    //   await transport.sendMail(msg);
    //   await transport.sendMail(msg1);
    //   // response
    //   return res.status(200).json("Upload successful!");
    // }
    return res.status(200).json("Upload successful!");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Sorry something went wrong.");
  }
};
