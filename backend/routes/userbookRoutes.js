const express = require('express');
const { protect } = require('../middleware/auth');
const {
  addToReadBooks,
  getReadBooks,
  removeFromReadBooks,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getBookStatus
} = require('../controllers/userbooksController');
const router = express.Router();

// @desc    Read List Routes
// @route   /api/user/books/read
router.route('/read')
  .post(protect, addToReadBooks)    // Add book to read list
  .get(protect, getReadBooks);      // Get all read books

// @desc    Remove book from the read list
// @route   /api/user/books/read/:bookId
router.route('/read/:bookId')
  .delete(protect, removeFromReadBooks); // Remove book from read list by bookId

// @desc    Wishlist Routes
// @route   /api/user/books/wishlist
router.route('/wishlist')
  .post(protect, addToWishlist)     // Add book to wishlist
  .get(protect, getWishlist);       // Get all wishlist items

// @desc    Remove book from wishlist
// @route   /api/user/books/wishlist/:bookId
router.route('/wishlist/:bookId')
  .delete(protect, removeFromWishlist); // Remove book from wishlist by bookId

// @desc    Book Status Check (if it's in the read list or wishlist)
// @route   /api/user/books/status/:bookId
router.route('/status/:bookId')
  .get(protect, getBookStatus);     // Check book's status in both lists (read list or wishlist)

module.exports = router;
