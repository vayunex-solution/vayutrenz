// User Controller
const prisma = require('../config/database');
const { getIO } = require('../socket/socket.registry');
const { sendNotification } = require('../socket/socket.handler');

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
                interests: true,
                isProfileComplete: true,
                isVerified: true,
                isOnline: true,
                lastSeen: true,
                profilePrivacy: true,
                socialLinks: true,
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

        // Parse JSON fields
        if (user.interests) { try { user.interests = JSON.parse(user.interests); } catch (e) { } }
        if (user.socialLinks) { try { user.socialLinks = JSON.parse(user.socialLinks); } catch (e) { } }

        // Privacy enforcement: if profile is private and viewer is not the owner and not following
        const isOwn = req.user?.id === id;
        if (!isOwn && user.profilePrivacy === 'PRIVATE' && !isFollowing) {
            return res.json({
                user: {
                    id: user.id, fullName: user.fullName, username: user.username,
                    avatarUrl: user.avatarUrl, coverUrl: user.coverUrl, bio: user.bio,
                    isVerified: user.isVerified, profilePrivacy: user.profilePrivacy,
                    _count: user._count, isFollowing, isPrivate: true
                }
            });
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
        console.log('Update Profile Body:', JSON.stringify(req.body, null, 2));

        const allowedFields = [
            'fullName', 'username', 'bio', 'college', 'department',
            'batch', 'graduationYear', 'phone', 'location', 'avatarUrl',
            'coverUrl', 'interests', 'profilePrivacy', 'socialLinks',
            'notificationPrefs'
        ];

        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Handle JSON serialization for SQLite
        // JSON serialize array/object fields for SQLite
        if (updateData.socialLinks && typeof updateData.socialLinks === 'object') {
            updateData.socialLinks = JSON.stringify(updateData.socialLinks);
        }
        if (updateData.notificationPrefs && typeof updateData.notificationPrefs === 'object') {
            updateData.notificationPrefs = JSON.stringify(updateData.notificationPrefs);
        }
        if (updateData.interests && Array.isArray(updateData.interests)) {
            updateData.interests = JSON.stringify(updateData.interests);
        }

        // Check profile completion (simplistic check: if essential fields are present)
        if (req.body.isProfileComplete !== undefined) {
            updateData.isProfileComplete = req.body.isProfileComplete;
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

        // Validation: Graduation Year to Int
        if (updateData.graduationYear) {
            updateData.graduationYear = parseInt(updateData.graduationYear);
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
                location: true,
                interests: true,
                isProfileComplete: true
            }
        });

        // Parse JSON for response
        if (user.interests) {
            try {
                user.interests = JSON.parse(user.interests);
            } catch (e) {
                // Keep as string or empty array if parse fails
            }
        }

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Update profile error:', error);
        // Better error handling for Prisma validation errors
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Unique constraint failed' });
        }
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
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
        const notification = await prisma.notification.create({
            data: {
                type: 'follow',
                receiverId: id,
                senderId: req.user.id
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, avatarUrl: true }
                }
            }
        });

        // Emit real-time notification
        if (getIO()) sendNotification(getIO(), id, notification);

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

// Block a user
const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) return res.status(400).json({ error: 'Cannot block yourself' });

        const targetUser = await prisma.user.findUnique({ where: { id }, select: { id: true } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const existing = await prisma.block.findUnique({
            where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: id } }
        });
        if (existing) return res.status(400).json({ error: 'User already blocked' });

        await prisma.block.create({
            data: { blockerId: req.user.id, blockedId: id }
        });

        // Also unfollow each other
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: req.user.id, followingId: id },
                    { followerId: id, followingId: req.user.id }
                ]
            }
        });

        res.json({ message: 'User blocked', blocked: true });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
};

// Unblock a user
const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.block.deleteMany({
            where: { blockerId: req.user.id, blockedId: id }
        });

        res.json({ message: 'User unblocked', blocked: false });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
};

// Get blocked users list
const getBlockedUsers = async (req, res) => {
    try {
        const blocks = await prisma.block.findMany({
            where: { blockerId: req.user.id },
            include: {
                blocked: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ blockedUsers: blocks.map(b => b.blocked) });
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ error: 'Failed to get blocked users' });
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
    getFollowing,
    blockUser,
    unblockUser,
    getBlockedUsers
};
