import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './Schema/Message.js';

const app = express();
const server = createServer(app);

// Express middleware
app.use(cors());
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});


app.use(express.static('public'));

// MongoDB connection
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ezchat';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};


// Track online users per room
const onlineUsers = new Map();

// Handle user joining a server
const handleJoinServer = async (socket, { server, username }) => {
  const room = `${server}`;

  // Leave previous room
  if (socket.currentRoom) {
    socket.leave(socket.currentRoom);
    const users = onlineUsers.get(socket.currentRoom);
    if (users) {
      users.delete(socket.currentUsername);
      io.to(socket.currentRoom).emit('users_update', Array.from(users));
    }
  }

  // Join new room
  socket.currentRoom = room;
  socket.currentUsername = username;
  socket.join(room);

  try {
    const messages = await Message.find({ room }).sort({ timestamp: 1 }).lean().exec();
    socket.emit('load_message_history', messages);

    if (!onlineUsers.has(room)) {
      onlineUsers.set(room, new Set());
    }
    onlineUsers.get(room).add(username);
    io.to(room).emit('users_update', Array.from(onlineUsers.get(room)));
  } catch (error) {
    console.error('Error in handleJoinServer:', error);
    socket.emit('error', 'Failed to load message history');
  }
};

// Handle incoming messages
const handleSendMessage = async (socket, messageData) => {
  const room = `${messageData.server}`;
  try {
    const newMessage = new Message({
      room,
      user: messageData.user,
      text: messageData.text,
      timestamp: new Date(messageData.timestamp),
      isPinned: false,
      id: messageData.id,
    });

    await newMessage.save();

    socket.to(room).emit('receive_message', newMessage);
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    socket.emit('error', 'Failed to send message');
  }
};



// Handle disconnection
const handleDisconnect = (socket) => {
  const { currentRoom, currentUsername } = socket;
  if (currentRoom && currentUsername) {
    const users = onlineUsers.get(currentRoom);
    if (users) {
      users.delete(currentUsername);
      io.to(currentRoom).emit('users_update', Array.from(users));
      if (users.size === 0) onlineUsers.delete(currentRoom);
    }
  }
  console.log('User disconnected:', socket.id);
};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_server', async (data, callback) => {
    try {
      await handleJoinServer(socket, data);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Join server failed:', err);
      if (callback) callback({ success: false, error: 'Join failed' });
    }
  });

  socket.on('send_message', (data) => handleSendMessage(socket, data));
  socket.on('disconnect', () => handleDisconnect(socket));
});

// Start the server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);
