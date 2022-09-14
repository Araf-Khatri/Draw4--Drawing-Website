const express = require('express');
const socket = require('socket.io');

const app = express(); // initialize

app.use(express.static('public'));

const port = 5000;
const server = app.listen(port, () => {
  console.log('Listening to port', port);
});

const io = socket(server);
// ^- will create connection with server

io.on('connection', (socket) => {
  console.log('Connected');

  // Recieved data
  socket.on('beginPath', (data) => {
    // data from front-end.
    // Transfering data to all connected users
    io.sockets.emit('beginPath', data);
  });

  socket.on('drawStroke', (data) => {
    io.sockets.emit('drawStroke', data);
  });

  socket.on('redoUndo', (data) => {
    io.sockets.emit('redoUndo', data);
  });
  
  socket.on('width', (width, flag, size) => {
    io.sockets.emit('width', width, flag, size)
  })

});
