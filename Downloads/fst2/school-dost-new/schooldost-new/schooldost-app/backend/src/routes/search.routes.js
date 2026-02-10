// Search Routes
const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/search.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, globalSearch);

module.exports = router;
