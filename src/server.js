const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace this with your React app's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:3000", // Replace this with your React app's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["my-custom-header"],
  credentials: true
}));

const playerColors = {};
const colors = ["red", "blue", "green", "yellow", "violet", "orange"];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Assign a color to the new player
  const playerColor = colors.pop() || "white";
  playerColors[socket.id] = playerColor;
  
  // Notify the client of their color
  socket.emit('assignColor', playerColor);

  socket.on('objectIntersected', (data) => {
    const { objectId, color } = data;
    io.emit('objectIntersected', { objectId, color });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Reclaim the color
    colors.push(playerColors[socket.id]);
    delete playerColors[socket.id];
  });
});

server.listen(4001, () => console.log('Listening on port 4001'));
