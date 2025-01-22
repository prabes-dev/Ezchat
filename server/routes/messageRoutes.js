// routes/messageRoutes.js
import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Toggle pin/unpin a message
router.post('/message/pin', async (req, res) => {
  const { messageId, isPinned } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isPinned },
      { new: true }
    );
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;