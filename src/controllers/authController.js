const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

const storeToken = async (userId, token, req) => {
  try {
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      throw new Error('Database connection not available');
    }
    const User = dbConnection.model('User');
    
    const user = await User.findById(userId);
    if (user) {
      user.accessToken = token;
      await user.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

const signIn = async (req, res) => {
  try {
    console.log('Sign in attempt:', { email: req.body.email });
    
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      return res.status(503).json({ message: 'Database connection not available' });
    }
    const User = dbConnection.model('User');
    
    const { email, password, googleToken } = req.body;

    if (googleToken) {
      console.log('Google sign in attempt for:', email);
      const { googleId, name, avatar } = req.body;
      let user = await User.findOne({ email });

      if (!user) {
        console.log('Creating new user for Google sign in:', email);
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
          provider: 'google'
        });
      } else if (!user.googleId) {
        console.log('Linking existing user with Google account:', email);
        user.googleId = googleId;
        user.name = name;
        user.avatar = avatar;
        user.provider = 'google';
        await user.save();
      }
      const token = generateToken(user._id);
      await storeToken(user._id, token, req);

      console.log('Google sign in successful for:', email);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    }
    if (email && password) {
      console.log('Local sign in attempt for:', email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log('Sign in failed: Invalid credentials for', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (!user.password) {
        console.log('Sign in failed: Google-only account for', email);
        return res.status(401).json({ message: 'Please sign in with Google' });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Sign in failed: Invalid password for', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user._id);
      await storeToken(user._id, token, req);

      console.log('Local sign in successful for:', email);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    }

    console.log('Sign in failed: Missing credentials');
    return res.status(400).json({ message: 'Email and password or Google token required' });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    console.log('Google auth callback received');
    
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      return res.status(503).json({ message: 'Database connection not available' });
    }
    const User = dbConnection.model('User');
    
    if (!req.user) {
      console.log('Google auth failed: No user data');
      return res.status(401).json({ message: 'Google authentication failed' });
    }

    const { id, displayName, emails, photos } = req.user;
    console.log('Processing Google user:', emails[0].value);
    
    let user = await User.findOne({ googleId: id });

    if (!user) {
      console.log('Creating new user from Google data:', emails[0].value);
      user = await User.create({
        googleId: id,
        name: displayName,
        email: emails[0].value,
        avatar: photos[0] ? photos[0].value : null,
        provider: 'google'
      });
    }
    const token = generateToken(user._id);
    await storeToken(user._id, token, req);
    
    console.log('Google auth successful for:', emails[0].value);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email);
    
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      return res.status(503).json({ message: 'Database connection not available' });
    }
    const User = dbConnection.model('User');
    
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      console.log('Registration failed: User already exists', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: 'local'
    });
    const token = generateToken(user._id);
    await storeToken(user._id, token, req);

    console.log('Registration successful for:', email);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log('Profile request for user:', req.user._id);
    
    const dbConnection = req.app.locals.dbConnection;
    if (!dbConnection) {
      return res.status(503).json({ message: 'Database connection not available' });
    }
    const User = dbConnection.model('User');
    
    const user = await User.findById(req.user._id).select('-accessToken -refreshToken -password');
    res.json(user);
  } catch (error) {
    console.error('Profile request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signIn,
  googleAuthCallback,
  register,
  getUserProfile
};