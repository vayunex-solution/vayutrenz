// Notification Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// Get all notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get unread count
router.get('/unread', authenticate, notificationController.getUnreadCount);

// Mark as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// Subscribe to Push
router.post('/subscribe', authenticate, notificationController.subscribeToPush);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
