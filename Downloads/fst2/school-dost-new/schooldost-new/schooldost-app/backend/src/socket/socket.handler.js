// Socket.io Handler for Real-time Features
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'schooldost-secret-key';

// Store online users: { userId: Set of socketIds } (allows multiple tabs)
const onlineUsers = new Map();
const MAX_CONNECTIONS_PER_USER = 5; // Limit connections per user

const setupSocket = (io) => {
    // Configure socket.io for stability
    io.engine.pingTimeout = 60000; // 60 seconds
    io.engine.pingInterval = 25000; // 25 seconds

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
            console.error('Socket auth error:', error.message);
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.user.id;

        // Check connection limit per user
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        const userSockets = onlineUsers.get(userId);
        if (userSockets.size >= MAX_CONNECTIONS_PER_USER) {
            console.log(`⚠️ Connection limit reached for ${socket.user.fullName}`);
            socket.emit('error', { message: 'Too many connections' });
            socket.disconnect(true);
            return;
        }

        userSockets.add(socket.id);
        console.log(`User connected: ${socket.user.fullName} (${userId}) - ${userSockets.size} active connections`);

        // Update user online status (only if first connection)
        if (userSockets.size === 1) {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { isOnline: true, lastSeen: new Date() }
                });
                // Broadcast online status to all users
                io.emit('user:online', { userId });
            } catch (err) {
                console.error('DB update error:', err.message);
            }
        }

        // Join user to their personal room for notifications
        socket.join(`user:${userId}`);

        // Error handler for this socket
        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.user.fullName}:`, error.message);
        });

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
            io.to(`user:${receiverId}`).emit('typing:start', {
                userId: socket.user.id,
                fullName: socket.user.fullName
            });
        });

        socket.on('typing:stop', ({ receiverId }) => {
            io.to(`user:${receiverId}`).emit('typing:stop', {
                userId: socket.user.id
            });
        });

        // ========== READ RECEIPTS ==========
        socket.on('message:read', async ({ senderId }) => {
            try {
                await prisma.message.updateMany({
                    where: {
                        senderId,
                        receiverId: socket.user.id,
                        isRead: false
                    },
                    data: { isRead: true }
                });
                io.to(`user:${senderId}`).emit('message:read', {
                    readBy: socket.user.id
                });
            } catch (err) {
                console.error('Read receipt error:', err.message);
            }
        });

        // ========== MESSAGE DELETE/EDIT REAL-TIME ==========
        socket.on('message:delete', ({ messageId, receiverId }) => {
            io.to(`user:${receiverId}`).emit('message:deleted', { messageId });
        });

        socket.on('message:edit', ({ message, receiverId }) => {
            io.to(`user:${receiverId}`).emit('message:edited', message);
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
            const userId = socket.user.id;
            const userSockets = onlineUsers.get(userId);

            if (userSockets) {
                userSockets.delete(socket.id);
                console.log(`User disconnected: ${socket.user.fullName} - ${userSockets.size} connections remaining`);

                // Only mark offline if no more connections
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);

                    try {
                        await prisma.user.update({
                            where: { id: userId },
                            data: { isOnline: false, lastSeen: new Date() }
                        });
                        // Broadcast offline status
                        io.emit('user:offline', { userId });
                    } catch (err) {
                        console.error('DB update error:', err.message);
                    }
                }
            }
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
