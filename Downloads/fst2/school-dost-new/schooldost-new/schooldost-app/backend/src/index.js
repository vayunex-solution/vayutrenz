// MUST BE FIRST - Load environment variables before anything else
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Backend Entry Point - SchoolDost API (Secured)
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import Security Middleware
const {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  sanitizeBody,
  securityHeaders,
  errorHandler,
  hpp
} = require('./middleware/security.middleware');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const matchRoutes = require('./routes/match.routes');
const groupRoutes = require('./routes/group.routes');
const messageRoutes = require('./routes/message.routes');
const uploadRoutes = require('./routes/upload.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');

// Import Socket Handler
const setupSocket = require('./socket/socket.handler');

const app = express();
const server = http.createServer(app);

// Trust proxy (required for Hostinger/reverse proxy)
app.set('trust proxy', 1);

// Favicon route (prevent 404)
app.get('/favicon.ico', (req, res) => res.status(204).end());


// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// ============ SECURITY MIDDLEWARE ============
// Security headers (Helmet)
app.use(securityHeaders);

// HPP - HTTP Parameter Pollution protection
app.use(hpp);

// CORS - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://schooldost.com',
  'https://www.schooldost.com',
  'https://api.schooldost.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all request bodies (XSS protection)
app.use(sanitizeBody);

// General rate limiting for all routes
app.use('/api', generalLimiter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// ============ API ROUTES WITH SPECIFIC RATE LIMITS ============

// Auth routes (stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload routes (upload rate limiting)
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Other protected routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SchoolDost API is running!',
    security: 'enabled',
    version: '1.0.0'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler (hides details in production)
app.use(errorHandler);

// Setup Socket.io
setupSocket(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SchoolDost API running on http://localhost:${PORT}`);
  console.log(`🔒 Security: Rate limiting, XSS protection, Helmet enabled`);
});

module.exports = { app, io };
