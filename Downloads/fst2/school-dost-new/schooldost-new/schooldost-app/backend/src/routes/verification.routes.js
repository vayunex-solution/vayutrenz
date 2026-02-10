const express = require('express');
const router = express.Router();
const { requestVerification, getVerificationStatus } = require('../controllers/verification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/request', authenticate, requestVerification);
router.get('/status', authenticate, getVerificationStatus);

module.exports = router;
