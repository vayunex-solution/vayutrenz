// Match Routes with EdgeRank Algorithm
const express = require('express');
const router = express.Router();
const {
  getDiscoverUsers,
  swipe,
  getMatches,
  unmatch,
  getCompatibility
} = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/discover', getDiscoverUsers);
router.post('/swipe', swipe);
router.get('/', getMatches);
router.get('/compatibility/:userId', getCompatibility);
router.delete('/:id', unmatch);

module.exports = router;

