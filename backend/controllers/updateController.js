const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Specify the folder to save the images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Create a unique file name
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
}).single('image'); // 'image' is the field name in the form

// @desc    Update user profile image
// @route   POST /api/user/profile/image
// @access  Private
exports.updateUserProfileImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update the image field with the new image path
      user.image = `/uploads/${req.file.filename}`;  // You can also use cloud storage if necessary

      await user.save();

      res.status(200).json({
        message: 'Profile image updated successfully',
        image: user.image
      });
    } catch (err) {
      res.status(500).json({ message: 'Error updating profile image', error: err.message });
    }
  });
};
