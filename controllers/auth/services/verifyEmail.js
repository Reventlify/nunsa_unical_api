const pool = require("../../../db");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const randomString = require("random-string");

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  // verification code
  const emailVCode = randomString({ length: 5 });
  try {
    // deletes client from limbo
    await pool.query("DELETE FROM studentslimbo WHERE student_email = $1", [
      email,
    ]);

    // checks if user already exists
    const user = await pool.query(
      "SELECT * FROM students WHERE student_email = $1",
      [email]
    );

    // action if user already exists
    if (user.rows.length !== 0)
      return res.status(409).json("User already exists!");

    await pool.query(
      "INSERT INTO studentslimbo(student_email, code, client_status, createdat) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, emailVCode, "UNVERIFIED", dayjs().format()]
    );

    //credentials for email transportation
    const transport = nodemailer.createTransport({
      host: "smtp.office365.com",
      post: 587,
      auth: {
        user: "reventlifyhub@outlook.com",
        pass: process.env.MAIL,
      },
    });

    //sends verification code to clients mail
    const msg = {
      from: "NUNSA UNICAL <reventlifyhub@outlook.com>", // sender address
      to: email, // list of receivers
      subject: "Email Verification", // Subject line
      text: `here is your verification code: ${emailVCode}`, // plain text body
      //   html: `<h3>Email Verification</h3>
      //     <p>here is your verification code: <strong>${emailVCode}</strong></p>`, //HTML message
    };

    // send mail with defined transport object
    await transport.sendMail(msg);
    return res.status(200).json({
      Status: "Sent Successfully!",
      toEmail: email,
    });
  } catch (error) {
    console.log(error);
    res.status(418).json(error.message);
  }
};
