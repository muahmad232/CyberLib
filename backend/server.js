const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const profileRoutes = require('./routes/profileRoutes');
const popularBooksRoutes = require('./routes/popularbookRoutes');
const userBooksRoutes = require('./routes/userbookRoutes');
const popularAuthorsRoutes = require('./routes/popularAuthorsRoutes');
const bookDetailRoutes = require('./routes/bookdetailRouter');  // Import the book detail route
const bookReviewRouter = require('./routes/bookreviewRouter');  // Import the review and rating route
const chatbotRoutes = require('./routes/chatbotRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authorRoutes = require('./routes/authorRoutes');  // Import the author routes
// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Mongoose will automatically reconnect.');
});

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting: 300 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));
app.use(bodyParser.json());

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(uploadsDir));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/popular-books', popularBooksRoutes);
app.use('/api/user/books', userBooksRoutes);
app.use('/api/popular-authors', popularAuthorsRoutes);
app.use('/api/books', bookDetailRoutes);
app.use('/api/books/review', bookReviewRouter);  
app.use('/api', chatbotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/authors', authorRoutes);  

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
