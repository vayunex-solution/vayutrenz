// Post Routes
const express = require('express');
const router = express.Router();
const {
    createPost,
    getFeed,
    getPost,
    deletePost,
    likePost,
    commentOnPost,
    getUserPosts,
    getTrending
} = require('../controllers/post.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/trending', getTrending);
router.get('/feed', optionalAuth, getFeed);
router.get('/user/:userId', getUserPosts);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.post('/', authenticate, createPost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comment', authenticate, commentOnPost);

module.exports = router;
