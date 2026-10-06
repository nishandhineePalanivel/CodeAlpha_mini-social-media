const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:postId', getComments);
router.post('/:postId', protect, addComment);

module.exports = router;
