const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// GET /api/user/profile - get user's profile and book counts
router.get('/', protect, getUserProfile);
router.post('/upload', protect, updateUserProfileImage);

module.exports = router;
