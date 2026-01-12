// Socket Service - Real-time connection
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;

// Message functions
export const sendMessage = (receiverId, content) => {
    if (socket) {
        socket.emit('message:send', { receiverId, content });
    }
};

export const onMessageReceive = (callback) => {
    if (socket) {
        socket.on('message:receive', callback);
    }
};

export const startTyping = (receiverId) => {
    if (socket) {
        socket.emit('typing:start', { receiverId });
    }
};

export const stopTyping = (receiverId) => {
    if (socket) {
        socket.emit('typing:stop', { receiverId });
    }
};

// Group functions
export const joinGroupRoom = (groupId) => {
    if (socket) {
        socket.emit('group:join', { groupId });
    }
};

export const leaveGroupRoom = (groupId) => {
    if (socket) {
        socket.emit('group:leave', { groupId });
    }
};

export const sendGroupMessage = (groupId, content) => {
    if (socket) {
        socket.emit('group:message', { groupId, content });
    }
};

// Notification functions
export const onNotification = (callback) => {
    if (socket) {
        socket.on('notification', callback);
    }
};

export const onUserOnline = (callback) => {
    if (socket) {
        socket.on('user:online', callback);
    }
};

export const onUserOffline = (callback) => {
    if (socket) {
        socket.on('user:offline', callback);
    }
};

export default {
    connectSocket,
    disconnectSocket,
    getSocket,
    sendMessage,
    onMessageReceive,
    startTyping,
    stopTyping,
    joinGroupRoom,
    leaveGroupRoom,
    sendGroupMessage,
    onNotification,
    onUserOnline,
    onUserOffline
};
