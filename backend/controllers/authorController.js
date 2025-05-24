const Author = require('../models/author'); // Assuming your model is in 'models/Author.js'

// Function to get the details of an author
// authorController.js

exports.getAuthorDetails = async (req, res) => {
    try {
      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }
  
      res.json(author);
    } catch (err) {
      console.error('Error fetching author details:', err);
      res.status(500).json({ message: 'Error fetching author details', error: err.message });
    }
  };
  

// Function to rate an author (calculate average rating)
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
    const totalRating = (author.rating * author.reviewCount) + rating;
    const newReviewCount = author.reviewCount + 1;
    const newAverageRating = totalRating / newReviewCount;
    author.rating = newAverageRating;
    author.reviewCount = newReviewCount;

    await author.save();

    res.json({ success: true, author });
  } catch (error) {
    console.error('Error rating author:', error);
    res.status(500).json({ error: 'Failed to rate author', message: error.message });
  }
};

// Function to write a review for an author

// Function to write a review for an author
exports.writeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    // Find the author by ID
    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Create a new review
    const newReview = {
      rating,
      reviewText,
      // Optionally include user information if needed
      // userId: req.user.id  // Assuming you have user authentication set up
    };

    // Add the review to the author's reviews array
    author.reviews.push(newReview);
    await author.save();

    res.status(200).json({ message: 'Review submitted successfully', author });
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
