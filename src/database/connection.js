const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Create connection without specifying database in URI
    const conn = await mongoose.createConnection(process.env.MONGO_URI);
    
    // Wait for connection to be established
    await new Promise((resolve, reject) => {
      conn.on('connected', resolve);
      conn.on('error', reject);
      // If already connected
      if (conn.readyState === 1) resolve();
    });
    
    // Switch to the desired database after connection
    const db = conn.useDb('Users');
    
    // Register the User model with this database connection
    const userSchema = require('../models/User');
    db.model('User', userSchema);
    
    // Extract host information from the connection URI
    try {
      const uriObj = new URL(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${uriObj.hostname}`);
    } catch (uriError) {
      console.log(`MongoDB Connected: ${conn.host || 'Connected'}`);
    }
    
    console.log(`Database: ${db.name}`);
    
    return db;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;