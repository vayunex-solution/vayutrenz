import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FiUsers, FiFileText, FiAlertTriangle, FiBarChart2, FiSearch,
    FiTrash2, FiShield, FiUserX, FiUserCheck, FiChevronLeft,
    FiChevronRight, FiDownload, FiRefreshCw, FiFilter, FiX,
    FiTrendingUp, FiActivity, FiCheckSquare, FiSquare, FiMoreVertical,
    FiEye, FiEdit2, FiSlash, FiLogOut
} from 'react-icons/fi';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import './AdminDashboard.css';

// Custom confirmation modal component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className={`modal-icon ${type}`}>
                    {type === 'danger' ? <FiAlertTriangle /> : <FiCheckSquare />}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn-modal-cancel" onClick={onCancel}>Cancel</button>
                    <button className={`btn-modal-confirm ${type}`} onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

// Quick Stats Card with animation
const StatCard = ({ icon: Icon, value, label, color, trend, onClick }) => (
    <div className={`stat-card ${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div className="stat-card-header">
            <div className={`stat-icon ${color}`}><Icon /></div>
            {trend && (
                <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
                    <FiTrendingUp />
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <div className="stat-value">{value?.toLocaleString() || 0}</div>
        <div className="stat-label">{label}</div>
    </div>
);

// Chart colors
const CHART_COLORS = ['#facc15', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'];

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data States
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Bulk Selection
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [selectedPosts, setSelectedPosts] = useState(new Set());

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

    // Fetch Data
    const fetchData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            switch (activeTab) {
                case 'dashboard':
                    const [analyticsRes, chartsRes] = await Promise.all([
                        adminAPI.getAnalytics(),
                        adminAPI.getChartData()
                    ]);
                    setStats(analyticsRes.data);
                    setChartData(chartsRes.data);
                    break;
                case 'users':
                    const usersRes = await adminAPI.getUsers({
                        page: pagination.page,
                        search: searchQuery,
                        role: roleFilter,
                        status: statusFilter
                    });
                    setUsers(usersRes.data.users);
                    setPagination({
                        page: usersRes.data.page,
                        totalPages: usersRes.data.totalPages,
                        total: usersRes.data.total
                    });
                    break;
                case 'posts':
                    const postsRes = await adminAPI.getPosts({
                        page: pagination.page,
                        search: searchQuery
                    });
                    setPosts(postsRes.data.posts);
                    setPagination({
                        page: postsRes.data.page,
                        totalPages: postsRes.data.totalPages,
                        total: postsRes.data.total
                    });
                    break;
                case 'reports':
                    const reportsRes = await adminAPI.getReports('PENDING', pagination.page);
                    setReports(reportsRes.data.reports);
                    setPagination({
                        page: reportsRes.data.page,
                        totalPages: reportsRes.data.totalPages,
                        total: reportsRes.data.total
                    });
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Admin fetch error:', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, pagination.page, searchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Tab Change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPagination({ page: 1, totalPages: 1, total: 0 });
        setSearchQuery('');
        setRoleFilter('');
        setStatusFilter('');
        setSelectedUsers(new Set());
        setSelectedPosts(new Set());
    };

    // Confirmation Modal Helper
    const showConfirm = (title, message, onConfirm, type = 'danger') => {
        setModal({ isOpen: true, title, message, onConfirm, type });
    };

    const closeModal = () => setModal({ ...modal, isOpen: false });

    // User Actions
    const handleBanUser = async (userId, isBanned) => {
        showConfirm(
            isBanned ? 'Unban User?' : 'Ban User?',
            isBanned ? 'This user will regain access to the platform.' : 'This user will be blocked from accessing the platform.',
            async () => {
                try {
                    await adminAPI.toggleBanUser(userId, !isBanned, 'Admin action');
                    toast.success(isBanned ? 'User unbanned' : 'User banned');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to update user');
                }
                closeModal();
            },
            isBanned ? 'success' : 'danger'
        );
    };

    const handleDeleteUser = async (userId) => {
        showConfirm(
            'Delete User Permanently?',
            'This action cannot be undone. All user data will be lost.',
            async () => {
                try {
                    await adminAPI.deleteUser(userId);
                    toast.success('User deleted');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to delete user');
                }
                closeModal();
            }
        );
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            fetchData();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    // Bulk Actions
    const handleBulkBan = () => {
        if (selectedUsers.size === 0) return;
        showConfirm(
            `Ban ${selectedUsers.size} Users?`,
            'Selected users will be blocked from accessing the platform.',
            async () => {
                try {
                    await Promise.all([...selectedUsers].map(id => adminAPI.toggleBanUser(id, true, 'Bulk ban')));
                    toast.success(`${selectedUsers.size} users banned`);
                    setSelectedUsers(new Set());
                    fetchData();
                } catch (err) {
                    toast.error('Some operations failed');
                }
                closeModal();
            }
        );
    };

    const handleBulkDelete = () => {
        if (selectedUsers.size === 0) return;
        showConfirm(
            `Delete ${selectedUsers.size} Users?`,
            'This action cannot be undone!',
            async () => {
                try {
                    await Promise.all([...selectedUsers].map(id => adminAPI.deleteUser(id)));
                    toast.success(`${selectedUsers.size} users deleted`);
                    setSelectedUsers(new Set());
                    fetchData();
                } catch (err) {
                    toast.error('Some operations failed');
                }
                closeModal();
            }
        );
    };

    // Post Actions
    const handleDeletePost = async (postId) => {
        showConfirm(
            'Delete Post?',
            'This post will be permanently removed.',
            async () => {
                try {
                    await adminAPI.deletePost(postId);
                    toast.success('Post deleted');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to delete post');
                }
                closeModal();
            }
        );
    };

    // Report Actions
    const handleResolveReport = async (reportId, action) => {
        const actionLabels = {
            'IGNORE': 'Ignore this report?',
            'DELETE_CONTENT': 'Delete the reported content?',
            'BAN_USER': 'Ban the reported user?'
        };
        showConfirm(
            actionLabels[action],
            'This action will resolve the report.',
            async () => {
                try {
                    await adminAPI.resolveReport(reportId, { action });
                    toast.success('Report resolved');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to resolve report');
                }
                closeModal();
            },
            action === 'IGNORE' ? 'success' : 'danger'
        );
    };

    // Toggle Selection
    const toggleUserSelect = (id) => {
        const newSet = new Set(selectedUsers);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedUsers(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u.id)));
        }
    };

    // Export Data
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        toast.success('Data exported');
    };

    // Access Control
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return (
            <div className="admin-access-denied">
                <FiShield size={80} />
                <h1>Access Denied</h1>
                <p>You need Admin or Moderator privileges.</p>
            </div>
        );
    }

    const pieData = stats ? [
        { name: 'Users', value: stats.stats.totalUsers },
        { name: 'Posts', value: stats.stats.totalPosts },
        { name: 'Reports', value: stats.stats.totalReports }
    ] : [];

    return (
        <div className="admin-layout">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
            }} />

            <ConfirmModal {...modal} onCancel={closeModal} />

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <FiShield size={28} />
                    <div>
                        <span className="admin-title">Admin Panel</span>
                        <span className="admin-role">{user.role}</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {[
                        { id: 'dashboard', icon: FiBarChart2, label: 'Dashboard' },
                        { id: 'users', icon: FiUsers, label: 'Users', count: stats?.stats?.totalUsers },
                        { id: 'posts', icon: FiFileText, label: 'Posts', count: stats?.stats?.totalPosts },
                        { id: 'reports', icon: FiAlertTriangle, label: 'Reports', badge: stats?.stats?.pendingReports }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <tab.icon size={20} />
                            <span className="nav-label">{tab.label}</span>
                            {tab.count !== undefined && <span className="nav-count">{tab.count}</span>}
                            {tab.badge > 0 && <span className="admin-badge">{tab.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <img src={user.avatarUrl || '/default-avatar.png'} alt={user.fullName} />
                        <div>
                            <span className="user-name">{user.fullName}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={logout} title="Logout">
                        <FiLogOut />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div>
                        <h1 className="admin-page-title">
                            {activeTab === 'dashboard' && 'Dashboard Overview'}
                            {activeTab === 'users' && 'User Management'}
                            {activeTab === 'posts' && 'Post Moderation'}
                            {activeTab === 'reports' && 'Moderation Queue'}
                        </h1>
                        <p className="admin-page-subtitle">
                            {activeTab === 'dashboard' && 'Monitor your platform performance'}
                            {activeTab === 'users' && `${pagination.total || 0} total users`}
                            {activeTab === 'posts' && `${pagination.total || 0} total posts`}
                            {activeTab === 'reports' && `${stats?.stats?.pendingReports || 0} pending reports`}
                        </p>
                    </div>
                    <div className="admin-header-actions">
                        <button className="btn-icon" onClick={() => fetchData(true)} title="Refresh">
                            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                        </button>
                        {activeTab === 'users' && (
                            <button className="btn-icon" onClick={() => exportToCSV(users, 'users_export')} title="Export">
                                <FiDownload />
                            </button>
                        )}
                    </div>
                </header>

                {/* Loading */}
                {loading && (
                    <div className="admin-loading">
                        <div className="loader"></div>
                    </div>
                )}

                {/* Dashboard Tab */}
                {!loading && activeTab === 'dashboard' && stats && (
                    <div className="admin-dashboard">
                        <div className="stats-grid">
                            <StatCard
                                icon={FiUsers}
                                value={stats.stats.totalUsers}
                                label="Total Users"
                                color="blue"
                                trend={12}
                                onClick={() => handleTabChange('users')}
                            />
                            <StatCard
                                icon={FiFileText}
                                value={stats.stats.totalPosts}
                                label="Total Posts"
                                color="green"
                                trend={8}
                                onClick={() => handleTabChange('posts')}
                            />
                            <StatCard
                                icon={FiAlertTriangle}
                                value={stats.stats.pendingReports}
                                label="Pending Reports"
                                color="red"
                                onClick={() => handleTabChange('reports')}
                            />
                            <StatCard
                                icon={FiActivity}
                                value={stats.stats.totalReports}
                                label="Total Reports"
                                color="purple"
                            />
                        </div>

                        <div className="charts-grid">
                            {/* User Signups Chart */}
                            <div className="chart-card">
                                <h3><FiTrendingUp /> User Signups (7 Days)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={chartData?.userSignups || []}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Posts Activity Chart */}
                            <div className="chart-card">
                                <h3><FiActivity /> Post Activity (7 Days)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData?.postActivity || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Distribution Pie Chart */}
                            <div className="chart-card small">
                                <h3>Distribution</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {pieData.map((entry, index) => (
                                        <div key={entry.name} className="legend-item">
                                            <span className="legend-color" style={{ background: CHART_COLORS[index] }}></span>
                                            <span>{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="admin-section">
                            <div className="section-header">
                                <h2>Recent Signups</h2>
                                <button className="btn-link" onClick={() => handleTabChange('users')}>View All →</button>
                            </div>
                            <div className="recent-users-grid">
                                {stats.recentUsers.map(u => (
                                    <div key={u.id} className="recent-user-card">
                                        <img src={u.avatarUrl || '/default-avatar.png'} alt={u.fullName} />
                                        <div className="recent-user-info">
                                            <span className="name">{u.fullName}</span>
                                            <span className="email">{u.email}</span>
                                        </div>
                                        <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {!loading && activeTab === 'users' && (
                    <div className="admin-users">
                        {/* Filters */}
                        <div className="admin-toolbar">
                            <div className="search-input">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                                />
                                {searchQuery && (
                                    <button className="btn-clear" onClick={() => { setSearchQuery(''); fetchData(); }}>
                                        <FiX />
                                    </button>
                                )}
                            </div>

                            <button className={`btn-filter ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                                <FiFilter /> Filters
                            </button>

                            <button className="btn-search" onClick={() => fetchData()}>Search</button>

                            {selectedUsers.size > 0 && (
                                <div className="bulk-actions">
                                    <span>{selectedUsers.size} selected</span>
                                    <button className="btn-bulk ban" onClick={handleBulkBan}>
                                        <FiSlash /> Ban All
                                    </button>
                                    <button className="btn-bulk delete" onClick={handleBulkDelete}>
                                        <FiTrash2 /> Delete All
                                    </button>
                                </div>
                            )}
                        </div>

                        {showFilters && (
                            <div className="filters-panel">
                                <div className="filter-group">
                                    <label>Role</label>
                                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                        <option value="">All Roles</option>
                                        <option value="USER">User</option>
                                        <option value="MODERATOR">Moderator</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>
                                <button className="btn-apply" onClick={() => fetchData()}>Apply Filters</button>
                                <button className="btn-reset" onClick={() => { setRoleFilter(''); setStatusFilter(''); fetchData(); }}>Reset</button>
                            </div>
                        )}

                        {/* Users Table */}
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th className="checkbox-cell">
                                            <button className="checkbox" onClick={toggleSelectAll}>
                                                {selectedUsers.size === users.length && users.length > 0 ? <FiCheckSquare /> : <FiSquare />}
                                            </button>
                                        </th>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Stats</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className={`${u.isBanned ? 'banned-row' : ''} ${selectedUsers.has(u.id) ? 'selected-row' : ''}`}>
                                            <td className="checkbox-cell">
                                                <button className="checkbox" onClick={() => toggleUserSelect(u.id)}>
                                                    {selectedUsers.has(u.id) ? <FiCheckSquare /> : <FiSquare />}
                                                </button>
                                            </td>
                                            <td className="user-cell">
                                                <img src={u.avatarUrl || '/default-avatar.png'} alt={u.fullName} />
                                                <div>
                                                    <span className="user-name">{u.fullName}</span>
                                                    <span className="user-username">@{u.username}</span>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td className="stats-cell">
                                                <span title="Posts">📝 {u._count?.posts || 0}</span>
                                                <span title="Followers">👥 {u._count?.followers || 0}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`role-select ${u.role.toLowerCase()}`}
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={u.id === user.id}
                                                >
                                                    <option value="USER">User</option>
                                                    <option value="MODERATOR">Moderator</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.isBanned ? 'banned' : 'active'}`}>
                                                    {u.isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className={`action-btn ${u.isBanned ? 'unban' : 'ban'}`}
                                                    onClick={() => handleBanUser(u.id, u.isBanned)}
                                                    disabled={u.id === user.id}
                                                    title={u.isBanned ? 'Unban' : 'Ban'}
                                                >
                                                    {u.isBanned ? <FiUserCheck /> : <FiUserX />}
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.id === user.id}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="admin-pagination">
                            <span className="pagination-info">
                                Showing {users.length} of {pagination.total || 0}
                            </span>
                            <div className="pagination-controls">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                >
                                    <FiChevronLeft /> Prev
                                </button>
                                <span className="pagination-current">Page {pagination.page} / {pagination.totalPages || 1}</span>
                                <button
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                >
                                    Next <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Tab */}
                {!loading && activeTab === 'posts' && (
                    <div className="admin-posts">
                        <div className="admin-toolbar">
                            <div className="search-input">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                                />
                            </div>
                            <button className="btn-search" onClick={() => fetchData()}>Search</button>
                        </div>

                        <div className="posts-grid">
                            {posts.map(post => (
                                <div key={post.id} className="post-mod-card">
                                    <div className="post-mod-header">
                                        <img src={post.author?.avatarUrl || '/default-avatar.png'} alt="" />
                                        <div>
                                            <span className="author-name">{post.author?.fullName}</span>
                                            <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
                                        </div>
                                        <button className="btn-more"><FiMoreVertical /></button>
                                    </div>
                                    <p className="post-mod-content">
                                        {post.content?.substring(0, 180)}{post.content?.length > 180 ? '...' : ''}
                                    </p>
                                    <div className="post-mod-stats">
                                        <span>❤️ {post._count?.likes || 0} likes</span>
                                        <span>💬 {post._count?.comments || 0} comments</span>
                                    </div>
                                    <div className="post-mod-actions">
                                        <button className="btn-view"><FiEye /> View</button>
                                        <button className="btn-delete-post" onClick={() => handleDeletePost(post.id)}>
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="admin-pagination">
                            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages || 1}</span>
                            <div className="pagination-controls">
                                <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                                    <FiChevronLeft />
                                </button>
                                <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Tab */}
                {!loading && activeTab === 'reports' && (
                    <div className="admin-reports">
                        {reports.length === 0 ? (
                            <div className="no-reports">
                                <div className="no-reports-icon">🎉</div>
                                <h2>All Clear!</h2>
                                <p>No pending reports to review</p>
                            </div>
                        ) : (
                            <div className="reports-list">
                                {reports.map(report => (
                                    <div key={report.id} className="report-card">
                                        <div className="report-header">
                                            <div className="report-meta">
                                                <span className={`report-type ${report.type}`}>{report.type}</span>
                                                <span className="report-reason">{report.reason}</span>
                                            </div>
                                            <span className="report-time">{new Date(report.createdAt).toLocaleString()}</span>
                                        </div>

                                        <p className="report-description">{report.description}</p>

                                        {report.post && (
                                            <div className="reported-content post">
                                                <div className="content-header">
                                                    <FiFileText /> Reported Post
                                                </div>
                                                <p>"{report.post.content?.substring(0, 150)}..."</p>
                                            </div>
                                        )}

                                        {report.user && (
                                            <div className="reported-content user">
                                                <div className="content-header">
                                                    <FiUsers /> Reported User
                                                </div>
                                                <p>@{report.user.username} • {report.user.email}</p>
                                            </div>
                                        )}

                                        <div className="report-actions">
                                            <button className="btn-ignore" onClick={() => handleResolveReport(report.id, 'IGNORE')}>
                                                ✓ Ignore
                                            </button>
                                            <button className="btn-delete" onClick={() => handleResolveReport(report.id, 'DELETE_CONTENT')}>
                                                <FiTrash2 /> Delete Content
                                            </button>
                                            <button className="btn-ban" onClick={() => handleResolveReport(report.id, 'BAN_USER')}>
                                                <FiSlash /> Ban User
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
