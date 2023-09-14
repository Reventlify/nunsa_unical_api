const pool = require("../../../db");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const capNsmalz = require("../../../utilities/capNsmalz");
const idGenerator = require("../../../utilities/IDGenerator");
const { sessionExistence } = require("../../../utilities/schoolSession");

exports.register = async (req, res) => {
  const { email, password, fName, mName, lName, matNo, gender, regNo, year1 } =
    req.body;
  try {
    const user = await pool.query(
      "SELECT * FROM students WHERE student_email = $1",
      [email]
    );

    const userInLimbo = await pool.query(
      "SELECT * FROM studentslimbo WHERE student_email = $1",
      [email]
    );

    // checks if user already exists
    if (user.rows.length !== 0)
      return res.status(409).json("User already exists!");

    // checks if user email hasn't been verified
    if (userInLimbo.rows[0].client_status !== "VERIFIED")
      return res.status(409).json("User email not verified!");

    const matOrReg = !year1 ? matNo : `22/${regNo.toLowerCase()}`;

    // hashes password
    const hashedPassword = await bcrypt.hash(password, 10);
    // registers user
    const newClient = await pool.query(
      `
      INSERT INTO students(
        sch_session_id, student_id, student_email, student_mat_no, 
        student_fname, student_mname, student_lname, student_role,
        student_password, student_gender, createdat
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        (await sessionExistence(matOrReg)).session_id,
        await idGenerator.clientID(),
        email.toLowerCase(),
        matOrReg.toLowerCase(),
        fName.toLowerCase(),
        mName.toLowerCase(),
        lName.toLowerCase(),
        "member",
        hashedPassword,
        gender.toLowerCase(),
        dayjs().format(),
      ]
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

    //Company Reg alert
    const msg = {
      from: "NUNSA UCC <reventlifyhub@outlook.com>", // sender address
      to: "edijay17@gmail.com", // list of receivers
      subject: "Newly Registered Student", // Subject line
      text: `Congrats ${capNsmalz.neat(
        newClient.rows[0].student_fname
      )} just successfully registered with NUNSA UCC.`, // plain text body
      html: `<h1>Newly Registered Student</h1>
      <p>Congrats ${capNsmalz.neat(
        newClient.rows[0].student_fname
      )} just successfully registered with <strong>NUNSA UCC</strong></p>`, //HTML message
    };

    //Welcome Message
    const msg1 = {
      from: "NUNSA UCC <reventlifyhub@outlook.com>", // sender address
      to: newClient.rows[0].student_email, // list of receivers
      subject: "Welcome To NUNSA UCC", // Subject line
      text: `${capNsmalz.neat(
        newClient.rows[0].student_fname
      )} welcome to NUNSA UCC.`, // plain text body
      html: `<h2>Welcome To NUNSA UCC</h2>
        <p>${capNsmalz.neat(
          newClient.rows[0].student_fname
        )} welcome to <strong>NUNSA UCC</strong>.</p>`, //HTML message
    };

    // send mail with defined transport object
    // await transport.sendMail(msg);
    await transport.sendMail(msg1);

    // deletes client from limbo
    await pool.query("DELETE FROM studentslimbo WHERE student_email = $1", [
      email,
    ]);

    // return
    return res.status(200).json({ Registration: "Successful!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Sorry something went wrong.");
  }
};
