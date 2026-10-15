const Author = require('../models/author');
const { popularAuthorsCache } = require('./popularauthorsController');

// Function to get the details of an author
// authorController.js

// Function to get the details of an author with populated review usernames
exports.getAuthorDetails = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
      .populate({
        path: 'reviews.userId',
        select: 'username name'
      });
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.json(author);
  } catch (err) {
    console.error('Error fetching author details:', err);
    res.status(500).json({ message: 'Error fetching author details', error: err.message });
  }
};

// Function to rate an author (1 rating per user - overrides previous rating)
exports.rateAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const author = await Author.findById(authorId);
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = author.reviews.findIndex(
      r => r.userId && r.userId.toString() === userIdStr
    );

    if (existingIndex !== -1) {
      // Override previous rating
      author.reviews[existingIndex].rating = rating;
      author.reviews[existingIndex].createdAt = Date.now();
    } else {
      // Add new review entry with this rating
      author.reviews.push({
        rating,
        reviewText: '',
        userId: req.user._id,
        createdAt: Date.now()
      });
    }

    // Recalculate average rating & review count accurately from reviews array
    const ratedReviews = author.reviews.filter(r => r.rating && r.rating > 0);
    author.reviewCount = author.reviews.length;
    if (ratedReviews.length > 0) {
      const total = ratedReviews.reduce((sum, r) => sum + r.rating, 0);
      author.rating = parseFloat((total / ratedReviews.length).toFixed(1));
    } else {
      author.rating = rating;
    }

    await author.save();
    if (popularAuthorsCache) popularAuthorsCache.del('popular_authors');

    res.json({ success: true, author });
  } catch (error) {
    console.error('Error rating author:', error);
    res.status(500).json({ error: 'Failed to rate author', message: error.message });
  }
};

// Function to write/update a review for an author (1 review per user - overrides previous)
exports.writeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = author.reviews.findIndex(
      r => r.userId && r.userId.toString() === userIdStr
    );

    if (existingIndex !== -1) {
      // Override existing review text and rating (if provided)
      author.reviews[existingIndex].reviewText = reviewText;
      if (rating && rating >= 1 && rating <= 5) {
        author.reviews[existingIndex].rating = rating;
      }
      author.reviews[existingIndex].createdAt = Date.now();
    } else {
      // Add new review
      author.reviews.push({
        rating: (rating && rating >= 1 && rating <= 5) ? rating : undefined,
        reviewText,
        userId: req.user._id,
        createdAt: Date.now()
      });
    }

    // Recalculate author rating & review count
    const ratedReviews = author.reviews.filter(r => r.rating && r.rating > 0);
    author.reviewCount = author.reviews.length;
    if (ratedReviews.length > 0) {
      const total = ratedReviews.reduce((sum, r) => sum + r.rating, 0);
      author.rating = parseFloat((total / ratedReviews.length).toFixed(1));
    }

    await author.save();
    if (popularAuthorsCache) popularAuthorsCache.del('popular_authors');

    res.status(200).json({ 
      message: existingIndex !== -1 ? 'Review updated successfully' : 'Review submitted successfully', 
      author 
    });
  } catch (err) {
    console.error('Error writing review:', err);
    res.status(500).json({ message: 'Error writing review', error: err.message });
  }
};

// Function to get all reviews for an author (optional, if reviews are stored separately)
exports.getAllReviews = async (req, res) => {
  try {
    const authorId = req.params.id;
    const author = await Author.findById(authorId);

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // Assuming reviews are stored in a bio, or they could be handled separately
    res.json({ success: true, reviews: author.bio });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
};
