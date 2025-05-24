const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      interests: [],
      wishlist: [],
      readlist: []
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(savedUser._id),
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        email: savedUser.email,
        interests: savedUser.interests // 👈 included interests
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        interests: user.interests 
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
