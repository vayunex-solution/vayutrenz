// Socket Service - Real-time connection
import { io } from 'socket.io-client';

// Hardcoded for production stability
const SOCKET_URL = import.meta.env.MODE === 'production' 
    ? 'https://api.schooldost.com' 
    : 'http://localhost:5000';

let socket = null;
let isIntentionalDisconnect = false;

export const connectSocket = (token) => {
    // If socket exists and is connected or connecting, return it
    if (socket && socket.connected) return socket;
    
    // If socket exists but disconnected, try reconnecting
    if (socket) {
        socket.auth = { token };
        socket.connect();
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected');
    });

    socket.on('disconnect', (reason) => {
        if (!isIntentionalDisconnect) {
            console.log('❌ Socket disconnected:', reason);
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        isIntentionalDisconnect = true;
        socket.disconnect();
        socket = null;
        isIntentionalDisconnect = false;
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
