// Security Middleware - Rate Limiting, Sanitization, Headers
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

const isDev = process.env.NODE_ENV !== 'production';

// ============ RATE LIMITERS ============

// General API rate limiter (500 requests per 15 minutes in dev, 200 in prod)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 500 : 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev && false // Can set to true to skip in dev if needed
});

// Auth rate limiter (50 attempts per 15 minutes in dev, 15 in prod)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 50 : 15,
    message: { error: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Upload rate limiter (50 uploads per hour in dev, 20 in prod)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isDev ? 50 : 20,
    message: { error: 'Upload limit reached, please try again later.' }
});

// ============ INPUT SANITIZATION ============

// Sanitize string inputs (remove XSS)
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }
    next();
};

// ============ PASSWORD VALIDATION ============

const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Password validation middleware
const passwordValidator = (req, res, next) => {
    if (req.body.password) {
        const { isValid, errors } = validatePassword(req.body.password);
        if (!isValid) {
            return res.status(400).json({
                error: 'Password too weak',
                details: errors
            });
        }
    }
    next();
};

// ============ SECURITY HEADERS ============

// Helmet configuration for security headers
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "https://api.schooldost.com", "wss://api.schooldost.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:", "http://localhost:5000", "http://localhost:5173", "https://schooldost.com", "https://api.schooldost.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// ============ ERROR HANDLER ============

// Hide detailed errors in production
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Don't leak error details in production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Something went wrong',
        ...(isDev && { stack: err.stack })
    });
};

// ============ BANNED USER CHECK ============

const checkBanned = async (req, res, next) => {
    if (req.user) {
        const prisma = require('../config/database');
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { isBanned: true, banReason: true }
        });

        if (user?.isBanned) {
            return res.status(403).json({
                error: 'Account suspended',
                reason: user.banReason || 'Violated community guidelines'
            });
        }
    }
    next();
};

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    sanitizeBody,
    sanitizeString,
    validatePassword,
    passwordValidator,
    securityHeaders,
    errorHandler,
    checkBanned,
    hpp: hpp()
};
