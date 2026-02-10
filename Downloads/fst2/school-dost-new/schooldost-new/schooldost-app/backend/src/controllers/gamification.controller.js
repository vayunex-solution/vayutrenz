// Gamification Controller - Badges, Points, Levels
const prisma = require('../config/database');

// Default badge definitions
const BADGE_DEFINITIONS = [
    { name: 'early_adopter', displayName: 'Early Adopter', description: 'Joined during early days', icon: '🌟', points: 100, category: 'special' },
    { name: 'first_post', displayName: 'First Post', description: 'Created your first post', icon: '📝', points: 10, category: 'content' },
    { name: 'popular', displayName: 'Popular', description: 'Got 50+ likes on a post', icon: '🔥', points: 50, category: 'social' },
    { name: 'social_butterfly', displayName: 'Social Butterfly', description: 'Connected with 20+ people', icon: '🦋', points: 30, category: 'social' },
    { name: 'group_leader', displayName: 'Group Leader', description: 'Created a community group', icon: '👑', points: 25, category: 'community' },
    { name: 'event_organizer', displayName: 'Event Organizer', description: 'Organized an event', icon: '🎉', points: 25, category: 'community' },
    { name: 'verified', displayName: 'Verified Student', description: 'Verified your student ID', icon: '✅', points: 50, category: 'trust' },
    { name: 'commenter', displayName: 'Commenter', description: 'Left 50+ comments', icon: '💬', points: 20, category: 'content' },
    { name: 'helper', displayName: 'Helpful', description: 'Received 10+ comment likes', icon: '🤝', points: 30, category: 'social' },
    { name: 'seller', displayName: 'Marketplace Seller', description: 'Listed an item for sale', icon: '🏪', points: 15, category: 'marketplace' }
];

// Seed badges
const seedBadges = async (req, res) => {
    try {
        let created = 0;
        for (const badge of BADGE_DEFINITIONS) {
            await prisma.badge.upsert({
                where: { name: badge.name },
                create: badge,
                update: { displayName: badge.displayName, description: badge.description, icon: badge.icon, points: badge.points }
            });
            created++;
        }
        res.json({ message: `${created} badges seeded` });
    } catch (error) {
        console.error('Seed badges error:', error);
        res.status(500).json({ error: 'Failed to seed badges' });
    }
};

// Get all available badges
const getBadges = async (req, res) => {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { points: 'desc' },
            include: { _count: { select: { users: true } } }
        });
        res.json({ badges });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
};

// Get user's badges
const getUserBadges = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true, level: true }
        });

        res.json({ badges: userBadges, points: user?.points || 0, level: user?.level || 1 });
    } catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
};

// Award badge to user (internal function + admin endpoint)
const awardBadge = async (userId, badgeName) => {
    try {
        const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
        if (!badge) return null;

        const existing = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } }
        });
        if (existing) return null; // Already has it

        const [userBadge] = await prisma.$transaction([
            prisma.userBadge.create({
                data: { userId, badgeId: badge.id }
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    points: { increment: badge.points },
                    level: { set: Math.floor((await prisma.user.findUnique({ where: { id: userId }, select: { points: true } })).then(u => (u.points + badge.points) / 100) + 1) }
                }
            })
        ]);

        return userBadge;
    } catch (error) {
        console.error('Award badge error:', error);
        return null;
    }
};

// Add points to user
const addPoints = async (userId, points) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                points: { increment: points },
            }
        });

        // Level up (every 100 points)
        const newLevel = Math.floor(user.points / 100) + 1;
        if (newLevel !== user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: newLevel }
            });
        }

        return user;
    } catch (error) {
        console.error('Add points error:', error);
        return null;
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const users = await prisma.user.findMany({
            where: { isBanned: false, isDeactivated: false },
            select: {
                id: true, fullName: true, username: true, avatarUrl: true,
                points: true, level: true, college: true,
                _count: { select: { badges: true } }
            },
            orderBy: { points: 'desc' },
            take: parseInt(limit)
        });

        res.json({ leaderboard: users });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};

// Admin: Award badge endpoint
const adminAwardBadge = async (req, res) => {
    try {
        const { userId, badgeName } = req.body;
        const result = await awardBadge(userId, badgeName);
        if (!result) return res.status(400).json({ error: 'Badge not found or already awarded' });
        res.json({ message: 'Badge awarded', badge: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to award badge' });
    }
};

module.exports = { seedBadges, getBadges, getUserBadges, awardBadge, addPoints, getLeaderboard, adminAwardBadge };
