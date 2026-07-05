const express = require('express');
const passport = require('passport');
const { signToken, authJwt } = require('../middleware/authJwt');
const { User } = require('../models');

const router = express.Router();

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: 'Google OAuth not configured',
      message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login'
    });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth` }),
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`);
    }
    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

router.get('/me', authJwt, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

router.post('/logout', (req, res) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'LogoutError', message: err.message });
      return res.json({ message: 'Logged out' });
    });
  } else {
    return res.json({ message: 'Logged out' });
  }
});

module.exports = router;
