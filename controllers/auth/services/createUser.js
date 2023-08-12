const pool = require("../../../db");

exports.socketTest = async (req, res) => {
  try {
    // io.on("connection", (socket) => {
    //   console.log(socket.id);
    // });
  } catch (error) {
    return console.log(error.message);
  }
};
