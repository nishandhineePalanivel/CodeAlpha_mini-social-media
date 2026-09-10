# Mini Social Media Platform

A complete, working mini social media application built with Node.js, Express, MongoDB, and Vanilla JavaScript.

## Features
- User Registration & Login with JWT Authentication
- Create, Read, Edit, and Delete Posts (CRUD)
- Comment on Posts
- Like and Unlike Posts
- Follow and Unfollow Users
- User Profile viewing and editing
- Search Users
- Fully Responsive Modern UI without external CSS frameworks

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs for password hashing

## Project Structure
```
mini-social-media/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   └── .env
├── frontend/
│   ├── css/style.css
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   └── search.html
└── .gitignore
```

## Requirements
- Node.js installed
- MongoDB installed locally or MongoDB Atlas connection string

## Installation
1. Open your terminal and navigate to the `backend` folder.
2. Run `npm install` to install dependencies.
3. Rename `backend/.env.example` to `backend/.env` and update `MONGO_URI` and `JWT_SECRET`.

## MongoDB Setup
- If running locally, ensure MongoDB service is running on `mongodb://127.0.0.1:27017/mini_social_media`.
- If using MongoDB Atlas, replace the `MONGO_URI` in `.env` with your connection string.

## Running Backend
1. Open the terminal in the `backend/` directory.
2. Run `npm start` (or `npm run dev` to use nodemon).
3. The server will start on `http://localhost:5000`.

## Running Frontend
1. The frontend files are served as static files from the Express backend in production.
2. However, for development, you can simply open `frontend/index.html` in your web browser or use an extension like VS Code Live Server.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and get JWT
- `GET /api/auth/me` - Get current logged-in user profile

### Users
- `GET /api/users/search?q=keyword` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers list
- `GET /api/users/:id/following` - Get following list

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get feed posts
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/:id/comments` - View comments

### Comments
- `DELETE /api/comments/:id` - Delete comment

## Database Models
- **User**: Name, username, email, hashed password, bio.
- **Post**: Author reference, content.
- **Comment**: Post reference, author reference, text.
- **Like**: Post reference, user reference (Unique compound index).
- **Follow**: Follower reference, Following reference (Unique compound index).

## Authentication
JWT (JSON Web Tokens) is used to authorize requests. When a user logs in, the backend sends a token which the frontend saves in `localStorage`. The frontend then attaches this token as a `Bearer` token in the `Authorization` header for all protected API calls. The backend `authMiddleware` validates this token before granting access.

## Seed Data
To populate the database with sample users and posts for demonstration, run:
`npm run seed` from the `backend/` directory.

## Future Improvements
- Image upload support using Multer and cloud storage (e.g., Cloudinary)
- Real-time chat or notifications using Socket.io
- Pagination for feed and comments

## Author
Built by Antigravity
