import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({   
  room: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  createdAt: { 
    type: Date, 
    default: Date.now,
  }
});

messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Message = mongoose.model('Message', messageSchema);

export default Message;