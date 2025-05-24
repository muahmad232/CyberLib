const Author = require('../models/author'); // Adjust path as needed

// @desc    Get top 5 popular authors (highest rated)
// @route   GET /api/authors/popular
// @access  Public
const getPopularAuthors = async (req, res) => {
  try {
    // Get top 5 popular authors - sorted by rating descending
    const popularAuthors = await Author.aggregate([
      {
        $match: {
          rating: { $exists: true, $gte: 1 } // Only authors with ratings
        }
      },
      {
        $sort: { rating: -1, reviewCount: -1 } // Sort by rating descending, then by number of reviews
      },
      {
        $limit: 5 // Limit to top 5 authors
      },
      {
        $project: {
          name: 1,
          image: 1,
          rating: 1,
          reviewCount: 1,
          top_work: 1,
          _id: 1
        }
      }
    ]);

    // If no authors found with ratings
    if (popularAuthors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No popular authors found',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: popularAuthors.length,
      data: popularAuthors
    });

  } catch (err) {
    console.error('Error fetching popular authors:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular authors',
      error: err.message
    });
  }
};

module.exports = {
  getPopularAuthors
};