const pool = require("../../../../../../db");
const cloudinary = require("../../../../../../utilities/cloudinary");
const { sizeChecker } = require("../../../../../../utilities/sizeChecker");

exports.uploadDP = async (req, res) => {
  try {
    const user = req.user;
    const { img } = req.body;

    if (img === null) return res.status(400).json("Please select an Image...");

    const size = sizeChecker(img).MB;

    if (size > 10) return res.status(400).json("Media larger than 10MB");

    const userExists = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [user]
    );
    if (userExists.rows.length === 0)
      return res.status(404).json("No student found...");

    // gets the previous logo ID
    const imgId = userExists.rows[0].student_photo_id;

    if (imgId !== null) {
      // deletes the previous logo
      await cloudinary.uploader.destroy(imgId);
    }
    //uploads the image to cloudinary and gets the url and id
    const resultOfUpdate = await cloudinary.uploader.upload(img, {
      folder: "Profile_photos",
    });

    // updates the database
    await pool.query(
      "UPDATE students SET (student_photo, student_photo_id) = ($1, $2) WHERE student_id = $3",
      [resultOfUpdate.secure_url, resultOfUpdate.public_id, user]
    );
    return res.status(200).json(resultOfUpdate.secure_url);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Something went wrong");
  }
};
