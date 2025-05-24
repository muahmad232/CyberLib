const express = require('express');
const Book = require('../models/book');  // Assuming you have a Book model
const User = require('../models/user');  // Assuming you have a User model
const router = express.Router();

// Get book details by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate({
        path: 'reviews.userId', // Populate the userId with username
        select: 'username' // Only get the username
      });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Ensure that authors is always returned as an array
    const authors = Array.isArray(book.authors) ? book.authors : [];

    // Calculate average rating
    const totalRatings = book.reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRatings / book.reviews.length || 0; // If no reviews, averageRating is 0

    // Return book details, including reviews and average rating
    res.json({
      title: book.title,
      authors: authors,  // Ensure authors is returned as an array
      coverImage: book.coverImage,
      description: book.description,
      publishedDate: book.publishedDate,
      reviews: book.reviews, // Include the reviews
      averageRating: averageRating,  // Include average rating
      reviewCount: book.reviews.length // Include review count
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching book details', error: err.message });
  }
});

module.exports = router;
