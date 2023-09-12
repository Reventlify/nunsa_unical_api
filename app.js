//dependencies
require("dotenv").config();
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { instrument } = require("@socket.io/admin-ui");
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const jwt = require("jsonwebtoken");
const port = 5000;
//requires root
const authRoute = require("./routes/auth-routes");
const usersRoute = require("./routes/users-routes");
const devRoute = require("./routes/dev-routes");
const { sendMessage } = require("./websockets/sendMessage/sendMessage");

const app = express();
const whitelist = ["https://admin.socket.io", process.env.URL];

const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: whitelist,
  // origin: "*",
};

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cors(corsOptions));

//ROUTES
app.use("/auth", authRoute);
app.use("/user", usersRoute);
app.use("/dev", devRoute);

const server = app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});
const io = require("socket.io")(server, { cors: corsOptions });

const connectedSockets = {}; // Map to store connected sockets by socket.id

io.on("connection", async (socket) => {
  const { token } = socket.handshake.query; // Decode the JWT token
  if (!token) {
    // console.log(`Socket disconnected for userID: ${socket.id}`);
    // Handle the case where no token is provided
    socket.disconnect();
    return;
  }
  const decodedT = jwt.decode(token);
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the token
    const userID = decodedToken.user_id;
    // console.log(connectedSockets);

    // Check if the user is already connected
    if (connectedSockets[userID]) {
      const existingSocket = connectedSockets[userID];

      // Disconnect the existing socket
      existingSocket.disconnect();
      delete connectedSockets[socket.id];
    }
    // if (connectedSockets[socket.id]) {
    //   // Store the socket in the connectedSockets map
    //   // connectedSockets[socket.id] = socket;
    //     delete connectedSockets[socket.id];
    //   // console.log(`user connected: ${socket.id}, before: no`);
    //   // Emit a message to the newly connected user
    //   // socket.emit("welcome", decodedT.exp);
    // }
    socket.id = userID;
    connectedSockets[socket.id] = socket;
    const socketToDisconnect = connectedSockets[socket.id];
    let intervalTimer; // Variable to store the interval timer reference
    // Periodically check the token's expiration
    const tokenExpirationCheck = () => {
      // console.log(`Called for user: ${socket.id}`);
      // console.log(connectedSockets);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp <= currentTimestamp) {
        // Token has expired
        // console.log("Called Token has expired");
        socketToDisconnect.disconnect();
        delete connectedSockets[socket.id];
        // console.log("Condition met");
        clearInterval(intervalTimer);
      }
    }; // Check every 10 seconds
    // Start the interval and store the timer reference
    intervalTimer = setInterval(tokenExpirationCheck, 10000); // Run every 10 second
    socket.on("request_disconnect", (user_id) => {
      // console.log(`Socket disconnected for userID: ${socket.id} / ${user_id}`);
      clearInterval(intervalTimer);
      const targetSocket = connectedSockets[user_id];
      if (targetSocket) {
        targetSocket.disconnect();
        delete connectedSockets[user_id];
      }
    });

    // send message
    socket.on("send_message", async (msg, receiver_id) => {
      // console.log(`sent: ${msg}`);
      const recipientSocketId = connectedSockets[receiver_id];
      const messageRes = await sendMessage(msg, receiver_id, socket.id);
      // console.log(messageRes.savedMessage.message_text);
      // socket.broadcast.emit("receive_message", msg);
      if (typeof messageRes !== "string") {
        if (messageRes.delivered) {
          // console.log(`received: ${messageRes.savedMessage.message_text}`);
          // socket
          //   .to(receiver_id)
          // recipientSocketId
          if (recipientSocketId) {
            recipientSocketId.emit("receive_message", [
              messageRes.savedMessage,
            ]);
          }
          socketToDisconnect.emit("receive_message", [messageRes.savedMessage]);
        }
      }
    });

    socket.on("typing", (bool, receiver_id) => {
      const recipientSocketId = connectedSockets[receiver_id];
      if (recipientSocketId) {
        recipientSocketId.emit("isTyping", bool);
      }
    });
  } catch (error) {
    // Check if the token is valid and get the expiration timestamp
    if (decodedT && decodedT.exp) {
      const expirationTimestamp = decodedT.exp;
      // console.log(
      //   "Token expiration timestamp (in seconds since Unix epoch):",
      //   expirationTimestamp
      // );

      // You can convert the timestamp to a JavaScript Date object if needed
      const expirationDate = new Date(expirationTimestamp * 1000);
      // console.log("Token expiration date:", expirationDate);
    } else {
      // console.log('Invalid or missing "exp" claim in the JWT token.');
    }
    // Handle token verification errors
    // console.error("Token verification error:", error);
    socket.disconnect();
  }
});

// // Later in your code, when you want to disconnect a specific socket:
// const userIDToDisconnect = 'user_id_to_disconnect';
// if (connectedSockets[userIDToDisconnect]) {
//   connectedSockets[userIDToDisconnect].disconnect();
//   // Optionally: delete connectedSockets[userIDToDisconnect] to remove it from the map
// }

instrument(io, {
  auth: false,
  mode: "development",
  namespaceName: "/admin",
});
