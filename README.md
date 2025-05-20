# AI Student Companion

A full-stack web application that provides a platform for students to manage their academic information.

## Features

- User Authentication (Register/Login)
- Student Dashboard
- Profile Management
- Secure Data Storage

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Node.js, Express.js
- Database: MongoDB

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_student_companion
   JWT_SECRET=your_jwt_secret_key_here
   ```
   Replace `your_jwt_secret_key_here` with a secure random string.

4. Make sure MongoDB is installed and running on your system.

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

6. Open the frontend:
   - Navigate to the `frontend` directory
   - Open `index.html` in your web browser
   - Or use a local development server

## Project Structure

```
ai-student-companion/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── index.html
└── backend/
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── auth.js
    ├── server.js
    └── .env
```

## Environment Variables

The following environment variables are required:

- `PORT`: The port number for the backend server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

## Security

- Passwords are hashed using bcrypt
- JWT for authentication
- CORS enabled
- Environment variables for sensitive data

## Future Enhancements

- AI-powered features (coming soon)
- Advanced dashboard functionality
- Student performance tracking
- Course management
- Assignment tracking 