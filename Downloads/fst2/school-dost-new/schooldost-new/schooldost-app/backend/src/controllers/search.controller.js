// Global Search Controller - Search users, posts, and groups
const prisma = require('../config/database');

const globalSearch = async (req, res) => {
    try {
        const { q, type, limit = 10 } = req.query;

        if (!q?.trim()) return res.status(400).json({ error: 'Search query required' });

        const query = q.trim();
        const take = Math.min(parseInt(limit), 20);

        // Get blocked IDs to filter out
        let blockedIds = [];
        if (req.user) {
            const blocks = await prisma.block.findMany({
                where: { OR: [{ blockerId: req.user.id }, { blockedId: req.user.id }] },
                select: { blockerId: true, blockedId: true }
            });
            blockedIds = [...new Set(blocks.map(b => b.blockerId === req.user.id ? b.blockedId : b.blockerId))];
        }

        const results = {};

        // Search Users
        if (!type || type === 'users') {
            results.users = await prisma.user.findMany({
                where: {
                    AND: [
                        { NOT: { id: { in: blockedIds } } },
                        { isBanned: false },
                        {
                            OR: [
                                { fullName: { contains: query } },
                                { username: { contains: query } },
                                { college: { contains: query } },
                                { department: { contains: query } }
                            ]
                        }
                    ]
                },
                take,
                select: {
                    id: true, fullName: true, username: true, avatarUrl: true,
                    college: true, batch: true, isVerified: true,
                    _count: { select: { followers: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Search Posts
        if (!type || type === 'posts') {
            results.posts = await prisma.post.findMany({
                where: {
                    AND: [
                        { NOT: { authorId: { in: blockedIds } } },
                        { content: { contains: query } }
                    ]
                },
                take,
                include: {
                    author: {
                        select: { id: true, fullName: true, username: true, avatarUrl: true }
                    },
                    _count: { select: { likes: true, comments: true } },
                    media: { take: 1 }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Search Groups
        if (!type || type === 'groups') {
            results.groups = await prisma.group.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { description: { contains: query } },
                        { category: { contains: query } }
                    ]
                },
                take,
                include: {
                    _count: { select: { members: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Search Events
        if (!type || type === 'events') {
            results.events = await prisma.event.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } },
                        { location: { contains: query } }
                    ]
                },
                take,
                include: {
                    organizer: {
                        select: { id: true, fullName: true, username: true, avatarUrl: true }
                    },
                    _count: { select: { rsvps: true } }
                },
                orderBy: { dateTime: 'desc' }
            });
        }

        // Search Marketplace
        if (!type || type === 'marketplace') {
            results.marketplace = await prisma.marketListing.findMany({
                where: {
                    status: 'active',
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } },
                        { category: { contains: query } }
                    ]
                },
                take,
                include: {
                    seller: {
                        select: { id: true, fullName: true, username: true, avatarUrl: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(results);
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

module.exports = { globalSearch };
