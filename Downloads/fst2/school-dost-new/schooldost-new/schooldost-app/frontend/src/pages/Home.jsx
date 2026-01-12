// Home Page - Matching Reference Design
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data } = await postAPI.getFeed();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Load posts error:', error);
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

        {/* Posts Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </main>

      <RightSidebar />
    </div>
  );
}
