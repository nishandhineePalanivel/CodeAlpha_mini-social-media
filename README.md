# MiniSocial - Full-Stack Social Media Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-brightgreen?style=for-the-badge&logo=render)](https://mini-social-media-mvvd.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

A modern, fully functional, database-backed full-stack social media web application built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Vanilla JavaScript**.

👉 **[Click Here to Access Live Application](https://mini-social-media-mvvd.onrender.com/)**

---

## 🌟 Key Features

- **🌐 Live Production Web App**: Deployed and hosted on Render connected to MongoDB Atlas.
- **👤 Database-Backed User Profiles**: User registration, secure password hashing (`bcryptjs`), JWT authentication token management, customizable user bio, name, email, posts count, followers count, and following count.
- **📰 Persistent Feed & Posts**: Real database-stored posts with MongoDB ObjectIDs and timestamps. Refreshing the browser preserves all posts.
- **💬 Interactive Comment System**: View and add comments under any post with immediate, non-refresh UI updates, commenter username rendering, and validation.
- **❤️ Like & Unlike System**: Real-time database likes with toggleable like/unlike states, persistent counts, and compound unique constraints to prevent duplicate likes.
- **👥 Follow & Unfollow System**: Dynamic follow toggle buttons on profiles, follower/following count updates, duplicate follow prevention, and self-follow rejection.
- **🔍 User Search**: Real-time user search functionality by username or name powered by MongoDB regex queries.
- **🎨 Modern Instagram-Inspired UI**: Preserved clean responsive design, card layouts, smooth transitions, and built-in Dark/Light theme switcher.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom CSS Variables & Theme Modes), Vanilla JavaScript (ES6 Fetch API, Async/Await, DOM manipulation).
- **Backend**: Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS middleware, Morgan logger.
- **Database**: MongoDB with Mongoose ORM (Compound unique indexes, Schema validation, Population).
- **Hosting / Deployment**: Render.com & MongoDB Atlas Cloud.

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user with name, username, email & password |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT token |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile data |

### 👤 Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Public | List all users or search via `?q=` |
| `GET` | `/api/users/search` | Public | Search users by username or name |
| `GET` | `/api/users/:id` | Public | Get user profile with posts, followers & following counts |
| `PUT` | `/api/users/:id` | Private | Update authenticated user name and bio |
| `GET` | `/api/users/:id/posts` | Public | Fetch all posts created by a specific user |

### 📝 Posts (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Fetch main feed posts (sorted newest first) |
| `GET` | `/api/posts/:id` | Public | Get single post details by ID |
| `POST` | `/api/posts` | Private | Create a new post |
| `PUT` | `/api/posts/:id` | Private | Update post content (Author only) |
| `DELETE` | `/api/posts/:id` | Private | Delete post and cascade delete comments/likes (Author only) |

### 💬 Comments (`/api/posts/:postId/comments`, `/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:postId/comments` | Public | Fetch all comments for a post |
| `POST` | `/api/posts/:postId/comments` | Private | Add a comment to a post |
| `DELETE` | `/api/comments/:id` | Private | Delete comment (Author only) |

### ❤️ Likes (`/api/posts/:postId/like`, `/api/posts/:postId/likes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts/:postId/like` | Private | Like a post (Prevents duplicate likes) |
| `DELETE` | `/api/posts/:postId/like` | Private | Unlike a post |
| `GET` | `/api/posts/:postId/likes` | Public | Get list of users who liked the post |

### 👥 Follows (`/api/users/:id/follow`, `/api/users/:id/followers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/:id/follow` | Private | Follow user (Prevents self-follow & duplicates) |
| `DELETE` | `/api/users/:id/follow` | Private | Unfollow user |
| `GET` | `/api/users/:id/followers` | Public | Get followers list for a user |
| `GET` | `/api/users/:id/following` | Public | Get following list for a user |

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/minisocial?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey_minisocial_2026
NODE_ENV=production
