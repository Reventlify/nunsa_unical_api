// const nodemailer = require("nodemailer");
const pool = require("../../../../../../db");
const { postID } = require("../../../../../../utilities/IDGenerator");
const cloudinary = require("../../../../../../utilities/cloudinary");
const { sizeChecker } = require("../../../../../../utilities/sizeChecker");

exports.postUpload = async (req, res) => {
  const { postText, img, schSession } = req.body;
  const user = req.user;
  try {
    if (user.length > 0 && img !== null) {
      sizeChecker(img);
      // Checks media file size
      if (sizeChecker(img).MB > 10)
        return res.status(400).json("Media larger than 10MB");
      //uploads the image to cloudinary and gets the url and id
      const resultOfUpload = await cloudinary.uploader.upload(img, {
        folder: "nunsaPosts",
      });

      const newPost = await pool.query(
        `
        INSERT INTO posts(
            post_id,
            sch_session,
            student_id,
            post_text,
            post_media,
            post_media_id,
            post_date
        ) VALUES(
            $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
        ) RETURNING *
      `,
        [
          await postID(),
          schSession,
          user,
          postText,
          resultOfUpload.secure_url,
          resultOfUpload.public_id,
        ]
      );
      return res.status(200).json({
        msg: "Successfull!",
        post_id: newPost.rows[0].post_id,
      });
    } else if (user.length > 0 && img === null) {
      const newPost = await pool.query(
        `
          INSERT INTO posts(
              post_id,
              sch_session,
              student_id,
              post_text,
              post_date
          ) VALUES(
              $1, $2, $3, $4, CURRENT_TIMESTAMP
          ) RETURNING *
        `,
        [await postID(), schSession, user, postText]
      );
      return res.status(200).json({
        msg: "Successfull!",
        post_id: newPost.rows[0].post_id,
      });
    } else {
      return res.status(400).json("Empty student_id");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
