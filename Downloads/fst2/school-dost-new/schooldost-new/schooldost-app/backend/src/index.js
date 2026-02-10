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
const verificationRoutes = require('./routes/verification.routes');
const searchRoutes = require('./routes/search.routes');
const eventRoutes = require('./routes/event.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const gamificationRoutes = require('./routes/gamification.routes');

// Import Socket Handler
const setupSocket = require('./socket/socket.handler');
const { setIO } = require('./socket/socket.registry');

const app = express();
const server = http.createServer(app);

// 1. Trust proxy (Required for Hostinger/cPanel reverse proxy)
app.set('trust proxy', 1);

// 2. CORS - MUST BE BEFORE SECURITY HEADERS
app.use(cors({
  origin: true, // Reflect request origin (Safe with credentials:true for multi-domain)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


// 3. Security headers (Helmet)
app.use(securityHeaders);

// HPP - HTTP Parameter Pollution protection
app.use(hpp);

// Favicon route (prevent 404)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all request bodies (XSS protection)
app.use(sanitizeBody);

// General rate limiting for all routes
// General rate limiting for all routes
app.use('/api', generalLimiter);

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
app.use('/api/verification', verificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/gamification', gamificationRoutes);

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
setIO(io);

// Start Server
const PORT = process.env.PORT || 5000;
const fs = require('fs');

server.listen(PORT, () => {
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📂 Created uploads directory');
  }

  console.log(`🚀 SchoolDost API [v1.0.2 - 22:35] running on PORT ${PORT}`);
  console.log(`🔒 Security: CORS (origin:true), Rate limiting, XSS protection`);
  console.log(`👥 Ready for production at ${new Date().toISOString()}`);
});

// ============ PRODUCTION STABILITY ============

// Track active connections for graceful shutdown
let connections = [];
server.on('connection', (connection) => {
  connections.push(connection);
  connection.on('close', () => {
    connections = connections.filter(c => c !== connection);
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close all socket connections
    io.close(() => {
      console.log('✅ Socket.io closed');
      process.exit(0);
    });
  });

  // Force close connections after 10 seconds
  setTimeout(() => {
    console.log('⚠️  Forcing remaining connections to close...');
    connections.forEach(conn => conn.destroy());
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions - DON'T CRASH!
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  // Log but don't exit - keep server running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Log but don't exit - keep server running
});

// Memory usage logging (every 5 minutes in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const used = process.memoryUsage();
    console.log(`📊 Memory: RSS=${Math.round(used.rss / 1024 / 1024)}MB, Heap=${Math.round(used.heapUsed / 1024 / 1024)}/${Math.round(used.heapTotal / 1024 / 1024)}MB`);
  }, 5 * 60 * 1000);
}

module.exports = { app, io };

