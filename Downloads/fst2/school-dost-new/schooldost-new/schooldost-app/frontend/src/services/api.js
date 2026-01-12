// API Service - Handles all HTTP requests to backend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTH ==========
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyEmail: (token) => api.get(`/auth/verify/${token}`)
};

// ========== USERS ==========
export const userAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    search: (query) => api.get(`/users/search?q=${query}`),
    getSuggested: () => api.get('/users/suggested/list'),
    follow: (id) => api.post(`/users/${id}/follow`),
    unfollow: (id) => api.delete(`/users/${id}/follow`),
    getFollowers: (id) => api.get(`/users/${id}/followers`),
    getFollowing: (id) => api.get(`/users/${id}/following`)
};

// ========== POSTS ==========
export const postAPI = {
    getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
    getPost: (id) => api.get(`/posts/${id}`),
    create: (data) => api.post('/posts', data),
    delete: (id) => api.delete(`/posts/${id}`),
    like: (id) => api.post(`/posts/${id}/like`),
    comment: (id, content) => api.post(`/posts/${id}/comment`, { content }),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
    getTrending: () => api.get('/posts/trending')
};

// ========== MATCHES ==========
export const matchAPI = {
    getDiscover: () => api.get('/matches/discover'),
    swipe: (userId, direction) => api.post('/matches/swipe', { userId, direction }),
    getMatches: () => api.get('/matches'),
    unmatch: (id) => api.delete(`/matches/${id}`)
};

// ========== GROUPS ==========
export const groupAPI = {
    getAll: () => api.get('/groups'),
    getMy: () => api.get('/groups/my'),
    get: (id) => api.get(`/groups/${id}`),
    create: (data) => api.post('/groups', data),
    join: (id) => api.post(`/groups/${id}/join`),
    leave: (id) => api.delete(`/groups/${id}/leave`),
    getMessages: (id) => api.get(`/groups/${id}/messages`),
    sendMessage: (id, content) => api.post(`/groups/${id}/messages`, { content })
};

// ========== MESSAGES ==========
export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (userId) => api.get(`/messages/${userId}`),
    send: (userId, content) => api.post(`/messages/${userId}`, { content }),
    getUnreadCount: () => api.get('/messages/unread')
};

// ========== UPLOAD ==========
export const uploadAPI = {
    avatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    cover: (file) => {
        const formData = new FormData();
        formData.append('cover', file);
        return api.post('/upload/cover', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    image: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    images: (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// ========== NOTIFICATIONS ==========
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`)
};

// ========== ADMIN ==========
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
    banUser: (userId, data) => api.put(`/admin/users/${userId}/ban`, data),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getPosts: (params) => api.get('/admin/posts', { params }),
    deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
    getReports: (params) => api.get('/admin/reports', { params }),
    handleReport: (reportId, data) => api.put(`/admin/reports/${reportId}`, data)
};

export default api;
