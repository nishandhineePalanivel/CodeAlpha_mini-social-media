const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for user
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || user.name,
        bio: req.body.bio !== undefined ? req.body.bio : user.bio,
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q
      ? {
          $or: [
            { name: { $regex: req.query.q, $options: 'i' } },
            { username: { $regex: req.query.q, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword }).select('name username profileImage');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers
};
