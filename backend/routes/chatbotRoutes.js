const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');


// Route to handle fetching book recommendations for the chatbot
router.get('/chatbot/recommendations', chatbotController.chatbotRecommendBooks);

// Route to handle fetching books by author for the chatbot
router.get('/chatbot/author', chatbotController.chatbotBooksByAuthor);

// Route to handle fetching similar books for the chatbot
router.get('/chatbot/similar-books', chatbotController.chatbotSimilarBooks);

module.exports = router;