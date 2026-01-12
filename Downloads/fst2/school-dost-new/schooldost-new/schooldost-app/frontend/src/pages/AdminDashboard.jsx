// Admin Dashboard Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUsers, FiFileText, FiHeart, FiFlag, FiTrendingUp,
    FiUserCheck, FiUserX, FiTrash2, FiShield, FiSearch,
    FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const { data } = await adminAPI.getDashboard();
                setStats(data.stats);
            } else if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers({ page: pagination.page, search: searchQuery });
                setUsers(data.users);
                setPagination(data.pagination);
            } else if (activeTab === 'reports') {
                const { data } = await adminAPI.getReports({ page: pagination.page });
                setReports(data.reports);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Load admin data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId, banned) => {
        try {
            await adminAPI.banUser(userId, { banned, reason: 'Violated community guidelines' });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: banned } : u));
        } catch (error) {
            console.error('Ban user error:', error);
        }
    };

    const handleUpdateRole = async (userId, role) => {
        try {
            await adminAPI.updateUserRole(userId, { role });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        } catch (error) {
            console.error('Update role error:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure? This will delete all user data.')) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Delete user error:', error);
        }
    };

    const handleReport = async (reportId, action) => {
        try {
            await adminAPI.handleReport(reportId, { action });
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (error) {
            console.error('Handle report error:', error);
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

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content" style={{ maxWidth: '1200px' }}>
                <header className="page-header">
                    <h1><FiShield style={{ marginRight: '12px' }} />Admin Dashboard</h1>
                    <p>Manage users, content, and reports</p>
                </header>

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: '24px' }}>
                    <button
                        className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <FiTrendingUp /> Stats
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> Users
                    </button>
                    <button
                        className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <FiFlag /> Reports
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Stats */}
                        {activeTab === 'dashboard' && stats && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <StatCard icon={<FiUsers />} label="Total Users" value={stats.totalUsers} color="#3b82f6" />
                                <StatCard icon={<FiFileText />} label="Total Posts" value={stats.totalPosts} color="#22c55e" />
                                <StatCard icon={<FiHeart />} label="Total Matches" value={stats.totalMatches} color="#ec4899" />
                                <StatCard icon={<FiUserCheck />} label="Active Now" value={stats.activeUsers} color="#facc15" />
                                <StatCard icon={<FiTrendingUp />} label="New Users Today" value={stats.newUsersToday} color="#a855f7" />
                                <StatCard icon={<FiFileText />} label="New Posts Today" value={stats.newPostsToday} color="#f97316" />
                                <StatCard icon={<FiFlag />} label="Pending Reports" value={stats.reportedContent} color="#ef4444" />
                            </div>
                        )}

                        {/* Users Management */}
                        {activeTab === 'users' && (
                            <>
                                <div className="search-box" style={{ marginBottom: '20px' }}>
                                    <FiSearch />
                                    <input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadData()}
                                    />
                                </div>

                                <div style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-dark)',
                                    overflow: 'hidden'
                                }}>
                                    {users.map((user, idx) => (
                                        <div key={user.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '16px 20px',
                                            borderBottom: idx < users.length - 1 ? '1px solid var(--border-dark)' : 'none'
                                        }}>
                                            <img
                                                src={getAvatarUrl(user)}
                                                alt={user.fullName}
                                                style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {user.fullName}
                                                    {user.role !== 'USER' && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            background: user.role === 'ADMIN' ? '#ef4444' : '#a855f7',
                                                            color: '#fff'
                                                        }}>
                                                            {user.role}
                                                        </span>
                                                    )}
                                                    {user.isBanned && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            background: '#ef4444',
                                                            color: '#fff'
                                                        }}>
                                                            BANNED
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    @{user.username} • {user.email}
                                                </div>
                                            </div>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    background: 'var(--bg-input)',
                                                    border: '1px solid var(--border-dark)',
                                                    color: 'var(--text-white)',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <option value="USER">User</option>
                                                <option value="MODERATOR">Moderator</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleBanUser(user.id, !user.isBanned)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    background: user.isBanned ? '#22c55e' : '#f97316',
                                                    color: '#fff',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {user.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                        disabled={pagination.page <= 1}
                                        className="btn btn-secondary"
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <span style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                        disabled={pagination.page >= pagination.pages}
                                        className="btn btn-secondary"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Reports */}
                        {activeTab === 'reports' && (
                            reports.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✅</div>
                                    <h3>No pending reports</h3>
                                    <p>All reports have been handled</p>
                                </div>
                            ) : (
                                <div style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-dark)',
                                    overflow: 'hidden'
                                }}>
                                    {reports.map((report, idx) => (
                                        <div key={report.id} style={{
                                            padding: '20px',
                                            borderBottom: idx < reports.length - 1 ? '1px solid var(--border-dark)' : 'none'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {report.reason}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {report.post && (
                                                <p style={{ marginBottom: '12px', color: 'var(--text-gray)' }}>
                                                    Post: "{report.post.content?.slice(0, 100)}..."
                                                </p>
                                            )}

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleReport(report.id, 'dismiss')}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                >
                                                    Dismiss
                                                </button>
                                                {report.postId && (
                                                    <button
                                                        onClick={() => handleReport(report.id, 'delete')}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            background: '#ef4444',
                                                            color: '#fff',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Delete Post
                                                    </button>
                                                )}
                                                {report.userId && (
                                                    <button
                                                        onClick={() => handleReport(report.id, 'ban')}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            background: '#f97316',
                                                            color: '#fff',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Ban User
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid var(--border-dark)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${color}20`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '16px'
            }}>
                {icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                {value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {label}
            </div>
        </div>
    );
}
