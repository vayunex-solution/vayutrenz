// User Controller
const prisma = require('../config/database');

// Get user profile by ID
const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                bio: true,
                college: true,
                department: true,
                batch: true,
                graduationYear: true,
                location: true,
                isVerified: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if current user follows this user
        let isFollowing = false;
        if (req.user) {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: req.user.id,
                        followingId: id
                    }
                }
            });
            isFollowing = !!follow;
        }

        res.json({ user: { ...user, isFollowing } });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'fullName', 'username', 'bio', 'college', 'department',
            'batch', 'graduationYear', 'phone', 'location', 'avatarUrl', 'coverUrl'
        ];

        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Check username uniqueness if updating
        if (updateData.username) {
            const existing = await prisma.user.findFirst({
                where: {
                    username: updateData.username.toLowerCase(),
                    NOT: { id: req.user.id }
                }
            });
            if (existing) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updateData.username = updateData.username.toLowerCase();
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                bio: true,
                college: true,
                department: true,
                batch: true,
                graduationYear: true,
                phone: true,
                location: true
            }
        });

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Follow user
const followUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Check if already following
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: id
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already following this user' });
        }

        // Create follow relationship
        await prisma.follow.create({
            data: {
                followerId: req.user.id,
                followingId: id
            }
        });

        // Create notification
        await prisma.notification.create({
            data: {
                type: 'follow',
                receiverId: id,
                senderId: req.user.id
            }
        });

        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
};

// Unfollow user
const unfollowUser = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: id
                }
            }
        });

        res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { fullName: { contains: q } },
                    { username: { contains: q } },
                    { college: { contains: q } }
                ]
            },
            take: parseInt(limit),
            select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                college: true,
                batch: true
            }
        });

        res.json({ users });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

// Get suggested users (Who to Follow)
const getSuggestedUsers = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        // Get IDs of users already being followed
        const following = await prisma.follow.findMany({
            where: { followerId: req.user.id },
            select: { followingId: true }
        });
        const followingIds = following.map(f => f.followingId);

        // Get random users not being followed
        const users = await prisma.user.findMany({
            where: {
                id: {
                    notIn: [...followingIds, req.user.id]
                }
            },
            take: parseInt(limit),
            select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                college: true,
                batch: true
            }
        });

        res.json({ users });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
};

// Get followers
const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;

        const followers = await prisma.follow.findMany({
            where: { followingId: id },
            select: {
                follower: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true,
                        college: true
                    }
                }
            }
        });

        res.json({ followers: followers.map(f => f.follower) });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ error: 'Failed to get followers' });
    }
};

// Get following
const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;

        const following = await prisma.follow.findMany({
            where: { followerId: id },
            select: {
                following: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true,
                        college: true
                    }
                }
            }
        });

        res.json({ following: following.map(f => f.following) });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ error: 'Failed to get following' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    searchUsers,
    getSuggestedUsers,
    getFollowers,
    getFollowing
};
