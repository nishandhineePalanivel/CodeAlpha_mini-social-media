const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', searchUsers); // Place before /:id so it doesn't get treated as an ID
router.route('/:id').get(getUserProfile).put(protect, updateUserProfile);

module.exports = router;
