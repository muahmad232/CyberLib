const Book = require('../models/book');
const User = require('../models/user');
const Author = require('../models/author');

exports.unifiedSearch = async (req, res) => {
  const { q: query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ 
      error: 'Search query cannot be empty',
      results: { books: [], authors: [] }
    });
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const skip = (page - 1) * limit;

  try {
    const searchRegex = new RegExp(query.trim(), 'i');

    const [authors, books, totalBooks] = await Promise.all([
      // Top 5 matching authors
      Author.find({
        $or: [
          { name: { $regex: searchRegex } },
          { top_work: { $regex: searchRegex } }
        ]
      })
      .select('name top_work image rating')
      .limit(10),

      // Paginated books
      Book.find({
        $or: [
          { title: { $regex: searchRegex } },
          { authors: { $regex: searchRegex } },
          { "authors.name": { $regex: searchRegex } }
        ]
      })
      .select('title authors genre coverImage previewLink rating')
      .skip(skip)
      .limit(limit),

      // Total count for pagination metadata
      Book.countDocuments({
        $or: [
          { title: { $regex: searchRegex } },
          { authors: { $regex: searchRegex } },
          { "authors.name": { $regex: searchRegex } }
        ]
      })
    ]);

    res.json({
      success: true,
      results: {
        authors,
        books,
        pagination: {
          page,
          limit,
          totalBooks,
          totalPages: Math.ceil(totalBooks / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message,
      results: { books: [], authors: [] }
    });
  }
};


exports.recommendBooks = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.interests || user.interests.length < 3) {
      return res.status(200).json([]);
    }

    // Get the user's previously recommended books if they exist
    const previouslyRecommended = user.recommendedBooks || [];
    
    const lowercasedInterests = user.interests.map(interest => interest.toLowerCase());

    const recommendations = await Book.aggregate([
      {
        $match: {
          $expr: {
            $in: [
              { $toLower: "$genre" },
              lowercasedInterests
            ]
          },
          _id: { $nin: previouslyRecommended }
        }
      },
      {
        $project: {
          title: 1,
          authors: 1,
          genre: 1,
          coverImage: 1,
          previewLink: 1
        }
      },
      {
        $sample: { size: 25 }
      }
    ]);

    // Update user's recommendedBooks array with the new recommendations
    const newRecommendationIds = recommendations.map(book => book._id);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { recommendedBooks: { $each: newRecommendationIds } }
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};