// Event Routes
const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEvent,
    rsvpEvent,
    getMyEvents,
    deleteEvent
} = require('../controllers/event.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

// Public
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected
router.use(authenticate);
router.post('/', createEvent);
router.get('/user/my', getMyEvents);
router.post('/:id/rsvp', rsvpEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
