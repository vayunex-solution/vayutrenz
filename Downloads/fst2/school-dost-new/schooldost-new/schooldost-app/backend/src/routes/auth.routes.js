// Auth Routes - Enhanced with OAuth & Password Reset
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// Basic Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// Email Verification
router.get('/verify/:token', authController.verifyEmail);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth - Only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const passport = require('../config/passport');
    
    router.get('/google', 
        passport.authenticate('google', { 
            scope: ['profile', 'email'] 
        })
    );

    router.get('/google/callback',
        passport.authenticate('google', { 
            failureRedirect: '/login?error=oauth_failed',
            session: false 
        }),
        authController.googleCallback
    );
}

module.exports = router;
