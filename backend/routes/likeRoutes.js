const express = require('express');
const router = express.Router({ mergeParams: true });
const { likePost, unlikePost, getLikes } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

// To support /api/posts/:postId/like
// It's mapped in postRoutes below, but we can also use /api/likes if needed.
// Wait, the easiest is to put them here and in server.js route it appropriately.

module.exports = router;
