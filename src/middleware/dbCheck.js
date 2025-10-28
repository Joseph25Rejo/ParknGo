// Middleware to check if database is connected before allowing auth routes
const checkDatabaseConnection = (req, res, next) => {
  console.log('Database connection check for auth route');
  
  const dbConnection = req.app.locals.dbConnection;
  
  if (!dbConnection) {
    console.log('Database connection check failed: No connection available');
    return res.status(503).json({ 
      message: 'Service Unavailable', 
      details: 'Database connection not available. Authentication features are disabled.' 
    });
  }
  
  console.log('Database connection check passed');
  next();
};

module.exports = { checkDatabaseConnection };