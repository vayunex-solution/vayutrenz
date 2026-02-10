// Post Routes
const express = require('express');
const router = express.Router();
const {
    createPost,
    getFeed,
    getPost,
    updatePost,
    deletePost,
    likePost,
    commentOnPost,
    deleteComment,
    editComment,
    likeComment,
    repostPost,
    getUserPosts,
    getTrending,
    savePost,
    getPostsByHashtag,
    votePoll
} = require('../controllers/post.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/trending', getTrending);
router.get('/feed', optionalAuth, getFeed);
router.get('/user/:userId', getUserPosts);
router.get('/hashtag/:tag', optionalAuth, getPostsByHashtag);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comment', authenticate, commentOnPost);
router.post('/:id/save', authenticate, savePost);
router.post('/:id/repost', authenticate, repostPost);
router.post('/poll/vote', authenticate, votePoll);

// Comment actions
router.delete('/comment/:commentId', authenticate, deleteComment);
router.put('/comment/:commentId', authenticate, editComment);
router.post('/comment/:commentId/like', authenticate, likeComment);

// Link preview
const { fetchLinkPreview } = require('../utils/linkPreview');
router.post('/link-preview', authenticate, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });
        const preview = await fetchLinkPreview(url);
        res.json(preview);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch preview' });
    }
});

module.exports = router;
