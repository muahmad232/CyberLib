const mongoose = require('mongoose');

const popularBookSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
  title: { type: String, required: true },
  readCount: { type: Number, default: 0 },
  wishCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

popularBookSchema.index({ bookId: 1 }, { unique: true });
popularBookSchema.index({ readCount: -1, wishCount: -1 });

module.exports = mongoose.model('PopularBook', popularBookSchema);
