const Chat = require('../models/chat');
const { generateChatResponse } = require('../services/groqService');

// Send message to AI companion and receive Groq + MongoDB RAG answer
exports.sendMessageWithAI = async (req, res) => {
  const { message, chatId } = req.body;
  const userId = req.user._id;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message text is required.' });
  }

  try {
    let chat = null;

    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
    }

    if (!chat) {
      chat = new Chat({
        userId,
        messages: []
      });
    }

    // Save user message to chat history
    chat.messages.push({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    });

    // Call Groq + MongoDB RAG service with conversational history
    const botReplyText = await generateChatResponse({
      message: message.trim(),
      userId,
      history: chat.messages.slice(0, -1)
    });

    // Save bot reply to chat history
    chat.messages.push({
      sender: 'bot',
      text: botReplyText,
      timestamp: new Date()
    });

    await chat.save();

    res.status(200).json({
      chatId: chat._id,
      userMessage: chat.messages[chat.messages.length - 2],
      botMessage: chat.messages[chat.messages.length - 1]
    });
  } catch (err) {
    console.error('Error in sendMessageWithAI:', err);
    res.status(500).json({
      message: 'Failed to process AI chat message',
      error: err.message
    });
  }
};
// Save a new message to the user's active chat (or start a new one)
exports.saveMessage = async (req, res) => {
  const { sender, text, chatId } = req.body;
  const userId = req.user._id;

  try {
    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (chat) {
        // Add to existing chat session
        chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: { messages: { sender, text } }
          },
          { new: true }
        );
      } else {
        // If chatId doesn't exist in DB, start new session
        chat = new Chat({
          userId,
          messages: [{ sender, text }]
        });
        await chat.save();
      }
    } else {
      // Start a new chat session
      chat = new Chat({
        userId,
        messages: [{ sender, text }]
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Error saving message:', err.message);
    res.status(500).json({ message: 'Failed to save message', error: err.message });
  }
};



// Fetch all chat logs for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};

// Fetch a single chat session
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve chat', error: err.message });
  }
};
