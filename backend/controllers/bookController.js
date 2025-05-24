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

  try {
    // Case-insensitive search for authors
    const authors = await Author.find({
      $or: [
        { name: { $regex: query.trim(), $options: 'i' } },
        { top_work: { $regex: query.trim(), $options: 'i' } }
      ]
    })
    .select('name top_work image');  // Ensure image is included in the selection

    // Case-insensitive search for books, returning coverImage explicitly
    const books = await Book.find({
      $or: [
        { title: { $regex: query.trim(), $options: 'i' } },
        { authors: { $regex: query.trim(), $options: 'i' } },
        { "authors.name": { $regex: query.trim(), $options: 'i' } }
      ]
    }).select('title authors genre coverImage previewLink');

    res.json({
      success: true,
      results: {
        authors,
        books
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
        $sample: { size: 1000 }
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