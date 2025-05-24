// routes/popularBooksRoutes.js
const express = require('express');
const router = express.Router();
const { getPopularBooks, 
    incrementReadCount,
    incrementWishCount,
    decrementReadCount,
    decrementWishCount} = require('../controllers/popularbooksController');

router.get('/', getPopularBooks);
// @desc    Increment the read count of a book
// @route   POST /api/popular-books/read/:bookId
// @access  Public
router.post('/read/:bookId', incrementReadCount);

// @desc    Increment the wish count of a book
// @route   POST /api/popular-books/wishlist/:bookId
// @access  Public
router.post('/wishlist/:bookId', incrementWishCount);

// @desc    Decrement the read count of a book
// @route   POST /api/popular-books/remove-read/:bookId
// @access  Public
router.post('/remove-read/:bookId', decrementReadCount);

// @desc    Decrement the wish count of a book
// @route   POST /api/popular-books/remove-wishlist/:bookId
// @access  Public
router.post('/remove-wishlist/:bookId', decrementWishCount);

module.exports = router;
