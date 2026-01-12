// Discover / Explore Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiTrendingUp, FiUsers, FiHash, FiFilter } from 'react-icons/fi';
import { userAPI, postAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Discover() {
    const [activeTab, setActiveTab] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [postsRes, usersRes] = await Promise.all([
                postAPI.getFeed(),
                userAPI.getSuggested()
            ]);
            setTrendingPosts(postsRes.data.posts || []);
            setSuggestedUsers(usersRes.data.users || []);
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setActiveTab('search');

        try {
            const { data } = await userAPI.search(searchQuery);
            setSearchResults({
                users: data.users || [],
                posts: []
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await userAPI.follow(userId);
            setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Follow error:', error);
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

            <main className="main-content">
                <header className="page-header">
                    <h1><FiTrendingUp style={{ marginRight: '12px' }} />Discover</h1>
                    <p>Explore trending posts and find new dosts</p>
                </header>

                {/* Search Bar */}
                <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
                    <div className="search-box" style={{ background: 'var(--bg-card)' }}>
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search users, posts, hashtags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', marginLeft: '8px' }}>
                            Search
                        </button>
                    </div>
                </form>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        <FiTrendingUp style={{ marginRight: '6px' }} /> Trending
                    </button>
                    <button
                        className={`tab ${activeTab === 'people' ? 'active' : ''}`}
                        onClick={() => setActiveTab('people')}
                    >
                        <FiUsers style={{ marginRight: '6px' }} /> People
                    </button>
                    <button
                        className={`tab ${activeTab === 'hashtags' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hashtags')}
                    >
                        <FiHash style={{ marginRight: '6px' }} /> Hashtags
                    </button>
                    {searchQuery && (
                        <button
                            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <FiSearch style={{ marginRight: '6px' }} /> Results
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Trending Posts */}
                        {activeTab === 'trending' && (
                            <>
                                {trendingPosts.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🔥</div>
                                        <h3>No trending posts yet</h3>
                                        <p>Be the first to create something awesome!</p>
                                    </div>
                                ) : (
                                    trendingPosts.map(post => (
                                        <PostCard key={post.id} post={post} />
                                    ))
                                )}
                            </>
                        )}

                        {/* Suggested People */}
                        {activeTab === 'people' && (
                            <div style={{
                                background: 'var(--bg-card)',
                                borderRadius: '20px',
                                padding: '20px',
                                border: '1px solid var(--border-dark)'
                            }}>
                                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Suggested for you</h3>

                                {suggestedUsers.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                                        No suggestions available right now
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {suggestedUsers.map(user => (
                                            <div key={user.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '16px',
                                                background: 'var(--bg-input)',
                                                borderRadius: '16px'
                                            }}>
                                                <Link to={`/profile/${user.id}`}>
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt={user.fullName}
                                                        style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover' }}
                                                    />
                                                </Link>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Link to={`/profile/${user.id}`}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.fullName}</div>
                                                    </Link>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        @{user.username}
                                                    </div>
                                                    {user.college && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {user.college}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="follow-btn"
                                                    onClick={() => handleFollow(user.id)}
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hashtags */}
                        {activeTab === 'hashtags' && (
                            <div className="empty-state">
                                <div className="empty-state-icon">#️⃣</div>
                                <h3>Hashtags coming soon</h3>
                                <p>Explore trending topics and hashtags</p>
                            </div>
                        )}

                        {/* Search Results */}
                        {activeTab === 'search' && (
                            <>
                                {searching ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }}>
                                        <div className="spinner"></div>
                                        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Searching...</p>
                                    </div>
                                ) : searchResults.users.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🔍</div>
                                        <h3>No results found</h3>
                                        <p>Try searching with different keywords</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: '20px',
                                        padding: '20px',
                                        border: '1px solid var(--border-dark)'
                                    }}>
                                        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
                                            Found {searchResults.users.length} users
                                        </h3>

                                        {searchResults.users.map(user => (
                                            <div key={user.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '14px 0',
                                                borderBottom: '1px solid var(--border-dark)'
                                            }}>
                                                <Link to={`/profile/${user.id}`}>
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt={user.fullName}
                                                        style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                                                    />
                                                </Link>
                                                <div style={{ flex: 1 }}>
                                                    <Link to={`/profile/${user.id}`}>
                                                        <div style={{ fontWeight: '600' }}>{user.fullName}</div>
                                                    </Link>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        @{user.username}
                                                    </div>
                                                </div>
                                                <button className="follow-btn" onClick={() => handleFollow(user.id)}>
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
