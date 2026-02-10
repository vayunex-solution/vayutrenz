// Campus Marketplace Controller - Buy/Sell Listings
const prisma = require('../config/database');

// Create listing
const createListing = async (req, res) => {
    try {
        const { title, description, price, category, condition = 'good', images, contactInfo } = req.body;

        if (!title?.trim() || price === undefined) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const listing = await prisma.marketListing.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                price: parseFloat(price),
                category: category?.trim() || null,
                condition,
                images: images ? JSON.stringify(images) : null,
                contactInfo: contactInfo?.trim(),
                sellerId: req.user.id
            },
            include: {
                seller: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true, college: true }
                }
            }
        });

        res.status(201).json({ listing });
    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
};

// Get listings (with filters)
const getListings = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, condition, sort = 'newest', limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { status: 'active' };
        if (category) where.category = category;
        if (condition) where.condition = condition;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_low') orderBy = { price: 'asc' };
        if (sort === 'price_high') orderBy = { price: 'desc' };

        const listings = await prisma.marketListing.findMany({
            where,
            skip,
            take: parseInt(limit),
            include: {
                seller: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true, college: true }
                }
            },
            orderBy
        });

        // Parse images JSON
        const parsed = listings.map(l => ({
            ...l,
            images: l.images ? JSON.parse(l.images) : []
        }));

        res.json({ listings: parsed });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ error: 'Failed to get listings' });
    }
};

// Get single listing
const getListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await prisma.marketListing.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true, college: true, phone: true }
                }
            }
        });

        if (!listing) return res.status(404).json({ error: 'Listing not found' });

        listing.images = listing.images ? JSON.parse(listing.images) : [];

        res.json({ listing });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ error: 'Failed to get listing' });
    }
};

// Update listing (seller only)
const updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, condition, images, status, contactInfo } = req.body;

        const listing = await prisma.marketListing.findUnique({ where: { id } });
        if (!listing) return res.status(404).json({ error: 'Listing not found' });
        if (listing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Only the seller can update' });
        }

        const data = {};
        if (title !== undefined) data.title = title.trim();
        if (description !== undefined) data.description = description?.trim();
        if (price !== undefined) data.price = parseFloat(price);
        if (category !== undefined) data.category = category?.trim() || null;
        if (condition !== undefined) data.condition = condition;
        if (images !== undefined) data.images = JSON.stringify(images);
        if (status !== undefined) data.status = status; // active, sold, removed
        if (contactInfo !== undefined) data.contactInfo = contactInfo?.trim();

        const updated = await prisma.marketListing.update({
            where: { id },
            data,
            include: {
                seller: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            }
        });

        updated.images = updated.images ? JSON.parse(updated.images) : [];

        res.json({ listing: updated });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
};

// Delete listing (seller only)
const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await prisma.marketListing.findUnique({ where: { id } });
        if (!listing) return res.status(404).json({ error: 'Listing not found' });
        if (listing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Only the seller can delete' });
        }

        await prisma.marketListing.delete({ where: { id } });
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
};

// Get my listings
const getMyListings = async (req, res) => {
    try {
        const listings = await prisma.marketListing.findMany({
            where: { sellerId: req.user.id },
            include: {
                seller: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const parsed = listings.map(l => ({
            ...l,
            images: l.images ? JSON.parse(l.images) : []
        }));

        res.json({ listings: parsed });
    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({ error: 'Failed to get listings' });
    }
};

// Get marketplace categories
const getMarketCategories = async (req, res) => {
    try {
        const categories = await prisma.marketListing.groupBy({
            by: ['category'],
            where: { status: 'active', category: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        });

        res.json({
            categories: categories
                .filter(c => c.category)
                .map(c => ({ name: c.category, count: c._count.id }))
        });
    } catch (error) {
        console.error('Get market categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
};

module.exports = {
    createListing, getListings, getListing, updateListing,
    deleteListing, getMyListings, getMarketCategories
};
