const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Send message to Groq AI companion with MongoDB RAG
router.post('/message', protect, chatController.sendMessageWithAI);

// Save raw message or start new session (legacy / direct)
router.post('/', protect, chatController.saveMessage);

// Fetch all user chat sessions
router.get('/', protect, chatController.getUserChats);

// Fetch specific session
router.get('/:id', protect, chatController.getChatById);

module.exports = router;
