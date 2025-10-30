const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('Token authentication attempt');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify the access token statelessly using JWT_ACCESS_SECRET
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    console.log('Token authentication successful for user:', decoded.userId);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.log('Authentication error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(403).json({ message: 'Invalid access token' });
  }
};

module.exports = { authenticateToken };