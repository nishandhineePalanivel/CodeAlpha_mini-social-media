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

  return posts.map(({ image, ...p }) => ({
    ...p,
    hasImage: !!(image && image.contentType),
    likesCount: likeMap[p._id.toString()] || 0,
    commentsCount: commentMap[p._id.toString()] || 0,
  }));
}

// POST /api/posts  (multipart: content + optional image)
const createPost = async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Write something or add an image' });
    }

    const post = await Post.create({
      user: req.user.id,
      content,
      ...(req.file && { image: { data: req.file.buffer, contentType: req.file.mimetype } }),
    });
    res.status(201).json({ success: true, data: { _id: post._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts  (optional ?userId=)
const getPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;

    const posts = await Post.find(filter)
      .select('-image.data')
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
      .select('-image.data')
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

// GET /api/posts/:id/image
const getPostImage = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('image');
    if (!post || !post.image || !post.image.data) return res.status(404).end();
    res.set('Content-Type', post.image.contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(post.image.data);
  } catch (error) {
    res.status(404).end();
  }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost, getPostImage };
