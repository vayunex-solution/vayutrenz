// Notification Context - Real-time Toast Notifications
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket';
import { FiHeart, FiMessageCircle, FiUserPlus, FiUsers, FiBell, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext(null);

// Notification sound using Web Audio API
const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a pleasant notification chime
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1); // C#6 note

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
        console.log('Audio not supported');
    }
};

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();

    // Add a toast notification
    const addToast = useCallback((notification) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...notification, id }]);

        // Play notification sound
        playNotificationSound();

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    // Remove a toast
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Listen for socket notifications
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNotification = (notification) => {
            console.log('🔔 New notification:', notification);
            addToast(notification);
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [addToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <FiHeart style={{ color: '#ef4444' }} />;
            case 'comment': return <FiMessageCircle style={{ color: '#3b82f6' }} />;
            case 'follow': return <FiUserPlus style={{ color: '#22c55e' }} />;
            case 'match': return <FiHeart style={{ color: '#ec4899' }} />;
            case 'message': return <FiMessageCircle style={{ color: '#facc15' }} />;
            case 'group': return <FiUsers style={{ color: '#a855f7' }} />;
            default: return <FiBell style={{ color: '#facc15' }} />;
        }
    };

    const getMessage = (notification) => {
        const name = notification.sender?.fullName || 'Someone';
        switch (notification.type) {
            case 'like': return `${name} liked your post`;
            case 'comment': return `${name} commented on your post`;
            case 'follow': return `${name} started following you`;
            case 'match': return `You matched with ${name}! 🎉`;
            case 'message': return `New message from ${name}`;
            default: return notification.message || 'New notification';
        }
    };

    const handleToastClick = (notification) => {
        removeToast(notification.id);

        // Navigate based on type
        switch (notification.type) {
            case 'like':
            case 'comment':
                if (notification.postId) navigate(`/post/${notification.postId}`);
                break;
            case 'follow':
                if (notification.senderId) navigate(`/profile/${notification.senderId}`);
                break;
            case 'match':
                navigate('/matches');
                break;
            case 'message':
                if (notification.senderId) navigate(`/messages/${notification.senderId}`);
                break;
            default:
                navigate('/notifications');
        }
    };

    return (
        <NotificationContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '380px'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => handleToastClick(toast)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '16px 20px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-dark)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            cursor: 'pointer',
                            animation: 'slideIn 0.3s ease',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.3rem',
                            flexShrink: 0
                        }}>
                            {getIcon(toast.type)}
                        </div>

                        {/* Avatar */}
                        {toast.sender?.avatarUrl && (
                            <img
                                src={toast.sender.avatarUrl}
                                alt=""
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                }}
                            />
                        )}

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: 'var(--text-white)',
                                marginBottom: '2px'
                            }}>
                                {getMessage(toast)}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Just now
                            </span>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                            style={{
                                padding: '6px',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: 'none',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* CSS Animation */}
            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export default NotificationContext;
