// Message Controller (Direct Messages) - Enhanced
const prisma = require('../config/database');
const { getIO } = require('../socket/socket.registry');

// Get conversations list
const getConversations = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ],
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true, avatarUrl: true, isOnline: true, lastSeen: true }
        },
        receiver: {
          select: { id: true, fullName: true, username: true, avatarUrl: true, isOnline: true, lastSeen: true }
        }
      }
    });

    const conversationsMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (msg.receiverId === req.user.id && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get messages with a specific user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;

    const where = {
      OR: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ],
      isDeleted: false
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true }
        }
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    // Emit read receipt via socket
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('message:read', { readBy: req.user.id });
    }

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send a message (supports text + media)
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, mediaUrl, mediaType } = req.body;

    if (!content?.trim() && !mediaUrl) {
      return res.status(400).json({ error: 'Message content or media is required' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // Check blocked status
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.id, blockedId: userId },
          { blockerId: userId, blockedId: req.user.id }
        ]
      }
    });

    if (blocked) {
      return res.status(403).json({ error: 'Cannot message this user' });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || '',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        senderId: req.user.id,
        receiverId: userId
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true }
        }
      }
    });

    // Real-time delivery
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('message:receive', message);
    }

    // Notification
    await prisma.notification.create({
      data: {
        type: 'message',
        receiverId: userId,
        senderId: req.user.id
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, receiverId: true }
    });

    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: 'This message was deleted' }
    });

    // Notify receiver in real-time
    const io = getIO();
    if (io) {
      const receiverId = message.receiverId;
      io.to(`user:${receiverId}`).emit('message:deleted', { messageId });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Edit message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, receiverId: true, createdAt: true }
    });

    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Only allow edit within 15 minutes
    const fifteenMin = 15 * 60 * 1000;
    if (Date.now() - new Date(message.createdAt).getTime() > fifteenMin) {
      return res.status(400).json({ error: 'Can only edit messages within 15 minutes' });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim(), isEdited: true },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } }
      }
    });

    // Notify receiver
    const io = getIO();
    if (io) {
      io.to(`user:${message.receiverId}`).emit('message:edited', updated);
    }

    res.json({ message: updated });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { q, userId } = req.query;

    if (!q?.trim()) return res.status(400).json({ error: 'Search query is required' });

    const where = {
      content: { contains: q.trim(), mode: 'insensitive' },
      isDeleted: false,
      OR: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    };

    if (userId) {
      where.OR = [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
        receiver: { select: { id: true, fullName: true, avatarUrl: true } }
      }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false,
        isDeleted: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  searchMessages,
  getUnreadCount
};
