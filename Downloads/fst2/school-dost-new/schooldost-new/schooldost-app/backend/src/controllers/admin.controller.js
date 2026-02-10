const prisma = require('../config/database');

// ============ ANALYTICS ============

// Get Dashboard Analytics
const getAnalytics = async (req, res) => {
    try {
        const [userCount, postCount, reportCount, pendingReports] = await Promise.all([
            prisma.user.count(),
            prisma.post.count(),
            prisma.report.count(),
            prisma.report.count({ where: { status: 'PENDING' } })
        ]);

        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, fullName: true, username: true, email: true, createdAt: true, role: true, avatarUrl: true }
        });

        const recentPosts = await prisma.post.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: { select: { fullName: true, username: true } }
            }
        });

        res.json({
            stats: {
                totalUsers: userCount,
                totalPosts: postCount,
                totalReports: reportCount,
                pendingReports
            },
            recentUsers,
            recentPosts
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// Get Chart Data (Last 7 days signups & posts)
const getChartData = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const users = await prisma.user.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        const posts = await prisma.post.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        // Group by date
        const groupByDate = (items) => {
            const counts = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                counts[key] = 0;
            }
            items.forEach(item => {
                const key = item.createdAt.toISOString().split('T')[0];
                if (counts[key] !== undefined) counts[key]++;
            });
            return Object.entries(counts).map(([date, count]) => ({ date, count }));
        };

        res.json({
            userSignups: groupByDate(users),
            postActivity: groupByDate(posts)
        });
    } catch (error) {
        console.error('Get chart data error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

// ============ USER MANAGEMENT ============

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { username: { contains: search } },
                { email: { contains: search } }
            ];
        }
        if (role) where.role = role;
        if (status === 'banned') where.isBanned = true;
        if (status === 'active') where.isBanned = false;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    role: true,
                    isBanned: true,
                    banReason: true,
                    isVerified: true,
                    createdAt: true,
                    _count: { select: { posts: true, followers: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update User Role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Prevent self-demotion
        if (id === req.user.id && role !== 'ADMIN') {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        await prisma.user.update({
            where: { id },
            data: { role }
        });

        res.json({ message: `User role updated to ${role}` });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

// Ban/Unban User
const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { ban, reason } = req.body;

        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot ban yourself' });
        }

        await prisma.user.update({
            where: { id },
            data: {
                isBanned: ban,
                banReason: ban ? (reason || 'Violated community guidelines') : null
            }
        });

        res.json({ message: ban ? 'User banned' : 'User unbanned' });
    } catch (error) {
        console.error('Toggle ban user error:', error);
        res.status(500).json({ error: 'Failed to update user ban status' });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        // Delete user's posts, comments, etc. (cascade should handle this, but explicit for safety)
        await prisma.user.delete({ where: { id } });

        res.json({ message: 'User deleted permanently' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// ============ POST MANAGEMENT ============

// Get All Posts
const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = search ? { content: { contains: search } } : {};

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    content: true,
                    media: true,
                    createdAt: true,
                    author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
                    _count: { select: { likes: true, comments: true } }
                }
            }),
            prisma.post.count({ where })
        ]);

        res.json({ posts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// Delete Post (Admin)
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.post.delete({ where: { id } });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

// ============ REPORTS ============

// Get Reports
const getReports = async (req, res) => {
    try {
        const { status = 'PENDING', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where: { status },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    reporter: { select: { id: true, username: true, avatarUrl: true } },
                    user: { select: { id: true, username: true, avatarUrl: true, email: true, role: true } },
                    post: { select: { id: true, content: true, media: true } }
                }
            }),
            prisma.report.count({ where: { status } })
        ]);

        res.json({ reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

// Resolve Report
const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, adminNote } = req.body;

        const report = await prisma.report.findUnique({
            where: { id },
            include: { post: true, user: true }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (action === 'DELETE_CONTENT' && report.postId) {
            await prisma.post.delete({ where: { id: report.postId } });
        } else if (action === 'BAN_USER' && report.userId) {
            await prisma.user.update({
                where: { id: report.userId },
                data: { isBanned: true, banReason: adminNote || 'Violated community guidelines' }
            });
        }

        await prisma.report.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                actionTaken: action,
                adminNote,
                resolvedBy: req.user.id,
                resolvedAt: new Date()
            }
        });

        res.json({ message: 'Report resolved successfully' });
    } catch (error) {
        console.error('Resolve report error:', error);
        res.status(500).json({ error: 'Failed to resolve report' });
    }
};

// Create Report (User facing)
const createReport = async (req, res) => {
    try {
        const { type, reason, description, postId, userId } = req.body;

        await prisma.report.create({
            data: {
                reporterId: req.user.id,
                type,
                reason,
                description,
                postId,
                userId
            }
        });

        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
};

module.exports = {
    getAnalytics,
    getChartData,
    getAllUsers,
    updateUserRole,
    toggleBanUser,
    deleteUser,
    getAllPosts,
    deletePost,
    getReports,
    resolveReport,
    createReport
};
