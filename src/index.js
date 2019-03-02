const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New Websocket Connection");

  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A new user has joined"); //broadcast to all except the one owned the socket

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not Allowed");
    }

    io.emit("message", message); // broadcast to all connected client
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${location.lat},${location.long}`
    );

    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}!`);
});
