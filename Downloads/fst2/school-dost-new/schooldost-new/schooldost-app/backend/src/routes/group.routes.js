// Group Routes - Enhanced
const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getMyGroups,
  getGroup,
  joinGroup,
  joinByInvite,
  leaveGroup,
  kickMember,
  toggleMute,
  promoteMember,
  updateGroup,
  getJoinRequests,
  handleJoinRequest,
  createGroupPost,
  getGroupPosts,
  deleteGroupPost,
  togglePinPost,
  getGroupMessages,
  sendGroupMessage,
  getCategories
} = require('../controllers/group.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getGroups);
router.get('/categories', getCategories);

// Protected routes
router.use(authenticate);

router.post('/', createGroup);
router.get('/my', getMyGroups);
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.post('/:id/join', joinGroup);
router.post('/invite/:code', joinByInvite);
router.delete('/:id/leave', leaveGroup);

// Admin controls
router.delete('/:id/members/:userId', kickMember);
router.put('/:id/members/:userId/mute', toggleMute);
router.put('/:id/members/:userId/role', promoteMember);

// Join requests
router.get('/:id/requests', getJoinRequests);
router.put('/:id/requests/:requestId', handleJoinRequest);

// Group posts
router.post('/:id/posts', createGroupPost);
router.get('/:id/posts', getGroupPosts);
router.delete('/:id/posts/:postId', deleteGroupPost);
router.put('/:id/posts/:postId/pin', togglePinPost);

// Group messages
router.get('/:id/messages', getGroupMessages);
router.post('/:id/messages', sendGroupMessage);

module.exports = router;
