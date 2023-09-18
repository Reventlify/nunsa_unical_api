const pool = require("../../../db");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const randomString = require("random-string");
const trim = require("lodash.trim");
const { neat } = require("../../../utilities/capNsmalz");

exports.sendVerificationCode = async (req, res) => {
  const { email, fName } = req.body;
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

    await new Promise((resolve, reject) => {
      // verify connection configuration transport.verify(function (error, success) {
      transport.verify(function (error, success) {
        if (error) {
          console.log(error);
          return res.status(500).json("Sorry something went wrong.");
        } else {
          // console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    //sends verification code to clients mail
    const msg = {
      from: "NUNSA UCC <reventlifyhub@outlook.com>", // sender address
      to: email, // list of receivers
      subject: "Email Verification", // Subject line
      text: `${neat(
        trim(fName)
      )} here is your verification code: ${emailVCode}`, // plain text body
      //   html: `<h3>Email Verification</h3>
      //     <p>here is your verification code: <strong>${emailVCode}</strong></p>`, //HTML message
    };

    // send mail with defined transport object
    // await transport.sendMail(msg);

    await new Promise((resolve, reject) => {
      transport.sendMail(msg, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(500).json("Sorry something went wrong.");
        } else {
          if (info.rejected) {
            console.log(`first: ${info.rejected}`);
            return res.status(400).json("Email does not exist.");
          }
          console.log(`second: ${info.rejected}`);
          resolve(info);
        }
      });
    });
    return res.status(200).json({
      Status: "Sent Successfully!",
      toEmail: email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong...");
  }
};

exports.verifyCode = async (req, res) => {
  const { verificationCode, email } = req.body;
  try {
    // gets the real verification code
    const code = await pool.query(
      "SELECT * FROM studentslimbo WHERE student_email = $1",
      [email]
    );

    // checks if the code entered exists
    if (code.rows.length === 0)
      return res.status(400).json("You don't have a verification code");

    // checks if the code entered is valid
    if (code.rows[0].code !== verificationCode)
      return res.status(400).json("Incorrect Code.");

    // sets the client in limbo to verified final registeration
    await pool.query(
      "UPDATE studentslimbo SET client_status = $1 WHERE student_email = $2",
      ["VERIFIED", email]
    );

    return res.status(200).json({ message: "Email Verified!" });
  } catch (error) {
    return res.status(500).json("Something went wrong...");
  }
};
