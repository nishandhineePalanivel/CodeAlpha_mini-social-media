const express = require('express');
// mergeParams required because comments are sometimes accessed via post router
const router = express.Router({ mergeParams: true }); 
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Using /api/posts/:postId/comments format handled via server.js or postRoutes.js
// but here we define direct routes if needed.
// Example: router.post('/', protect, addComment) requires merging params from post router.
// Let's implement the specific routes here mapped to /api/comments for delete, and /api/posts/:postId/comments for get/post

// In server.js we mapped: app.use('/api/comments', commentRoutes)
// So direct DELETE is /api/comments/:id
router.delete('/:id', protect, deleteComment);

// For /api/posts/:postId/comments, we will map it in postRoutes, or define it here and map in server.js
// Actually, let's map it from server.js directly. Wait, the prompt asked for:
// POST /api/posts/:postId/comments
// GET /api/posts/:postId/comments
// DELETE /api/comments/:id
// To keep it simple, we'll expose them on /api/comments with a trick or just change server.js.
// Since server.js already has app.use('/api/posts', postRoutes) and app.use('/api/comments', commentRoutes),
// We can define POST /api/posts/:postId/comments inside server.js or directly here if we use it.

module.exports = router;
