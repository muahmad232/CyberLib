const express = require('express');
const Book = require('../models/book');
const { protect } = require('../middleware/auth'); // Assuming you have auth middleware to protect the route
const router = express.Router();

// @desc    Add or update a review and rating for a book (1 review per user)
// @route   POST /api/books/review/:id
// @access  Private (must be logged in)
router.post('/:id', protect, async (req, res) => {
  try {
    const { reviewText, rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const userIdStr = req.user._id.toString();

    // Check if user already reviewed this book
    const existingIndex = book.reviews.findIndex(
      r => r.userId && r.userId.toString() === userIdStr
    );

    if (existingIndex !== -1) {
      // Override previous review
      book.reviews[existingIndex].reviewText = reviewText;
      book.reviews[existingIndex].rating = rating;
      book.reviews[existingIndex].date = Date.now();
    } else {
      // Add first review by this user
      book.reviews.push({
        userId: req.user._id,
        reviewText,
        rating,
        date: Date.now()
      });
    }

    // Recalculate reviewCount and averageRating
    book.reviewCount = book.reviews.length;
    const totalRatings = book.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    book.averageRating = book.reviews.length > 0 
      ? parseFloat((totalRatings / book.reviews.length).toFixed(1)) 
      : 0;
    book.rating = book.averageRating;
    await book.save();

    res.status(200).json({
      message: existingIndex !== -1 ? 'Review updated successfully' : 'Review and rating added successfully',
      book
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error adding review and rating',
      error: err.message
    });
  }
});

module.exports = router;
