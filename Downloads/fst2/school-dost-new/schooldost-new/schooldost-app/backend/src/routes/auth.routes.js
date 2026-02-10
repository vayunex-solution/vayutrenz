// Auth Routes - Enhanced with OAuth, Password Reset & Rate Limiting
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 attempts per window
    message: { error: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: { error: 'Too many OTP requests, please wait 5 minutes' }
});

// Basic Auth (rate limited)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// Email Verification
router.get('/verify/:token', authController.verifyEmail);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);

// Password Reset (rate limited)
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

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

// Refresh Token
router.post('/refresh-token', authController.refreshTokenEndpoint);

// Account Deactivation
router.post('/deactivate', authenticate, authController.deactivateAccount);

module.exports = router;
