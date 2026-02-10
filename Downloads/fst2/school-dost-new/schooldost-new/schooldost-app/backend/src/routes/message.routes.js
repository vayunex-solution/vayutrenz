// Message Routes - Enhanced
const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  searchMessages,
  getUnreadCount
} = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/unread', getUnreadCount);
router.get('/search', searchMessages);
router.get('/:userId', getMessages);
router.post('/:userId', sendMessage);
router.delete('/:messageId', deleteMessage);
router.put('/:messageId', editMessage);

module.exports = router;
