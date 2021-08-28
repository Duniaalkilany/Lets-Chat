

const path = require('path');//node js core module 
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


let queue=[];
//2
const app = express();
//6
const server = http.createServer(app);
//8
const io = socketio(server);

//5 Set static folder//i want puplic folder to set as static folder to access html pages (chat.html,index.html)
app.use(express.static(path.join(__dirname, 'public')));//after this we can open http//:localhost:300

const botName = 'Chat-App';

//9 Run when client connects
io.on('connection', socket => {
  console.log('new WS connection');
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //10 Welcome current user
 
   
    socket.emit('message', formatMessage(botName, 'Welcome to Chat-App!'));
    for (let i=0;i<queue.length;i++ ){
      socket.emit('message', formatMessage(queue[i].name,queue[i].msg));
    }
   


    // Broadcast when a user connects
    //differnce between socket.emit ==> for the single client //socket.broadcast.emit====> all clients except the client that connecting
    //and io.emit =====> for all clients . 

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
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
    queue.push({name:[user.username],msg});
    console.log('queue',queue);

   
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
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
