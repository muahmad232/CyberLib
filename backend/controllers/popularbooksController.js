// controllers/popularBooksController.js
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const PopularBook = require('../models/popularBooks');
const Book = require('../models/book'); 

// Cache popular books response for 5 minutes (300 seconds)
const popularBooksCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// @desc    Get top 5 popular books
// @route   GET /api/popular-books
// @access  Public
exports.getPopularBooks = async (req, res) => {
  try {
    const cached = popularBooksCache.get('popular_books');
    if (cached) {
      return res.status(200).json(cached);
    }

    const popularBooks = await PopularBook.find()
      .sort({ readCount: -1, wishCount: -1 }) // Sort by readCount first, then wishCount
      .limit(5) // Get top 5
      .populate({
        path: 'bookId',
        select: 'coverImage title' // Only get these fields from Book
      });

    // Format the response
    const formattedBooks = popularBooks
      .filter(book => book.bookId)
      .map(book => ({
        _id: book.bookId._id,
        title: book.bookId.title,
        coverImage: book.bookId.coverImage,
        readCount: book.readCount,
        wishCount: book.wishCount
      }));

    popularBooksCache.set('popular_books', formattedBooks);
    res.status(200).json(formattedBooks);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching popular books', 
      error: err.message 
    });
  }
};

const extractBookId = (input) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  if (input?.params?.bookId) return input.params.bookId;
  if (input?.body?.bookId) return input.body.bookId;
  return null;
};

// For when a user reads a book
exports.incrementReadCount = async (req, res) => {
  const bookId = extractBookId(req);
  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    if (res && typeof res.status === 'function') {
      return res.status(400).json({ message: 'Valid bookId is required' });
    }
    return null;
  }

  try {
    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { readCount: 1 }, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    popularBooksCache.del('popular_books');
    if (res && typeof res.status === 'function') {
      return res.status(200).json({ message: 'Read count incremented', popularBook });
    }
    return popularBook;
  } catch (err) {
    console.error('Error incrementing read count:', err);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: 'Error incrementing read count', error: err.message });
    }
  }
};

// For when a user wishlists a book
exports.incrementWishCount = async (req, res) => {
  const bookId = extractBookId(req);
  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    if (res && typeof res.status === 'function') {
      return res.status(400).json({ message: 'Valid bookId is required' });
    }
    return null;
  }

  try {
    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { wishCount: 1 }, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    popularBooksCache.del('popular_books');
    if (res && typeof res.status === 'function') {
      return res.status(200).json({ message: 'Wish count incremented', popularBook });
    }
    return popularBook;
  } catch (err) {
    console.error('Error incrementing wish count:', err);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: 'Error incrementing wish count', error: err.message });
    }
  }
};

// For when a user removes a book from the reading list (decrement)
exports.decrementReadCount = async (req, res) => {
  const bookId = extractBookId(req);
  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Valid bookId is required' });
  }

  try {
    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { readCount: -1 }, lastUpdated: Date.now() },
      { new: true }
    );

    if (!popularBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    popularBooksCache.del('popular_books');
    res.status(200).json({ message: 'Read list updated successfully', popularBook });
  } catch (err) {
    console.error('Error removing from read list:', err);
    res.status(500).json({ message: 'Error updating read list', error: err.message });
  }
};

// For when a user removes a book from the wishlist (decrement)
exports.decrementWishCount = async (req, res) => {
  const bookId = extractBookId(req);
  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Valid bookId is required' });
  }

  try {
    const popularBook = await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { wishCount: -1 }, lastUpdated: Date.now() },
      { new: true }
    );

    if (!popularBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    popularBooksCache.del('popular_books');
    res.status(200).json({ message: 'Wishlist updated successfully', popularBook });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error updating wishlist', error: err.message });
  }
};
