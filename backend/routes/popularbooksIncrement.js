const express = require('express');
const router = express.Router();
const {
  incrementReadCount,
  incrementWishCount
} = require('../controllers/popularbooksController');  // Import the controller functions

// @desc    Increment the read count of a book
// @route   POST /api/popular-books/read/:bookId
// @access  Public
router.post('/read/:bookId', incrementReadCount);

// @desc    Increment the wish count of a book
// @route   POST /api/popular-books/wishlist/:bookId
// @access  Public
router.post('/wishlist/:bookId', incrementWishCount);

module.exports = router;
