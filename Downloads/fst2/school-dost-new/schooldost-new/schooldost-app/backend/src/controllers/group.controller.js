// Group Controller
const prisma = require('../config/database');

// Create a group
const createGroup = async (req, res) => {
    try {
        const { name, description, isPrivate = false } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                isPrivate,
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

// Get all public groups
const getGroups = async (req, res) => {
    try {
        const { search, limit = 20 } = req.query;

        const where = { isPrivate: false };
        if (search) {
            where.name = { contains: search };
        }

        const groups = await prisma.group.findMany({
            where,
            take: parseInt(limit),
            include: {
                _count: { select: { members: true } }
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
                        _count: { select: { members: true } }
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

// Get single group
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
                                id: true,
                                fullName: true,
                                username: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                _count: { select: { members: true, messages: true } }
            }
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId === req.user.id);
        const userRole = group.members.find(m => m.userId === req.user.id)?.role;

        res.json({
            group: {
                ...group,
                isMember,
                userRole
            }
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ error: 'Failed to get group' });
    }
};

// Join group
const joinGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if already a member
        const existing = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already a member' });
        }

        await prisma.groupMember.create({
            data: {
                userId: req.user.id,
                groupId: id,
                role: 'member'
            }
        });

        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ error: 'Failed to join group' });
    }
};

// Leave group
const leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id
                }
            }
        });

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ error: 'Failed to leave group' });
    }
};

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
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
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

        // Check if user is a member
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id
                }
            }
        });

        if (!membership) {
            return res.status(403).json({ error: 'Must be a member to send messages' });
        }

        const message = await prisma.groupMessage.create({
            data: {
                content: content.trim(),
                senderId: req.user.id,
                groupId: id
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send group message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getMyGroups,
    getGroup,
    joinGroup,
    leaveGroup,
    getGroupMessages,
    sendGroupMessage
};
