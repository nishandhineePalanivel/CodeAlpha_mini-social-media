const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    if (!req.body.content) {
      return res.status(400).json({ success: false, message: 'Please add content' });
    }

    const post = await Post.create({
      content: req.body.content,
      image: req.body.image || null,
      user: req.user.id,
    });

    const populatedPost = await post.populate('user', 'name username profileImage');
    res.status(201).json({ success: true, message: 'Post created successfully', data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name username profileImage');

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name username profileImage');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check for user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    ).populate('user', 'name username profileImage');

    res.json({ success: true, message: 'Post updated', data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check for user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this post' });
    }

    // Cascade delete comments and likes associated with this post
    await Comment.deleteMany({ post: req.params.id });
    await Like.deleteMany({ post: req.params.id });
    
    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
