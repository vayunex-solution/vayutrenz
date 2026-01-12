// Notifications Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiHeart, FiMessageCircle, FiUserPlus, FiUsers, FiCheck, FiTrash2 } from 'react-icons/fi';
import { notificationAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await notificationAPI.getAll();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Load notifications error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <FiHeart style={{ color: '#ef4444' }} />;
            case 'comment': return <FiMessageCircle style={{ color: '#3b82f6' }} />;
            case 'follow': return <FiUserPlus style={{ color: '#22c55e' }} />;
            case 'match': return <FiHeart style={{ color: '#ec4899' }} />;
            case 'group': return <FiUsers style={{ color: '#a855f7' }} />;
            default: return <FiBell style={{ color: 'var(--accent-yellow)' }} />;
        }
    };

    const getAvatarUrl = (user) => {
        if (user?.avatarUrl) {
            return user.avatarUrl.startsWith('http')
                ? user.avatarUrl
                : `${API_BASE}${user.avatarUrl}`;
        }
        return `https://api.dicebear.com/8.x/initials/svg?seed=${user?.fullName}&backgroundColor=facc15&textColor=000`;
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content" style={{ maxWidth: '700px' }}>
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><FiBell style={{ marginRight: '12px' }} />Notifications</h1>
                        <p>Stay updated with your activity</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.85rem', padding: '10px 16px' }}
                        >
                            <FiCheck /> Mark all read
                        </button>
                    )}
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔔</div>
                        <h3>No notifications yet</h3>
                        <p>When someone interacts with you, you'll see it here</p>
                    </div>
                ) : (
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '20px',
                        border: '1px solid var(--border-dark)',
                        overflow: 'hidden'
                    }}>
                        {notifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '18px 20px',
                                    borderBottom: index < notifications.length - 1 ? '1px solid var(--border-dark)' : 'none',
                                    background: notification.read ? 'transparent' : 'rgba(250, 204, 21, 0.05)',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-input)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Avatar */}
                                {notification.fromUser && (
                                    <Link to={`/profile/${notification.fromUser.id}`}>
                                        <img
                                            src={getAvatarUrl(notification.fromUser)}
                                            alt={notification.fromUser.fullName}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '12px',
                                                objectFit: 'cover',
                                                flexShrink: 0
                                            }}
                                        />
                                    </Link>
                                )}

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                                        {notification.fromUser && (
                                            <Link to={`/profile/${notification.fromUser.id}`} style={{ fontWeight: '600', color: 'var(--text-white)' }}>
                                                {notification.fromUser.fullName}
                                            </Link>
                                        )}{' '}
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-muted)',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Mark as read"
                                        >
                                            <FiCheck size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-muted)',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title="Delete"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {/* Unread dot */}
                                {!notification.read && (
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'var(--accent-yellow)',
                                        flexShrink: 0
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
