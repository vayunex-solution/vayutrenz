import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import {
  FiHome, FiCompass, FiHeart, FiMessageCircle, FiUsers,
  FiBriefcase, FiCalendar, FiTrendingUp, FiBell, FiShield,
  FiSettings, FiSun, FiMoon, FiLogOut, FiSearch
} from 'react-icons/fi';
import logoImg from '../assets/logo.png';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  const mainLinks = [
    { to: '/', icon: <FiHome />, label: 'Home Feed' },
    { to: '/search', icon: <FiSearch />, label: 'Search' },
    { to: '/matches', icon: <FiHeart />, label: 'Matches' },
    { to: '/messages', icon: <FiMessageCircle />, label: 'Messages' },
    { to: '/notifications', icon: <FiBell />, label: 'Notifications', badge: unreadCount },
    { to: '/communities', icon: <FiUsers />, label: 'Communities' },
    { to: '/jobs', icon: <FiBriefcase />, label: 'Jobs' },
    { to: '/events', icon: <FiCalendar />, label: 'Events' },
    { to: '/leaderboard', icon: <FiTrendingUp />, label: 'Leaderboard' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img
          src={logoImg}
          alt="School Dost"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            objectFit: 'contain'
          }}
        />
        <h1>School<span>dost</span></h1>
      </div>

      <nav className="sidebar-nav">
        {mainLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            {link.icon}
            <span>{link.label}</span>
            {link.badge > 0 && (
              <span style={{
                position: 'absolute',
                right: '16px',
                background: 'var(--accent-yellow)',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '10px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {link.badge > 100 ? '99+' : link.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="nav-divider" />

        <NavLink to="/settings" className="nav-link">
          <FiSettings />
          <span>Settings</span>
        </NavLink>

        {/* Admin link - only for admins/moderators */}
        {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
          <NavLink to="/admin" className="nav-link">
            <FiShield />
            <span>Admin Panel</span>
          </NavLink>
        )}

        <button className="nav-link" onClick={toggleTheme}>
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      <div className="sidebar-profile" onClick={() => navigate('/profile')}>
        <img
          src={getAvatarUrl(user)}
          alt={user?.fullName}
        />
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{user?.fullName || 'User'}</div>
          <div className="sidebar-profile-username">@{user?.username || 'username'}</div>
        </div>
        <FiLogOut
          style={{
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            flexShrink: 0
          }}
          onClick={(e) => { e.stopPropagation(); handleLogout(); }}
        />
      </div>
    </aside>
  );
}
