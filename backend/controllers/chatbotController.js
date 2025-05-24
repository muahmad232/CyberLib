const Book = require('../models/book');

// Function to get book recommendations based on genre for the chatbot
exports.chatbotRecommendBooks = async (req, res) => {
  const { genre } = req.query;

  // Check if genre is provided
  if (!genre) {
    return res.status(400).json({ message: 'Genre is required for book recommendations.' });
  }

  try {
    // Find books that match the exact genre (case insensitive)
    const books = await Book.find({ genre: { $regex: new RegExp(`^${genre}$`, 'i') } })
      .limit(10);  // Limit the number of books returned

    // Return books to the chatbot interface
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: 'Error fetching books for chatbot', error: error.message });
  }
};

// Function to get books by author for the chatbot
exports.chatbotBooksByAuthor = async (req, res) => {
    const { author } = req.query;
  
    // Check if author is provided
    if (!author) {
      return res.status(400).json({ message: 'Author is required for book recommendations.' });
    }
  
    try {
      // Log the author received in the query for debugging
      console.log('Received author:', author);
  
      // Find books where the "author" array contains a value matching the given author name (case-insensitive)
      const books = await Book.find({
        authors: { $elemMatch: { $regex: new RegExp(author, 'i') } }  // Match any element in the authors array
      })
      .limit(10);  // Limit the number of books returned
  
      // Log the books found for debugging purposes
      console.log('Books found:', books);
  
      if (books.length === 0) {
        return res.status(404).json({ message: `No books found for author: ${author}.` });
      }
  
      res.json(books);  // Return the books to the chatbot
    } catch (error) {
      console.error("Error fetching books by author:", error);
      res.status(500).json({ message: 'Error fetching books by author for chatbot', error: error.message });
    }
  };
  
  // Function to get books similar to a given book based on genre
exports.chatbotSimilarBooks = async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ message: 'Book title is required to suggest similar books.' });
  }

  try {
    // Find the book with the given title
    const book = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });

    if (!book) {
      return res.status(404).json({ message: `No book found with the title: ${title}` });
    }

    // Fetch other books in the same genre
    const similarBooks = await Book.find({
      genre: book.genre
    }).limit(5); // Limit to 5 books

    res.json(similarBooks);
  } catch (error) {
    console.error("Error fetching similar books:", error);
    res.status(500).json({ message: 'Error fetching similar books', error: error.message });
  }
};

  
