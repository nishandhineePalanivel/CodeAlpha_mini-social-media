const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    // User cannot follow themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const follow = await Follow.create({
      follower: req.user.id,
      following: req.params.id,
    });

    res.status(201).json({ success: true, message: 'User followed successfully', data: follow });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You are already following this user' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user.id,
      following: req.params.id,
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: 'You are not following this user' });
    }

    await follow.deleteOne();
    res.json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id }).populate('follower', 'name username profileImage');
    res.json({ success: true, data: followers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get users following by a user
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id }).populate('following', 'name username profileImage');
    res.json({ success: true, data: following });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
