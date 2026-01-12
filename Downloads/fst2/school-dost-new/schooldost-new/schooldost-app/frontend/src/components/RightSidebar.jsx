// Right Sidebar - Reference Design
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMic } from 'react-icons/fi';
import { userAPI, postAPI } from '../services/api';

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suggestionsRes, trendingRes] = await Promise.all([
        userAPI.getSuggested(),
        postAPI.getTrending()
      ]);
      setSuggestions(suggestionsRes.data.users || []);
      setTrending(trendingRes.data.hashtags || []);
    } catch (error) {
      console.error('Load sidebar data error:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.follow(userId);
      setSuggestions(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <aside className="right-sidebar">
      {/* Search Box */}
      <div className="search-box">
        <FiSearch />
        <input 
          type="text" 
          placeholder="Aurion discovery" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FiMic style={{ cursor: 'pointer' }} />
      </div>

      {/* Who to Follow */}
      <div className="widget-card">
        <h3 className="widget-title">Who to Follow</h3>
        
        <div className="search-box" style={{ marginBottom: '16px', padding: '10px 14px' }}>
          <FiSearch />
          <input type="text" placeholder="Search" />
        </div>

        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            No suggestions available
          </p>
        ) : (
          suggestions.slice(0, 3).map((user) => (
            <div key={user.id} className="user-suggestion">
              <Link to={`/profile/${user.id}`}>
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.fullName}&backgroundColor=facc15&textColor=000`}
                  alt={user.fullName}
                />
              </Link>
              <div className="user-suggestion-info">
                <Link to={`/profile/${user.id}`}>
                  <div className="user-suggestion-name">{user.fullName}</div>
                </Link>
                <div className="user-suggestion-college">{user.college || 'Schooldost User'}</div>
              </div>
              <button 
                className="follow-btn"
                onClick={() => handleFollow(user.id)}
              >
                Follow
              </button>
            </div>
          ))
        )}

        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)', 
          marginTop: '16px' 
        }}>
          Why suggested?
        </p>
      </div>

      {/* Trending */}
      <div className="widget-card">
        <h3 className="widget-title">Trending</h3>
        
        {trending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            No trending topics yet
          </p>
        ) : (
          trending.slice(0, 4).map((tag, index) => (
            <div key={tag.id} className="trending-item">
              <div className="trending-icon">#</div>
              <div className="trending-name">{tag.name}</div>
              <button className="trending-action">
                Join
              </button>
            </div>
          ))
        )}

        <button className="create-trend-btn">
          Create your own trend
        </button>
      </div>
    </aside>
  );
}
