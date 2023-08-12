//dependencies
require("dotenv").config();
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const port = 5000;
//requires root
const authRoute = require("./routes/auth-routes");
const usersRoute = require("./routes/users-routes");
const { sendMessage } = require("./websockets/sendMessage");
// const pool = require("./db");

// const dataChecker = async() => {
//   try {
//    const time = await pool.query(`SELECT createdat from studentslimbo WHERE student_email = 'edijay17@gmail.com'`);
//    return console.log(dayjs(time.rows[0].createdat).format("HH:mm:ss"));
//   } catch (error) {
//    return console.log(error);
//   }
// }
// dataChecker();
const app = express();
// const whitelist = [process.env.URL, "https://api.paystack.co"];
const whitelist = [process.env.URL];
const corsOptions = {
  optionsSuccessStatus: 200,
  Credential: true,
  origin: whitelist,
};
// const corsOptions = {
//   optionsSuccessStatus: 200,
//   Credential: true,
//   // origin: "*",
// };

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cors(corsOptions));

//ROUTES
app.use("/auth", authRoute);
app.use("/user", usersRoute);

const server = app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});
const io = require("socket.io")(server, { cors: { corsOptions } });
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("send_message", (message) => {
    sendMessage(message);
    socket.broadcast.emit("receive_message", message);
  });
});
