const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
dotenv.config();

const connectDB = require('./src/database/connection');
require('./src/config/passport');
const userSchema = require('./src/models/User');
const { checkDatabaseConnection } = require('./src/middleware/dbCheck');
const logger = require('./src/middleware/logger');

const authRoutes = require('./src/routes/authRoutes');

const app = express();

let dbConnection = null;
connectDB().then(db => {
  dbConnection = db;
  app.locals.dbConnection = db;
  
  // Register the User model with the database connection
  if (db && !db.models.User) {
    db.model('User', userSchema);
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Specific rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

// Add logging middleware
app.use(logger);

// Initialize Passport
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ParknGo CRUD API' });
});
app.get('/api/test/users', async (req, res) => {
  try {
    console.log('Test users endpoint accessed');
    
    if (!dbConnection) {
      console.log('Test users endpoint failed: No database connection');
      return res.status(503).json({ 
        message: 'Database not connected', 
        details: 'MongoDB connection not available. Authentication features will be disabled.' 
      });
    }
    
    // Get the User model from the database connection
    const User = dbConnection.model('User');
    const users = await User.find({}).select('-password -refreshToken');
    
    console.log(`Retrieved ${users.length} users from database`);
    res.json(users);
  } catch (error) {
    console.error('Test users endpoint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/auth', authLimiter, checkDatabaseConnection, authRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});