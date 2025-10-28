const { verifyToken } = require('../utils/authUtils');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('Token authentication attempt');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const user = await verifyToken(token, req);

    if (!user) {
      console.log('Authentication failed: Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Token authentication successful for user:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.log('Authentication error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };