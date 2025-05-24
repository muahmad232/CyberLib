const mongoose = require('mongoose');

// Use the 'library' database for this model
mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the "library" database...'))
  .catch(err => console.error('Could not connect to the "library" database...', err));

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

// Create the Author model using the schema
const Author = mongoose.model('Author', authorSchema);

// Export the Author model
module.exports = Author;
