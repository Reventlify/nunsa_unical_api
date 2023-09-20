const pool = require("../../../../../../db");
const nodemailer = require("nodemailer");
const cloudinary = require("../../../../../../utilities/cloudinary");
const {
  get_materials_for_a_course,
} = require("../../../../../../utilities/materialQuery");
const { neat } = require("../../../../../../utilities/capNsmalz");

exports.approveAMaterial = async (req, res) => {
  try {
    const { materialID, uploadstatus, session, course_abbr, course_code } =
      req.body;
    const permissions = req.permissions;
    if (!permissions.approvePDF)
      return res
        .status(400)
        .json("You are not authorized to approve materials.");
    const updateMaterial = await pool.query(
      "UPDATE materials SET uploadstatus = $1 WHERE material_id = $2 RETURNING *",
      ["approved", materialID]
    );
    if (updateMaterial.rows.length === 0)
      return res.status(204).json("Material does not exist.");
    const materials = await get_materials_for_a_course(
      uploadstatus,
      session,
      course_abbr,
      course_code
    );
    const uploaderDetails = await pool.query(
      "SELECT student_email, student_fname, student_lname FROM students WHERE student_id = $1",
      [updateMaterial.rows[0].uploadedby]
    );

    //credentials for email transportation
    const transport = nodemailer.createTransport({
      host: "eleven.qservers.net",
      secure: true,
      port: 465,
      auth: {
        user: "info@nunsaunical.com.ng",
        pass: process.env.MAIL,
      },
    });

    //Mail to uploader
    const msg = {
      from: "NUNSA UCC <info@nunsaunical.com.ng>", // sender address
      to: uploaderDetails.rows[0].student_email, // list of receivers
      subject: "Material Approved", // Subject line
      text: `${neat(
        uploaderDetails.rows[0].student_fname
      )}, your material: ${updateMaterial.rows[0].topic.toUpperCase()} has been approved, now it can be viewed by other students. Thank you.
      `, // plain text body
      html: `<h2>Material Approved</h2>
        <p>
        ${neat(
          uploaderDetails.rows[0].student_fname
        )}, your material: <strong>${updateMaterial.rows[0].topic.toUpperCase()}</strong> has been approved, now it can be viewed by other students. Thank you.
        </p>
        `, //HTML message
    };
    // send mail with defined transport object
    await transport.sendMail(msg);
    return res.status(200).json(materials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Sorry something went wrong.");
  }
};

exports.materialNotApproved = async (req, res) => {
  try {
    const { materialID, uploadstatus, session, course_abbr, course_code } =
      req.body;
    const permissions = req.permissions;
    if (!permissions.approvePDF)
      return res
        .status(400)
        .json("You are not authorized to delete materials.");
    const materialExists = await pool.query(
      "SELECT * FROM materials WHERE material_id = $1",
      [materialID]
    );
    if (materialExists.rows.length === 0)
      return res.status(204).json("Material does not exist.");
    await pool.query("DELETE FROM materials WHERE material_id = $1", [
      materialID,
    ]);
    // deletes the previous logo
    await cloudinary.uploader.destroy(materialExists.rows[0].material_media_id);
    const materials = await get_materials_for_a_course(
      uploadstatus,
      session,
      course_abbr,
      course_code
    );
    const uploaderDetails = await pool.query(
      "SELECT student_email, student_fname, student_lname FROM students WHERE student_id = $1",
      [materialExists.rows[0].uploadedby]
    );

    //credentials for email transportation
    const transport = nodemailer.createTransport({
      host: "eleven.qservers.net",
      secure: true,
      port: 465,
      auth: {
        user: "info@nunsaunical.com.ng",
        pass: process.env.MAIL,
      },
    });

    //Mail to uploader
    const msg = {
      from: "NUNSA UCC <info@nunsaunical.com.ng>", // sender address
      to: uploaderDetails.rows[0].student_email, // list of receivers
      subject: "Material Disapproved", // Subject line
      text: `${neat(
        uploaderDetails.rows[0].student_fname
      )}, your material: ${materialExists.rows[0].topic.toUpperCase()} was disapproved, due to it not meeting the NUNSA UCC guidelines for material upload.
      `, // plain text body
      html: `<h2>Material Disapproved</h2>
        <p>
        ${neat(
          uploaderDetails.rows[0].student_fname
        )}, your material: <strong>${materialExists.rows[0].topic.toUpperCase()}</strong> was disapproved, due to it not meeting the NUNSA UCC guidelines for material upload.
        </p>
        `, //HTML message
    };
    // send mail with defined transport object
    await transport.sendMail(msg);
    return res.status(200).json(materials.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Sorry something went wrong.");
  }
};
