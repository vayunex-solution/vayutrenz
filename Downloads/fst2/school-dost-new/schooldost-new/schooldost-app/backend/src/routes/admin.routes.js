const express = require('express');
const router = express.Router();
const {
    getAnalytics,
    getChartData,
    getAllUsers,
    updateUserRole,
    toggleBanUser,
    deleteUser,
    getAllPosts,
    deletePost,
    getReports,
    resolveReport,
    createReport
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Middleware to check Admin/Moderator Role
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR')) {
        next();
    } else {
        res.status(403).json({ error: 'Admin/Moderator access required' });
    }
};

// ===== ANALYTICS =====
router.get('/analytics', authenticate, requireAdmin, getAnalytics);
router.get('/charts', authenticate, requireAdmin, getChartData);

// ===== USER MANAGEMENT =====
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.put('/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.post('/users/:id/ban', authenticate, requireAdmin, toggleBanUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

// ===== POST MANAGEMENT =====
router.get('/posts', authenticate, requireAdmin, getAllPosts);
router.delete('/posts/:id', authenticate, requireAdmin, deletePost);

// ===== REPORTS =====
router.get('/reports', authenticate, requireAdmin, getReports);
router.post('/reports/:id/resolve', authenticate, requireAdmin, resolveReport);

// Public/User Routes (For submitting reports - any authenticated user)
router.post('/reports', authenticate, createReport);

module.exports = router;
