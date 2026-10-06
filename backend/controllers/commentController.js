const Comment = require('../models/Comment');
const Post = require('../models/Post');

// POST /api/comments/:postId
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user.id,
      content: content.trim(),
    });
    await comment.populate('user', 'name username profileImage');

    const commentsCount = await Comment.countDocuments({ post: req.params.postId });
    res.status(201).json({ success: true, data: comment, commentsCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/comments/:postId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name username profileImage')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: comments, commentsCount: comments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addComment, getComments };
