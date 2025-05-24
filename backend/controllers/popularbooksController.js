// controllers/popularBooksController.js
const PopularBook = require('../models/popularBooks');
const Book = require('../models/book'); 

// @desc    Get top 5 popular books
// @route   GET /api/popular-books
// @access  Public
exports.getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await PopularBook.find()
      .sort({ readCount: -1, wishCount: -1 }) // Sort by readCount first, then wishCount
      .limit(5) // Get top 5
      .populate({
        path: 'bookId',
        select: 'coverImage title' // Only get these fields from Book
      });

    // Format the response
    const formattedBooks = popularBooks.map(book => ({
      _id: book.bookId._id,
      title: book.bookId.title,
      coverImage: book.bookId.coverImage,
      readCount: book.readCount,
      wishCount: book.wishCount
    }));

    res.status(200).json(formattedBooks);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching popular books', 
      error: err.message 
    });
  }
};

// For when a user reads a book
exports.incrementReadCount = async (bookId) => {
  await PopularBook.findOneAndUpdate(
    { bookId },
    { $inc: { readCount: 1 }, lastUpdated: Date.now() },
    { upsert: true }
  );
};

// For when a user wishlists a book
exports.incrementWishCount = async (bookId) => {
  await PopularBook.findOneAndUpdate(
    { bookId },
    { $inc: { wishCount: 1 }, lastUpdated: Date.now() },
    { upsert: true }
  );
};

// For when a user removes a book from the reading list (decrement)
exports.decrementReadCount = async (req, res) => {
  const { bookId } = req.params;

  try {
    // Find and update the popular book document
    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { readCount: -1 }, lastUpdated: Date.now() },
      { new: true }
    );

    if (!popularBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Read list updated successfully', popularBook });
  } catch (err) {
    console.error('Error removing from read list:', err);
    res.status(500).json({ message: 'Error updating read list', error: err.message });
  }
};

// For when a user removes a book from the wishlist (decrement)
// controllers/popularBooksController.js

// Decrement the wish count for a book
exports.decrementWishCount = async (req, res) => {
  const { bookId } = req.params;

  try {

    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { wishCount: -1 }, lastUpdated: Date.now() },
      { new: true }
    );

    if (!popularBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Wishlist updated successfully', popularBook });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error updating wishlist', error: err.message });
  }
};
