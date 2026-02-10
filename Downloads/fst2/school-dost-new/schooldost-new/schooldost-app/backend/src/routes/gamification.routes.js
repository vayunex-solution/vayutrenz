// Gamification Routes
const express = require('express');
const router = express.Router();
const {
    seedBadges,
    getBadges,
    getUserBadges,
    getLeaderboard,
    adminAwardBadge
} = require('../controllers/gamification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// Public
router.get('/badges', getBadges);
router.get('/leaderboard', getLeaderboard);

// Protected
router.use(authenticate);
router.get('/my-badges', getUserBadges);
router.get('/badges/:userId', getUserBadges);

// Admin
router.post('/seed-badges', isAdmin, seedBadges);
router.post('/award-badge', isAdmin, adminAwardBadge);

module.exports = router;
