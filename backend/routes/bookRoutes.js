const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, bookController.unifiedSearch);
router.get('/recommendations', protect, bookController.recommendBooks);

module.exports = router;
