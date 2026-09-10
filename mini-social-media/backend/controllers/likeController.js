const Like = require('../models/Like');
const Post = require('../models/Post');

// @desc    Like a post
// @route   POST /api/posts/:postId/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const like = await Like.create({
      post: req.params.postId,
      user: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Post liked', data: like });
  } catch (error) {
    // Check if it's a duplicate like error (MongoDB code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You already liked this post' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:postId/like
// @access  Private
const unlikePost = async (req, res) => {
  try {
    const like = await Like.findOne({ post: req.params.postId, user: req.user.id });

    if (!like) {
      return res.status(404).json({ success: false, message: 'Like not found' });
    }

    await like.deleteOne();
    res.json({ success: true, message: 'Post unliked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get likes for a post
// @route   GET /api/posts/:postId/likes
// @access  Public
const getLikes = async (req, res) => {
  try {
    const likes = await Like.find({ post: req.params.postId }).populate('user', 'name username profileImage');
    res.json({ success: true, data: likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getLikes,
};
