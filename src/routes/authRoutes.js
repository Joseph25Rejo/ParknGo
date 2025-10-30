const express = require('express');
const { signIn, googleAuthCallback, register, getUserProfile, refreshAccessToken, logout, getSessionStatus } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signin', signIn);
router.post('/register', register);
router.get('/profile', authenticateToken, getUserProfile);
router.post('/google/callback', googleAuthCallback);
router.post('/refresh', refreshAccessToken);
router.post('/logout', authenticateToken, logout);
router.get('/session-status', authenticateToken, getSessionStatus);

module.exports = router;