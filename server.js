'use strict'

const path = require('path');//node js core module to read    public file?
const http = require('http');//package or module 
//1
const express = require('express');
//7
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

// to save msg for the stream 
let queue=[];

const app = express();

const server = http.createServer(app);

const io = socketio(server);

// Set static folder//i want puplic folder to set as static folder to access html pages (chat.html,index.html)
app.use(express.static(path.join(__dirname, 'public')));//after this we can open http//:localhost:300

const botName = 'Chat-App';

//9 Run when client connects

io.on('connection', socket => {
  console.log('new WS connection');
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit('message', formatMessage(botName, 'Welcome to Chat-Stream!'));
    for (let i=0;i<queue.length;i++ ){
      socket.emit('message', formatMessage(queue[i].name,queue[i].msg));
    }
   


    // Broadcast when a user connects
    //differnce between socket.emit ==> for the single client //socket.broadcast.emit====> all clients except the client that connecting
    //and io.emit =====> for all clients . 

    socket.broadcast.to(user.room).emit('message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
    console.log(user.username);
    console.log(msg);
    queue.push({name:[user.username],msg});//push username ,msg to queue to save data if client disconnect and reconnect
    console.log('queue',queue);

   
  });

  //  client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info" left"
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
//3
const PORT = process.env.PORT || 3000;
//4
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
