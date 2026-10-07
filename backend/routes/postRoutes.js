const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  getPostImage,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed')),
});

const uploadImage = (req, res, next) =>
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 3 MB' : err.message;
      return res.status(400).json({ success: false, message });
    }
    next();
  });

// Public on purpose: <img> tags can't send the Authorization header
router.get('/:id/image', getPostImage);

router.route('/')
  .get(protect, getPosts)
  .post(protect, uploadImage, createPost);

router.route('/:id')
  .get(protect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
