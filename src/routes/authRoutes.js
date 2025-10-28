const express = require('express');
const { signIn, googleAuthCallback, register, getUserProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signin', signIn);
router.post('/register', register);
router.get('/profile', authenticateToken, getUserProfile);
router.post('/google/callback', googleAuthCallback);

module.exports = router;