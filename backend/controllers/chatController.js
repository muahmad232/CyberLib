const Chat = require('../models/chat');

// Save a new message to the user's active chat (or start a new one)
exports.saveMessage = async (req, res) => {
  const { sender, text, chatId } = req.body;
  const userId = req.user._id;

  try {
    console.log('Request received to save message');
    console.log('Sender:', sender);
    console.log('Text:', text);
    console.log('ChatId:', chatId);
    console.log('UserId:', userId);

    let chat;

    if (chatId) {
      // If chatId exists, try to find the existing chat session
      console.log(`ChatId found: ${chatId}, attempting to update the existing chat session...`);
      chat = await Chat.findById(chatId);

      if (chat) {
        console.log('Chat found, appending message...');
        // Add to existing chat session
        chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: { messages: { sender, text } } // Append to messages array
          },
          { new: true }
        );
        console.log('Message appended successfully!');
      } else {
        console.log('Chat not found, creating a new chat...');
        // If the chatId doesn't exist in the database (unexpected), create a new chat session
        chat = new Chat({
          userId,
          messages: [{ sender, text }] // Add the first message to the new chat
        });
        await chat.save();
        console.log('New chat session created!');
      }
    } else {
      // If no chatId, start a new chat session
      console.log('No ChatId provided, creating a new chat session...');
      chat = new Chat({
        userId,
        messages: [{ sender, text }] // Add the first message to the new chat
      });
      await chat.save();
      console.log('New chat session created!');
    }

    res.status(200).json(chat); // Return the updated chat object
  } catch (err) {
    console.error('Error saving message:', err);
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

// Optional: Fetch a single chat session
// exports.getChatById = async (req, res) => {
//   try {
//     const chat = await Chat.findOne({
//       _id: req.params.id,
//       userId: req.user._id
//     });

//     if (!chat) return res.status(404).json({ message: 'Chat not found' });

//     res.status(200).json(chat);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to retrieve chat', error: err.message });
//   }
// };
