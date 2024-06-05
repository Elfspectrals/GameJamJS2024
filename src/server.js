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
const playerPositions = {};
const colors = ["red", "blue", "green", "yellow", "violet", "orange"];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Assign a color to the new player
  const playerColor = colors.pop() || "white";
  playerColors[socket.id] = playerColor;
  playerPositions[socket.id] = { x: 0, y: 1.8, z: -5 }; // Initial position

  // Notify the client of their color
  socket.emit('assignColor', playerColor);

  // Send the list of existing players to the new player
  socket.emit('existingPlayers', Object.keys(playerColors).map(id => ({
    id,
    color: playerColors[id],
    position: playerPositions[id]
  })));

  // Notify existing players about the new player
  socket.broadcast.emit('playerJoined', { id: socket.id, color: playerColor, position: playerPositions[socket.id] });

  socket.on('updatePosition', (position) => {
    playerPositions[socket.id] = position;
    socket.broadcast.emit('updatePosition', { id: socket.id, position });
  });

  socket.on('objectIntersected', (data) => {
    const { objectId, color } = data;
    io.emit('objectIntersected', { objectId, color });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Notify other players about the disconnect
    socket.broadcast.emit('playerLeft', socket.id);
    // Reclaim the color
    colors.push(playerColors[socket.id]);
    delete playerColors[socket.id];
    delete playerPositions[socket.id];
  });
});

server.listen(4001, () => console.log('Listening on port 4001'));
