const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const authMiddleware = require('../middleware/authMiddleware');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, watchlist: user.watchlist }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, watchlist: user.watchlist } });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Google token is required' });

    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({ googleId, email, name, avatar: picture, emailVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      user.emailVerified = true;
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    res.json({ success: true, token: jwtToken, user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, watchlist: user.watchlist } });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ success: false, error: 'Google authentication failed' });
  }
});


 //GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // authMiddleware sets req.userId
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        watchlist: user.watchlist || [],
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
});

module.exports = router;
