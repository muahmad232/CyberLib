const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },

  
  password: String,
  interests: [String], 
  image:[String],
  readBooks: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    dateRead: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 }
  }],
  wishlist: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    dateAdded: { type: Date, default: Date.now }
  }]
});


module.exports = mongoose.model('User', userSchema);
