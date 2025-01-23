// server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './models/Message.js';
import messageRoutes from './routes/messageRoutes.js';


const app = express();
const server = createServer(app);
app.use('/api', messageRoutes);
// has a problem of connecting using env
const io = new Server(server, {
  cors: {
    // origin: process.env.CLIENT_URL || 'http://localhost:5173',
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
// has a problem of connecting using env
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prabes59:sLMC71ug1QzhM8OL@ezchat.6745k.mongodb.net/';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
// Online users map
const onlineUsers = new Map();

// Socket event handlers
const handleJoinServer = async (socket, { server, group, username }) => {
  const room = `${server}-${group}`;
  
  // Leave current room if exists
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
    // Load message history
    const messages = await Message.find({ room }).sort({ timestamp: 1 }).lean().exec();
    socket.emit('load_message_history', messages);

    // Update online users
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

const handleSendMessage = async (socket, messageData) => {
  const room = `${messageData.server}-${messageData.group}`;
  try {
    const newMessage = new Message({ 
      room,
      user: messageData.user,
      text: messageData.text,
      timestamp: new Date(messageData.timestamp),
      isPinned: false,
      id: messageData.id,
      createdAt: new Date()
    });
    await newMessage.save();

    io.to(room).emit('receive_message', newMessage);
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    socket.emit('error', 'Failed to send message');
  }
};

const handlePinMessage = async (socket, { messageId, roomKey, isPinned }) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId, // Use MongoDB's _id
      { isPinned },
      { new: true }
    );
    
    if (!updatedMessage) throw new Error('Message not found');

    // Emit to all clients in the room
    io.to(roomKey).emit('pin_update', { 
      messageId: updatedMessage._id,
      roomKey,
      isPinned: updatedMessage.isPinned
    });
  } catch (error) {
    console.error('Error in handlePinMessage:', error);
    socket.emit('error', 'Failed to update pin status');
  }
};

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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_server', (data) => handleJoinServer(socket, data));
  socket.on('send_message', (data) => handleSendMessage(socket, data));
  socket.on('pin_message', (data) => handlePinMessage(socket, data));
  socket.on('disconnect', () => handleDisconnect(socket));
});

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);