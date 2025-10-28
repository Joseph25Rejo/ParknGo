const jwt = require('jsonwebtoken');

const verifyToken = async (token, req) => {
  try {
    console.log('Verifying token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully for user:', decoded.userId);
    
    // Get User model from database connection
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      console.log('Token verification failed: No database connection');
      throw new Error('Database connection not available');
    }
    const User = dbConnection.model('User');
    
    const user = await User.findById(decoded.userId);
    if (user) {
      console.log('User found for token verification:', user._id);
    } else {
      console.log('User not found for token verification:', decoded.userId);
    }
    
    return user;
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return null;
  }
};

const hasLocalAccount = (user) => {
  return !!user.password;
};

module.exports = {
  verifyToken,
  hasLocalAccount
};