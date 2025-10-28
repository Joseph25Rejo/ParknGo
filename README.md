# ParknGoCRUD

A simple CRUD API for managing parking facilities with Google authentication for React Native apps.

## Database Structure

- **Default Collection Name**: User Data
- **Database**: Determined by MongoDB connection string (flexible for multiple databases)

## Features

- Google OAuth 2.0 authentication
- MongoDB Atlas integration
- JWT token-based authentication
- User profile management
- Rate limiting and security headers

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (optional for testing)
- Google Cloud Platform account with OAuth 2.0 credentials (optional for Google auth testing)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   - `MONGO_URI`: Your MongoDB Atlas connection string (optional for basic testing)
   - `JWT_SECRET`: A secret key for JWT token signing
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (optional for Google auth testing)
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (optional for Google auth testing)

   For basic route testing, you can leave the default values. For full authentication testing, you'll need to set up MongoDB Atlas and Google OAuth credentials.

4. Start the server:
   ```bash
   # Production mode
   npm start
   
   # Development mode with auto-reload
   npm run dev
   ```

## Authentication Flow

Send a POST request to `/api/auth/signin` with either:

1. Email and password for local authentication:
   ```json
   {
     "email": "user@example.com",
     "password": "userpassword"
   }
   ```

2. Google token for Google authentication:
   ```json
   {
     "googleToken": "google_id_token",
     "googleId": "google_user_id",
     "name": "User Name",
     "email": "user@example.com",
     "avatar": "https://example.com/avatar.jpg"
   }
   ```

The server will generate a JWT token and store it in the database for authentication purposes.

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Unified sign-in endpoint for both local and Google authentication
- `POST /api/auth/register` - Register a new local user

### User

- `GET /api/auth/profile` - Get user profile (requires authentication)

## Database Schema

### User Collection (User Data)

```javascript
{
  googleId: String,     // Unique Google ID (for Google-authenticated users)
  name: String,         // User's display name
  email: String,        // User's email
  password: String,     // Hashed password (for locally registered users)
  avatar: String,       // URL to user's profile picture
  provider: String,     // Authentication provider ('local' or 'google')
  accessToken: String,  // JWT access token
  refreshToken: String, // Refresh token (if needed)
  createdAt: Date       // Account creation date
}
```

> **Note**: The database name is determined by your MongoDB connection string, allowing for flexible use of multiple databases as needed.

## Security

- Passwordless authentication via Google OAuth
- JWT tokens with expiration
- Rate limiting to prevent abuse
- CORS protection
- HTTP headers security with Helmet.js

## Testing

For testing instructions, see [TESTING-GUIDE.md](TESTING-GUIDE.md)

To verify your environment setup, run:
```bash
npm run verify-setup
```