// Admin Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isModerator } = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

// Dashboard - Admin only
router.get('/dashboard', authenticate, isAdmin, adminController.getDashboardStats);

// User Management - Admin only
router.get('/users', authenticate, isAdmin, adminController.getUsers);
router.put('/users/:userId/role', authenticate, isAdmin, adminController.updateUserRole);
router.put('/users/:userId/ban', authenticate, isAdmin, adminController.banUser);
router.delete('/users/:userId', authenticate, isAdmin, adminController.deleteUser);

// Content Moderation - Moderators and Admins
router.get('/posts', authenticate, isModerator, adminController.getPosts);
router.delete('/posts/:postId', authenticate, isModerator, adminController.deletePost);

// Reports - Moderators and Admins
router.get('/reports', authenticate, isModerator, adminController.getReports);
router.put('/reports/:reportId', authenticate, isModerator, adminController.handleReport);

module.exports = router;
