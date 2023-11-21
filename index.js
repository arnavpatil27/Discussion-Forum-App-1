// index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

const onlineUsers = new Set();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('requestUsername');

  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('updateOnlineUsers', Array.from(onlineUsers));
    }
  });

  socket.on('setUsername', (username) => {
    socket.username = username;
    onlineUsers.add(username);
    io.to('chatroom').emit('chat message', `${username} has joined the chat.`);
    io.emit('updateOnlineUsers', Array.from(onlineUsers));
  });

  socket.on('chat message', (msg) => {
    io.to('chatroom').emit('chat message', {
      username: socket.username,
      message: msg
    });
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
