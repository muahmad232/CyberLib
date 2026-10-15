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


bookSchema.index({ title: 'text', authors: 'text', description: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ rating: -1 });


const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
