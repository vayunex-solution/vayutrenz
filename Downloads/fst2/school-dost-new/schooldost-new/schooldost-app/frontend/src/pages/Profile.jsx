// Profile Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { FiEdit, FiMapPin, FiCalendar, FiMessageCircle, FiUserPlus, FiUserCheck } from 'react-icons/fi';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      loadProfile();
    }
  }, [targetUserId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(targetUserId),
        postAPI.getUserPosts(targetUserId)
      ]);
      setProfile(profileRes.data.user);
      setIsFollowing(profileRes.data.user.isFollowing || false);
      setPosts(postsRes.data.posts || []);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userAPI.unfollow(targetUserId);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers - 1 }
        }));
      } else {
        await userAPI.follow(targetUserId);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers + 1 }
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p>User not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content" style={{ maxWidth: 'calc(100% - var(--sidebar-width))' }}>
        {/* Cover Photo */}
        <div style={{
          height: '200px',
          background: profile.coverUrl 
            ? `url(${profile.coverUrl}) center/cover`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '-60px'
        }} />

        {/* Profile Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '20px',
          padding: '0 20px',
          marginBottom: '20px'
        }}>
          <img 
            src={profile.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.fullName}`}
            alt={profile.fullName}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid var(--bg-primary)'
            }}
          />
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{profile.fullName}</h1>
            <p style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
          </div>

          {isOwnProfile ? (
            <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
              <FiEdit /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleFollow}
              >
                {isFollowing ? <><FiUserCheck /> Following</> : <><FiUserPlus /> Follow</>}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate(`/messages/${targetUserId}`)}
              >
                <FiMessageCircle /> Message
              </button>
            </div>
          )}
        </div>

        {/* Bio & Info */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-color)' }}>
          {profile.bio && (
            <p style={{ marginBottom: '15px' }}>{profile.bio}</p>
          )}
          
          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {profile.location && (
              <span><FiMapPin /> {profile.location}</span>
            )}
            {profile.college && (
              <span>{profile.college}</span>
            )}
            <span><FiCalendar /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '25px', marginTop: '15px' }}>
            <span><strong>{profile._count?.posts || 0}</strong> Posts</span>
            <span><strong>{profile._count?.followers || 0}</strong> Followers</span>
            <span><strong>{profile._count?.following || 0}</strong> Following</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: '20px' }}>
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>No posts yet</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'about' && (
          <div className="widget-card" style={{ marginTop: '20px' }}>
            <h3 className="widget-title">About</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {profile.college && (
                <div>
                  <strong>College:</strong> {profile.college}
                </div>
              )}
              {profile.department && (
                <div>
                  <strong>Department:</strong> {profile.department}
                </div>
              )}
              {profile.batch && (
                <div>
                  <strong>Batch:</strong> {profile.batch}
                </div>
              )}
              {profile.graduationYear && (
                <div>
                  <strong>Graduation Year:</strong> {profile.graduationYear}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
