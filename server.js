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


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

app.use(logger);

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ message: 'ParknGo CRUD API' });
});

app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnection ? 'Connected' : 'Disconnected'
  };
  
  if (dbConnection) {
    res.status(200).json(healthStatus);
  } else {
    healthStatus.status = 'Service Unavailable';
    res.status(503).json(healthStatus);
  }
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