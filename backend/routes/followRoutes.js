const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

// Base route is /api/users (Wait, follow uses /api/users/:id/follow, I will add it to userRoutes instead, or handle here)
// I will map this in server.js as app.use('/api/users', followRoutes) to keep it simple, but let's change server.js to fix routes.

router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
