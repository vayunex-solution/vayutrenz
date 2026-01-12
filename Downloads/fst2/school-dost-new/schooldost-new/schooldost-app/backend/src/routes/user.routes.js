// User Routes
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers,
  getFollowers,
  getFollowing
} = require('../controllers/user.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

// Public routes (with optional auth for extra info)
router.get('/search', optionalAuth, searchUsers);
router.get('/:id', optionalAuth, getProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.get('/suggested/list', authenticate, getSuggestedUsers);
router.put('/profile', authenticate, updateProfile);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

module.exports = router;
