const mongoose = require('mongoose');

const popularBookSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
  title: { type: String, required: true },
  readCount: { type: Number, default: 0 },
  wishCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PopularBook', popularBookSchema);
