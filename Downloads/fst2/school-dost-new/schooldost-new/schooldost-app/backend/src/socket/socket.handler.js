// Socket.io Handler for Real-time Features
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'schooldost-secret-key';

// Store online users: { oduserId: socketId }
const onlineUsers = new Map();

const setupSocket = (io) => {
    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, fullName: true, username: true }
            });

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.fullName} (${socket.user.id})`);

        // Add user to online users
        onlineUsers.set(socket.user.id, socket.id);

        // Update user online status
        await prisma.user.update({
            where: { id: socket.user.id },
            data: { isOnline: true }
        });

        // Broadcast online status to all users
        io.emit('user:online', { userId: socket.user.id });

        // Join user to their personal room for notifications
        socket.join(`user:${socket.user.id}`);

        // ========== DIRECT MESSAGING ==========
        socket.on('message:send', async (data) => {
            try {
                const { receiverId, content } = data;

                if (!content?.trim() || !receiverId) return;

                // Save message to database
                const message = await prisma.message.create({
                    data: {
                        content: content.trim(),
                        senderId: socket.user.id,
                        receiverId
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true
                            }
                        }
                    }
                });

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message:receive', message);
                }

                // Send confirmation to sender
                socket.emit('message:sent', message);

            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ========== TYPING INDICATOR ==========
        socket.on('typing:start', ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing:start', { userId: socket.user.id });
            }
        });

        socket.on('typing:stop', ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing:stop', { userId: socket.user.id });
            }
        });

        // ========== GROUP MESSAGING ==========
        socket.on('group:join', ({ groupId }) => {
            socket.join(`group:${groupId}`);
        });

        socket.on('group:leave', ({ groupId }) => {
            socket.leave(`group:${groupId}`);
        });

        socket.on('group:message', async (data) => {
            try {
                const { groupId, content } = data;

                if (!content?.trim() || !groupId) return;

                // Check membership
                const membership = await prisma.groupMember.findUnique({
                    where: {
                        userId_groupId: {
                            userId: socket.user.id,
                            groupId
                        }
                    }
                });

                if (!membership) {
                    socket.emit('error', { message: 'Not a member of this group' });
                    return;
                }

                // Save message
                const message = await prisma.groupMessage.create({
                    data: {
                        content: content.trim(),
                        senderId: socket.user.id,
                        groupId
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true
                            }
                        }
                    }
                });

                // Broadcast to group
                io.to(`group:${groupId}`).emit('group:message', message);

            } catch (error) {
                console.error('Socket group message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ========== NOTIFICATIONS ==========
        socket.on('notification:read', async ({ notificationId }) => {
            try {
                await prisma.notification.update({
                    where: { id: notificationId },
                    data: { isRead: true }
                });
            } catch (error) {
                console.error('Mark notification read error:', error);
            }
        });

        // ========== DISCONNECT ==========
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.fullName}`);

            // Remove from online users
            onlineUsers.delete(socket.user.id);

            // Update user offline status
            await prisma.user.update({
                where: { id: socket.user.id },
                data: { isOnline: false, lastSeen: new Date() }
            });

            // Broadcast offline status
            io.emit('user:offline', { userId: socket.user.id });
        });
    });

    return io;
};

// Helper function to send notification to specific user
const sendNotification = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification', notification);
};

module.exports = setupSocket;
module.exports.sendNotification = sendNotification;
