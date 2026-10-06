const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

async function withCounts(posts) {
  if (!posts.length) return posts;
  const ids = posts.map((p) => p._id);

  const [likes, comments] = await Promise.all([
    Like.aggregate([
      { $match: { post: { $in: ids } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { post: { $in: ids } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
  ]);

  const likeMap = Object.fromEntries(likes.map((c) => [c._id.toString(), c.count]));
  const commentMap = Object.fromEntries(comments.map((c) => [c._id.toString(), c.count]));

  return posts.map((p) => ({
    ...p,
    likesCount: likeMap[p._id.toString()] || 0,
    commentsCount: commentMap[p._id.toString()] || 0,
  }));
}

// POST /api/posts
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    const post = await Post.create({ user: req.user.id, content: content.trim() });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name username profileImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: await withCounts(posts) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username profileImage')
      .lean();
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const [data] = await withCounts([post]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Like.deleteMany({ post: post._id });
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPost, getPosts, getPostById, deletePost };
