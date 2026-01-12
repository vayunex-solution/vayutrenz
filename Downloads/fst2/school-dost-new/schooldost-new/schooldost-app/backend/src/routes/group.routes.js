// Group Routes
const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getMyGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupMessages,
  sendGroupMessage
} = require('../controllers/group.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getGroups);

// Protected routes
router.use(authenticate);

router.post('/', createGroup);
router.get('/my', getMyGroups);
router.get('/:id', getGroup);
router.post('/:id/join', joinGroup);
router.delete('/:id/leave', leaveGroup);
router.get('/:id/messages', getGroupMessages);
router.post('/:id/messages', sendGroupMessage);

module.exports = router;
