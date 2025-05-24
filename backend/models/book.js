const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  publishedDate: String,
  isbn: [String],
  genre: String,
  description: String,
  previewLink: String,
  coverImage: String,
  rating: { type: Number, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      reviewText: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 }
});


bookSchema.index({ title: 'text' });
bookSchema.index({ "authors": 'text' });


const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
