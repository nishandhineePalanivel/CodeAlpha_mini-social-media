const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Follow = require('./models/Follow');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    await Like.deleteMany();
    await Follow.deleteMany();

    const createdUsers = await User.insertMany([
      { name: 'John Doe', username: 'johndoe', email: 'john@example.com', password: 'password123', bio: 'Hello World!' },
      { name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', password: 'password123', bio: 'Coding life.' },
      { name: 'Bob Johnson', username: 'bobjohnson', email: 'bob@example.com', password: 'password123' },
    ]);

    const posts = await Post.insertMany([
      { user: createdUsers[0]._id, content: 'This is my very first post on MiniSocial!' },
      { user: createdUsers[1]._id, content: 'Excited to try out this new platform. Looks clean.' },
      { user: createdUsers[2]._id, content: 'Just testing the waters here.' },
    ]);

    await Comment.create({ post: posts[0]._id, user: createdUsers[1]._id, text: 'Welcome John!' });
    await Like.create({ post: posts[0]._id, user: createdUsers[1]._id });
    await Follow.create({ follower: createdUsers[1]._id, following: createdUsers[0]._id });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
