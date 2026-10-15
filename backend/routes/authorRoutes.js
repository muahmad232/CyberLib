const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { protect } = require('../middleware/auth');

// Route to get author details
router.get('/author/:id', authorController.getAuthorDetails);

// Route to rate an author (protected)
router.post('/author/:id/rate', protect, authorController.rateAuthor);

// Route to write a review for an author (protected)
router.post('/author/:id/review', protect, authorController.writeReview);

// Optional: Route to get all reviews for an author
router.get('/author/:id/reviews', authorController.getAllReviews);

module.exports = router;
