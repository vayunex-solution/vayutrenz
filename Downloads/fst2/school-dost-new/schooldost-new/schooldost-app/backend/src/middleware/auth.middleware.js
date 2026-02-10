// JWT Authentication Middleware - Enhanced with Refresh Tokens
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'schooldost-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'schooldost-refresh-secret';

// Generate Access Token (short-lived)
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// Verify Token Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        isVerified: true,
        role: true,
        isBanned: true,
        isDeactivated: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    if (user.isDeactivated) {
      // Auto-reactivate on login
      await prisma.user.update({
        where: { id: user.id },
        data: { isDeactivated: false }
      });
      user.isDeactivated = false;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional Auth (for public routes that can show extra data to logged-in users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, fullName: true, username: true }
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken, authenticate, optionalAuth };
