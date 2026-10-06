   const express = require('express');
   const router = express.Router();
   const { likePost, unlikePost, getMyLikes } = require('../controllers/likeController');
   const { protect } = require('../middleware/authMiddleware');

   router.get('/my-likes', protect, getMyLikes);
   router.post('/:postId', protect, likePost);
   router.delete('/:postId', protect, unlikePost);

   module.exports = router;
