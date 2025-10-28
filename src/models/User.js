const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  avatar: {
    type: String
  },
  provider: {
    type: String,
    required: true,
    enum: ['local', 'google'],
    default: 'local'
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the schema
module.exports = userSchema;