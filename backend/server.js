const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/followRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));

// Nested aliases
const { addComment, getComments } = require('./controllers/commentController');
const { likePost, unlikePost, getLikes } = require('./controllers/likeController');
const { protect } = require('./middleware/authMiddleware');

app.post('/api/posts/:postId/comments', protect, addComment);
app.get('/api/posts/:postId/comments', getComments);
app.post('/api/posts/:postId/like', protect, likePost);
app.delete('/api/posts/:postId/like', protect, unlikePost);
app.get('/api/posts/:postId/likes', getLikes);

// Comment routes the frontend calls: /api/comments/:postId
app.get('/api/comments/:postId', getComments);
app.post('/api/comments/:postId', protect, addComment);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
