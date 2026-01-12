// Message Routes
const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount
} = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/unread', getUnreadCount);
router.get('/:userId', getMessages);
router.post('/:userId', sendMessage);

module.exports = router;
