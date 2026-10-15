const mongoose = require('mongoose');


const authorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  birth_date: String,
  death_date: String,
  top_work: String,
  work_count: { 
    type: Number, 
    default: 0 
  },
  bio: String,
  subjects: [String], // Similar to 'categories' in Book
  website: String,    // Similar to 'previewLink' in Book
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  image: { 
    type: String, 
    default: '' // URL of the author's image
  },

  reviews: [ 
    {
      rating: { type: Number, min: 1, max: 5 }, 
      reviewText: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now } 
    }
  ]
},

{ 
  timestamps: true // Adds createdAt/updatedAt fields (optional)
});

authorSchema.index({ name: 'text', top_work: 'text' });
authorSchema.index({ rating: -1, reviewCount: -1 });

// Create or retrieve the Author model
const Author = mongoose.models.Author || mongoose.model('Author', authorSchema);

// Export the Author model
module.exports = Author;
