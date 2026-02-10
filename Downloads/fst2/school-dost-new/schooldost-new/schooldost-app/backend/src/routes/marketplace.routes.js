// Marketplace Routes
const express = require('express');
const router = express.Router();
const {
    createListing,
    getListings,
    getListing,
    updateListing,
    deleteListing,
    getMyListings,
    getMarketCategories
} = require('../controllers/marketplace.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public
router.get('/', getListings);
router.get('/categories', getMarketCategories);
router.get('/:id', getListing);

// Protected
router.use(authenticate);
router.post('/', createListing);
router.get('/user/my', getMyListings);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
