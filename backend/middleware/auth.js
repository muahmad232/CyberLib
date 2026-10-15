const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token
    token = req.headers.authorization.split(' ')[1];

    // 1. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.error('❌ JWT Verification Failed:', jwtErr.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }

    // 2. Fetch user from database (with retry on transient ECONNRESET)
    try {
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        if (dbErr.message && dbErr.message.includes('ECONNRESET')) {
          console.warn('⚠️ MongoDB socket reset, retrying user lookup...');
          user = await User.findById(decoded.id).select('-password');
        } else {
          throw dbErr;
        }
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found with this token' });
      }

      req.user = user;
      next(); // Proceed to route
    } catch (err) {
      console.error('❌ User Lookup Error:', err.message);
      return res.status(500).json({ message: 'Error retrieving user session' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
