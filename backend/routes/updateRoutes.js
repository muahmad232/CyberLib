const express = require('express');
const router = express.Router();
const { updateUserProfileImage } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Protect middleware to ensure user is authenticated

// Route for updating user profile image
router.post('/profile/image', protect, updateUserProfileImage);

module.exports = router;
