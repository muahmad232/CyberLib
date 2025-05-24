const User = require('../models/user');

const updateInterests = async (req, res) => {
  const { userId, interests } = req.body;

  if (!Array.isArray(interests) || interests.length < 3) {
    return res.status(400).json({ error: 'Please select at least 3 genres.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { interests },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ message: 'Interests updated successfully.', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { updateInterests };