const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary credentials are provided in environment
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure the local uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer stores to local disk first to guarantee uploads never fail due to cloud/network errors
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
}).single('image'); // 'image' is the field name in the form

// @desc    Get user profile info
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      interests: user.interests,
      readCount: user.readBooks ? user.readBooks.length : 0,
      wantToReadCount: user.wishlist ? user.wishlist.length : 0,
      image: Array.isArray(user.image) ? (user.image[0] || '') : (user.image || '')
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// @desc    Update user profile image
// @route   POST /api/profile/upload
// @access  Private
exports.updateUserProfileImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload multer error:', err.message);
      return res.status(400).json({ message: err.message, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded', error: 'No image file uploaded' });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found', error: 'User not found' });

      let imageUrl = `/uploads/${req.file.filename}`;

      // If Cloudinary credentials are provided, attempt cloud upload
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'cyberlib_profiles',
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
          });
          imageUrl = result.secure_url;

          // Remove temporary local file after successful Cloudinary upload
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.warn('Could not remove temp upload file:', unlinkErr.message);
          });
        } catch (cloudErr) {
          console.warn('⚠️ Cloudinary upload failed (falling back to local disk storage):', cloudErr.message || cloudErr);
          // Keep local path so the upload still succeeds!
        }
      }

      user.image = imageUrl;
      await user.save();

      res.status(200).json({
        message: 'Profile image updated successfully',
        image: user.image
      });
    } catch (dbErr) {
      console.error('Error saving profile image:', dbErr);
      res.status(500).json({ message: 'Error updating profile image', error: dbErr.message });
    }
  });
};
