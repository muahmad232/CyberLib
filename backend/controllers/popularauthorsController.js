const Author = require('../models/author');
const NodeCache = require('node-cache');

// Cache popular authors response for 5 minutes (300 seconds)
const popularAuthorsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// @desc    Get top 5 popular authors (highest rated)
// @route   GET /api/authors/popular
// @access  Public
const getPopularAuthors = async (req, res) => {
  try {
    const cached = popularAuthorsCache.get('popular_authors');
    if (cached) {
      return res.status(200).json(cached);
    }

    // Get top 5 popular authors - sorted by rating descending
    const popularAuthors = await Author.aggregate([
      {
        $match: {
          rating: { $exists: true, $gte: 1 }, // Only authors with ratings
          name: { $exists: true, $nin: [null, ""] } // Exclude empty or missing author names
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

    const responsePayload = {
      success: true,
      count: popularAuthors.length,
      data: popularAuthors
    };

    popularAuthorsCache.set('popular_authors', responsePayload);
    res.status(200).json(responsePayload);

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
  getPopularAuthors,
  popularAuthorsCache
};