const pool = require("../../../../../../db");
const nodemailer = require("nodemailer");

exports.approveAMaterial = async (req, res) => {
  try {
    const { materialID } = req.body;
    console.log(`id: ${materialID}`);
    // const permissions = req.permissions;
    // if (permissions.approvePDF)
    //   res.status(400).json("You are not authorized to approve materials.");
    // const updateMaterial = await pool.query(
    //   "UPDATE materials SET uploadstatus = $1 WHERE material_id = $2 RETURNING *",
    //   ["approved", materialID]
    // );
    // console.log(updateMaterial.rows);
    // const uploaderDetails = await pool.query(
    //   "SELECT student_email, student_fname, student_lname FROM students WHERE student_id = $1",
    //   [updateMaterial.rows[0].uploadedby]
    // );
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
    //   to: uploaderDetails.rows[0].student_email, // list of receivers
    //   subject: "Material Upload Approved", // Subject line
    //   text: `${neat(
    //     uploaderDetails.rows[0].student_fname
    //   )}, your material: ${updateMaterial.rows[0].topic.toUpperCase()} has been approved, now it can be viewed by other students. Thank you.
    //   `, // plain text body
    //   html: `<h2>Material Upload Approved</h2>
    //     <p>
    //     ${neat(
    //       uploaderDetails.rows[0].student_fname
    //     )}, your material: <strong>${updateMaterial.rows[0].topic.toUpperCase()}</strong> has been approved, now it can be viewed by other students. Thank you.
    //     </p>
    //     `, //HTML message
    // };
    // // send mail with defined transport object
    // await transport.sendMail(msg);
    console.log("Approval successful!");
    return res.status(200).json("Approval successful!");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Sorry something went wrong.");
  }
};
