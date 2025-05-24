const User = require('../models/user');
const Book = require('../models/book');
const PopularBook = require('../models/popularBooks');

// @desc    Add book to user's read list
// @route   POST /api/user/books/read
// @access  Private
exports.addToReadBooks = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          readBooks: {
            bookId,
            ...(rating && { rating }), // Optional rating
            dateRead: Date.now()
          }
        }
      },
      { new: true }
    ).select('readBooks');

    // Update popular books counter
    await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { readCount: 1 }, title: book.title },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Book added to read list',
      readBooks: user.readBooks
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error adding to read list',
      error: err.message
    });
  }
};

// @desc    Add book to user's wishlist
// @route   POST /api/user/books/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          wishlist: {
            bookId,
            dateAdded: Date.now()
          }
        }
      },
      { new: true }
    ).select('wishlist');

    // Update popular books counter
    await PopularBook.findOneAndUpdate(
      { bookId },
      { $inc: { wishCount: 1 }, title: book.title },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Book added to wishlist',
      wishlist: user.wishlist
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error adding to wishlist',
      error: err.message
    });
  }
};

// @desc    Get user's read books with details
// @route   GET /api/user/books/read
// @access  Private
exports.getReadBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'readBooks.bookId',
        select: 'title coverImage authors'
      })
      .select('readBooks');

    res.status(200).json(user.readBooks);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching read books',
      error: err.message
    });
  }
};

// @desc    Get user's wishlist with details
// @route   GET /api/user/books/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist.bookId',
        select: 'title coverImage authors'
      })
      .select('wishlist');

    res.status(200).json(user.wishlist);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching wishlist',
      error: err.message
    });
  }
};

// @desc    Remove book from read list
// @route   DELETE /api/user/books/read/:bookId
// @access  Private
exports.removeFromReadBooks = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { readBooks: { bookId } }
      },
      { new: true }
    ).select('readBooks');

    res.status(200).json({
      message: 'Book removed from read list',
      readBooks: user.readBooks
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error removing from read list',
      error: err.message
    });
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/user/books/wishlist/:bookId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { wishlist: { bookId } }
      },
      { new: true }
    ).select('wishlist');

    res.status(200).json({
      message: 'Book removed from wishlist',
      wishlist: user.wishlist
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error removing from wishlist',
      error: err.message
    });
  }
};

// @desc    Check if book is in user's lists
// @route   GET /api/user/books/status/:bookId
// @access  Private
exports.getBookStatus = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findOne({
      _id: req.user._id,
      $or: [
        { 'readBooks.bookId': bookId },
        { 'wishlist.bookId': bookId }
      ]
    }).select('readBooks wishlist');

    const status = {
      inReadList: user?.readBooks?.some(item => item.bookId.equals(bookId)) || false,
      inWishlist: user?.wishlist?.some(item => item.bookId.equals(bookId)) || false
    };

    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({
      message: 'Error checking book status',
      error: err.message
    });
  }
};