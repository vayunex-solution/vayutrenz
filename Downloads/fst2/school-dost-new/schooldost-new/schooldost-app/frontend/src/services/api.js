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
    verifyEmail: (token) => api.get(`/auth/verify/${token}`),
    refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),
    deactivate: () => api.post('/auth/deactivate')
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

// ========== VERIFICATION ==========
export const verificationAPI = {
    request: (data) => api.post('/verification/request', data),
    getStatus: () => api.get('/verification/status')
};

// ========== ADMIN ==========
export const adminAPI = {
    // Analytics
    getAnalytics: () => api.get('/admin/analytics'),
    getChartData: () => api.get('/admin/charts'),

    // User Management
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    toggleBanUser: (id, ban, reason) => api.post(`/admin/users/${id}/ban`, { ban, reason }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Post Management
    getPosts: (params = {}) => api.get('/admin/posts', { params }),
    deletePost: (id) => api.delete(`/admin/posts/${id}`),

    // Reports
    getReports: (status = 'PENDING', page = 1) => api.get(`/admin/reports?status=${status}&page=${page}`),
    resolveReport: (id, data) => api.post(`/admin/reports/${id}/resolve`, data),
    createReport: (data) => api.post('/admin/reports', data)
};

// ========== BLOCK ==========
export const blockAPI = {
    block: (userId) => api.post(`/users/${userId}/block`),
    unblock: (userId) => api.delete(`/users/${userId}/block`),
    getBlocked: () => api.get('/users/blocked/list')
};



// ========== POSTS ==========
export const postAPI = {
    getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
    getPost: (id) => api.get(`/posts/${id}`),
    create: (data) => api.post('/posts', data),
    update: (id, content) => api.put(`/posts/${id}`, { content }),
    delete: (id) => api.delete(`/posts/${id}`),
    like: (id) => api.post(`/posts/${id}/like`),
    comment: (id, content, parentId) => api.post(`/posts/${id}/comment`, { content, parentId }),
    deleteComment: (commentId) => api.delete(`/posts/comment/${commentId}`),
    editComment: (commentId, content) => api.put(`/posts/comment/${commentId}`, { content }),
    likeComment: (commentId) => api.post(`/posts/comment/${commentId}/like`),
    repost: (id, content) => api.post(`/posts/${id}/repost`, { content }),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
    getTrending: () => api.get('/posts/trending'),
    getByTag: (tag) => api.get(`/posts/hashtag/${tag}`),
    save: (id) => api.post(`/posts/${id}/save`),
    votePoll: (pollId, optionId) => api.post('/posts/poll/vote', { pollId, optionId })
};

// ========== MATCHES ==========
export const matchAPI = {
    getDiscover: () => api.get('/matches/discover'),
    swipe: (userId, direction) => api.post('/matches/swipe', { userId, direction }),
    getMatches: () => api.get('/matches'),
    unmatch: (id) => api.delete(`/matches/${id}`),
    getCompatibility: (userId) => api.get(`/matches/compatibility/${userId}`)
};

// ========== GROUPS ==========
export const groupAPI = {
    getAll: (search, category) => api.get('/groups', { params: { search, category } }),
    getMy: () => api.get('/groups/my'),
    get: (id) => api.get(`/groups/${id}`),
    create: (data) => api.post('/groups', data),
    update: (id, data) => api.put(`/groups/${id}`, data),
    join: (id) => api.post(`/groups/${id}/join`),
    joinByInvite: (code) => api.post(`/groups/invite/${code}`),
    leave: (id) => api.delete(`/groups/${id}/leave`),
    getMessages: (id) => api.get(`/groups/${id}/messages`),
    sendMessage: (id, content) => api.post(`/groups/${id}/messages`, { content }),
    // Admin controls
    kickMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
    toggleMute: (id, userId) => api.put(`/groups/${id}/members/${userId}/mute`),
    promoteMember: (id, userId, role) => api.put(`/groups/${id}/members/${userId}/role`, { role }),
    // Join requests
    getJoinRequests: (id) => api.get(`/groups/${id}/requests`),
    handleJoinRequest: (id, requestId, action) => api.put(`/groups/${id}/requests/${requestId}`, { action }),
    // Group posts
    createPost: (id, data) => api.post(`/groups/${id}/posts`, data),
    getPosts: (id, page) => api.get(`/groups/${id}/posts`, { params: { page } }),
    deletePost: (id, postId) => api.delete(`/groups/${id}/posts/${postId}`),
    togglePin: (id, postId) => api.put(`/groups/${id}/posts/${postId}/pin`),
    // Categories
    getCategories: () => api.get('/groups/categories')
};

// ========== MESSAGES ==========
export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (userId) => api.get(`/messages/${userId}`),
    send: (userId, content, mediaUrl, mediaType) => api.post(`/messages/${userId}`, { content, mediaUrl, mediaType }),
    delete: (messageId) => api.delete(`/messages/${messageId}`),
    edit: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
    search: (q, userId) => api.get(`/messages/search?q=${encodeURIComponent(q)}${userId ? `&userId=${userId}` : ''}`),
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
    delete: (id) => api.delete(`/notifications/${id}`),
    subscribe: (subscription) => api.post('/notifications/subscribe', subscription)
};

// ========== SEARCH ==========
export const searchAPI = {
    global: (q, type, limit) => api.get('/search', { params: { q, type, limit } })
};

// ========== EVENTS ==========
export const eventAPI = {
    getAll: (category, past) => api.get('/events', { params: { category, past } }),
    get: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    rsvp: (id, status) => api.post(`/events/${id}/rsvp`, { status }),
    getMy: () => api.get('/events/user/my'),
    delete: (id) => api.delete(`/events/${id}`)
};

// ========== MARKETPLACE ==========
export const marketplaceAPI = {
    getListings: (params) => api.get('/marketplace', { params }),
    get: (id) => api.get(`/marketplace/${id}`),
    create: (data) => api.post('/marketplace', data),
    update: (id, data) => api.put(`/marketplace/${id}`, data),
    delete: (id) => api.delete(`/marketplace/${id}`),
    getMy: () => api.get('/marketplace/user/my'),
    getCategories: () => api.get('/marketplace/categories')
};

// ========== LINK PREVIEW ==========
export const postExtrasAPI = {
    linkPreview: (url) => api.post('/posts/link-preview', { url })
};


// ========== GAMIFICATION ==========
export const gamificationAPI = {
    getBadges: () => api.get('/gamification/badges'),
    getMyBadges: () => api.get('/gamification/my-badges'),
    getUserBadges: (userId) => api.get(`/gamification/badges/${userId}`),
    getLeaderboard: () => api.get('/gamification/leaderboard')
};


export default api;
