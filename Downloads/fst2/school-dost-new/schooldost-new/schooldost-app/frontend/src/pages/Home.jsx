// Home Page - Matching Reference Design
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getAvatarUrl } from '../utils/imageUtils';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedRes, usersRes, trendsRes] = await Promise.all([
        postAPI.getFeed(),
        userAPI.getSuggested(),
        postAPI.getTrending().catch(() => ({ data: { hashtags: [] } })) // Soft fail for trending
      ]);
      
      setPosts(feedRes.data.posts || []);
      setSuggestedUsers(usersRes.data.users || []);
      setTrendingTags(trendsRes.data.hashtags || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    const postWithAuthor = {
      ...newPost,
      author: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      _count: { likes: 0, comments: 0 },
      isLiked: false
    };
    setPosts(prev => [postWithAuthor, ...prev]);
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.follow(userId);
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <h1>Hey Dost 👋</h1>
          <p>Ready to share something awesome today?</p>
        </header>

        <CreatePost onPostCreated={handlePostCreated} />

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* POSTS TAB */}
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <h3>No posts yet</h3>
                  <p>Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
                  />
                ))
              )
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="users-list">
                {suggestedUsers.length === 0 ? (
                  <div className="empty-state">
                    <h3>No suggestions currently</h3>
                  </div>
                ) : (
                  suggestedUsers.map(u => (
                    <div key={u.id} className="user-suggestion" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Link to={`/profile/${u.id}`}>
                        <img 
                          src={getAvatarUrl(u)} 
                          alt={u.fullName} 
                          style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                        />
                      </Link>
                      <div style={{ flex: 1 }}>
                        <Link to={`/profile/${u.id}`} style={{ fontWeight: 600, fontSize: '1rem' }}>{u.fullName}</Link>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.college || 'Student'}</div>
                      </div>
                      <button className="follow-btn" onClick={() => handleFollow(u.id)}>Follow</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TRENDS TAB */}
            {activeTab === 'trends' && (
              <div className="trends-list">
                {trendingTags.length === 0 ? (
                  <div className="empty-state">
                    <h3>No trends right now</h3>
                  </div>
                ) : (
                  trendingTags.map(tag => (
                    <div key={tag.id} style={{
                      background: 'var(--bg-card)',
                      padding: '20px',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', 
                          background: 'rgba(250, 204, 21, 0.2)', 
                          color: '#facc15', 
                          borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', fontSize: '1.2rem'
                        }}>#</div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{tag.name}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tag.count} posts</div>
                        </div>
                      </div>
                      <Link to={`/hashtag/${tag.name}`}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }}>View</button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}
