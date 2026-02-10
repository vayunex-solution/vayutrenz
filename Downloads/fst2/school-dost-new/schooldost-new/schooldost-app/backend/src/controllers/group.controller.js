// Group Controller - Enhanced with Admin Controls, Group Posts, Join Requests
const prisma = require('../config/database');
const crypto = require('crypto');

// Generate invite code
const generateInviteCode = () => crypto.randomBytes(4).toString('hex');

// ==================== GROUP CRUD ====================

// Create a group
const createGroup = async (req, res) => {
    try {
        const { name, description, isPrivate = false, category, imageUrl } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                imageUrl,
                category: category?.trim() || null,
                isPrivate,
                creatorId: req.user.id,
                inviteCode: generateInviteCode(),
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'admin'
                    }
                }
            },
            include: {
                _count: { select: { members: true } }
            }
        });

        res.status(201).json({ group });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// Get all public groups (with category filter)
const getGroups = async (req, res) => {
    try {
        const { search, category, limit = 20 } = req.query;

        const where = { isPrivate: false };
        if (search) where.name = { contains: search };
        if (category) where.category = category;

        const groups = await prisma.group.findMany({
            where,
            take: parseInt(limit),
            include: {
                _count: { select: { members: true, posts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ groups });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ error: 'Failed to get groups' });
    }
};

// Get user's groups
const getMyGroups = async (req, res) => {
    try {
        const memberships = await prisma.groupMember.findMany({
            where: { userId: req.user.id },
            include: {
                group: {
                    include: {
                        _count: { select: { members: true, posts: true } }
                    }
                }
            }
        });

        const groups = memberships.map(m => ({
            ...m.group,
            role: m.role
        }));

        res.json({ groups });
    } catch (error) {
        console.error('Get my groups error:', error);
        res.status(500).json({ error: 'Failed to get groups' });
    }
};

// Get single group detail (with tabs data)
const getGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true, fullName: true, username: true, avatarUrl: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { members: true, messages: true, posts: true } }
            }
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const membership = group.members.find(m => m.userId === req.user.id);
        const isMember = !!membership;
        const userRole = membership?.role;

        // Check pending join request
        let hasPendingRequest = false;
        if (!isMember && group.isPrivate) {
            const request = await prisma.groupJoinRequest.findUnique({
                where: { userId_groupId: { userId: req.user.id, groupId: id } }
            });
            hasPendingRequest = request?.status === 'pending';
        }

        res.json({
            group: { ...group, isMember, userRole, hasPendingRequest }
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ error: 'Failed to get group' });
    }
};

// Join group (or request to join private group)
const joinGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const existing = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId: id } }
        });
        if (existing) return res.status(400).json({ error: 'Already a member' });

        if (group.isPrivate) {
            // Create join request
            await prisma.groupJoinRequest.upsert({
                where: { userId_groupId: { userId: req.user.id, groupId: id } },
                create: { userId: req.user.id, groupId: id, status: 'pending' },
                update: { status: 'pending' }
            });
            return res.json({ message: 'Join request sent', pending: true });
        }

        await prisma.groupMember.create({
            data: { userId: req.user.id, groupId: id, role: 'member' }
        });

        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ error: 'Failed to join group' });
    }
};

// Join by invite code
const joinByInvite = async (req, res) => {
    try {
        const { code } = req.params;

        const group = await prisma.group.findUnique({ where: { inviteCode: code } });
        if (!group) return res.status(404).json({ error: 'Invalid invite code' });

        const existing = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId: group.id } }
        });
        if (existing) return res.status(400).json({ error: 'Already a member' });

        await prisma.groupMember.create({
            data: { userId: req.user.id, groupId: group.id, role: 'member' }
        });

        res.json({ message: 'Joined group successfully', group });
    } catch (error) {
        console.error('Join by invite error:', error);
        res.status(500).json({ error: 'Failed to join group' });
    }
};

// Leave group
const leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.groupMember.delete({
            where: { userId_groupId: { userId: req.user.id, groupId: id } }
        });

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ error: 'Failed to leave group' });
    }
};

// ==================== ADMIN CONTROLS ====================

// Helper: check admin/moderator role
const checkAdminRole = async (userId, groupId) => {
    const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId } }
    });
    return member && (member.role === 'admin' || member.role === 'moderator') ? member.role : null;
};

// Kick member
const kickMember = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const role = await checkAdminRole(req.user.id, id);
        if (!role) return res.status(403).json({ error: 'Admin/moderator access required' });

        // Can't kick yourself
        if (userId === req.user.id) return res.status(400).json({ error: 'Cannot kick yourself' });

        // Moderators can't kick admins
        const target = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId: id } }
        });
        if (!target) return res.status(404).json({ error: 'Member not found' });
        if (role === 'moderator' && target.role === 'admin') {
            return res.status(403).json({ error: 'Cannot kick an admin' });
        }

        await prisma.groupMember.delete({
            where: { userId_groupId: { userId, groupId: id } }
        });

        res.json({ message: 'Member kicked' });
    } catch (error) {
        console.error('Kick member error:', error);
        res.status(500).json({ error: 'Failed to kick member' });
    }
};

// Mute/Unmute member
const toggleMute = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const role = await checkAdminRole(req.user.id, id);
        if (!role) return res.status(403).json({ error: 'Admin/moderator access required' });

        const member = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId: id } }
        });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const updated = await prisma.groupMember.update({
            where: { userId_groupId: { userId, groupId: id } },
            data: { isMuted: !member.isMuted }
        });

        res.json({ message: updated.isMuted ? 'Member muted' : 'Member unmuted', isMuted: updated.isMuted });
    } catch (error) {
        console.error('Toggle mute error:', error);
        res.status(500).json({ error: 'Failed to toggle mute' });
    }
};

// Promote member (member -> moderator or moderator -> admin)
const promoteMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role: newRole } = req.body;

        // Only admin can promote
        const myRole = await checkAdminRole(req.user.id, id);
        if (myRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        if (!['moderator', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Role must be moderator or admin' });
        }

        await prisma.groupMember.update({
            where: { userId_groupId: { userId, groupId: id } },
            data: { role: newRole }
        });

        res.json({ message: `Member promoted to ${newRole}` });
    } catch (error) {
        console.error('Promote member error:', error);
        res.status(500).json({ error: 'Failed to promote member' });
    }
};

// Update group settings (admin only)
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl, isPrivate, category } = req.body;

        const myRole = await checkAdminRole(req.user.id, id);
        if (myRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const data = {};
        if (name !== undefined) data.name = name.trim();
        if (description !== undefined) data.description = description?.trim();
        if (imageUrl !== undefined) data.imageUrl = imageUrl;
        if (isPrivate !== undefined) data.isPrivate = isPrivate;
        if (category !== undefined) data.category = category?.trim() || null;

        const group = await prisma.group.update({
            where: { id },
            data,
            include: { _count: { select: { members: true } } }
        });

        res.json({ group });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ error: 'Failed to update group' });
    }
};

// ==================== JOIN REQUESTS ====================

// Get pending join requests (admin/mod)
const getJoinRequests = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await checkAdminRole(req.user.id, id);
        if (!role) return res.status(403).json({ error: 'Admin/moderator access required' });

        const requests = await prisma.groupJoinRequest.findMany({
            where: { groupId: id, status: 'pending' },
            include: {
                user: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true, college: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ requests });
    } catch (error) {
        console.error('Get join requests error:', error);
        res.status(500).json({ error: 'Failed to get requests' });
    }
};

// Handle join request (approve/reject)
const handleJoinRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        const role = await checkAdminRole(req.user.id, id);
        if (!role) return res.status(403).json({ error: 'Admin/moderator access required' });

        const request = await prisma.groupJoinRequest.findUnique({ where: { id: requestId } });
        if (!request || request.groupId !== id) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (action === 'approve') {
            await prisma.$transaction([
                prisma.groupMember.create({
                    data: { userId: request.userId, groupId: id, role: 'member' }
                }),
                prisma.groupJoinRequest.update({
                    where: { id: requestId },
                    data: { status: 'approved' }
                })
            ]);
            return res.json({ message: 'Request approved' });
        }

        await prisma.groupJoinRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });

        res.json({ message: 'Request rejected' });
    } catch (error) {
        console.error('Handle join request error:', error);
        res.status(500).json({ error: 'Failed to handle request' });
    }
};

// ==================== GROUP POSTS ====================

// Create group post
const createGroupPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, mediaUrl } = req.body;

        if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

        // Check membership & mute status
        const membership = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId: id } }
        });
        if (!membership) return res.status(403).json({ error: 'Must be a member' });
        if (membership.isMuted) return res.status(403).json({ error: 'You are muted in this group' });

        const post = await prisma.groupPost.create({
            data: {
                content: content.trim(),
                mediaUrl: mediaUrl || null,
                authorId: req.user.id,
                groupId: id
            },
            include: {
                author: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            }
        });

        res.status(201).json({ post });
    } catch (error) {
        console.error('Create group post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

// Get group posts feed
const getGroupPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await prisma.groupPost.findMany({
            where: { groupId: id },
            skip,
            take: parseInt(limit),
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                author: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            }
        });

        res.json({ posts });
    } catch (error) {
        console.error('Get group posts error:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
};

// Delete group post (author or admin)
const deleteGroupPost = async (req, res) => {
    try {
        const { id, postId } = req.params;

        const post = await prisma.groupPost.findUnique({ where: { id: postId } });
        if (!post || post.groupId !== id) return res.status(404).json({ error: 'Post not found' });

        const isAuthor = post.authorId === req.user.id;
        const role = await checkAdminRole(req.user.id, id);

        if (!isAuthor && !role) return res.status(403).json({ error: 'Not authorized' });

        await prisma.groupPost.delete({ where: { id: postId } });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete group post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

// Pin/unpin group post (admin/mod only)
const togglePinPost = async (req, res) => {
    try {
        const { id, postId } = req.params;

        const role = await checkAdminRole(req.user.id, id);
        if (!role) return res.status(403).json({ error: 'Admin/moderator access required' });

        const post = await prisma.groupPost.findUnique({ where: { id: postId } });
        if (!post || post.groupId !== id) return res.status(404).json({ error: 'Post not found' });

        const updated = await prisma.groupPost.update({
            where: { id: postId },
            data: { isPinned: !post.isPinned }
        });

        res.json({ message: updated.isPinned ? 'Post pinned' : 'Post unpinned', isPinned: updated.isPinned });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({ error: 'Failed to toggle pin' });
    }
};

// ==================== GROUP MESSAGES ====================

// Get group messages
const getGroupMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const messages = await prisma.groupMessage.findMany({
            where: { groupId: id },
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            }
        });

        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Get group messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};

// Send message to group
const sendGroupMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const membership = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId: id } }
        });

        if (!membership) return res.status(403).json({ error: 'Must be a member to send messages' });
        if (membership.isMuted) return res.status(403).json({ error: 'You are muted in this group' });

        const message = await prisma.groupMessage.create({
            data: {
                content: content.trim(),
                senderId: req.user.id,
                groupId: id
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                }
            }
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send group message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get group categories list
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.group.groupBy({
            by: ['category'],
            where: { category: { not: null }, isPrivate: false },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        });

        res.json({
            categories: categories
                .filter(c => c.category)
                .map(c => ({ name: c.category, count: c._count.id }))
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getMyGroups,
    getGroup,
    joinGroup,
    joinByInvite,
    leaveGroup,
    kickMember,
    toggleMute,
    promoteMember,
    updateGroup,
    getJoinRequests,
    handleJoinRequest,
    createGroupPost,
    getGroupPosts,
    deleteGroupPost,
    togglePinPost,
    getGroupMessages,
    sendGroupMessage,
    getCategories
};
