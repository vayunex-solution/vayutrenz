// Profile Page - Instagram-Style Professional Design
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import { getImageUrl, getAvatarUrl, getCoverUrl } from '../utils/imageUtils';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import {
  FiEdit, FiMapPin, FiCalendar, FiMessageCircle, FiUserPlus, FiUserCheck,
  FiGrid, FiImage, FiHeart, FiInfo, FiCamera, FiLink, FiMoreHorizontal,
  FiShare2, FiBookmark
} from 'react-icons/fi';
import { IoCheckmarkCircle } from 'react-icons/io5';

// Format number for display (1234 -> 1.2K)
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Followers/Following Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' or 'following'
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Open followers/following modal
  const openModal = async (type) => {
    setModalType(type);
    setShowModal(true);
    setModalLoading(true);
    try {
      const { data } = type === 'followers' 
        ? await userAPI.getFollowers(targetUserId)
        : await userAPI.getFollowing(targetUserId);
      setModalUsers(data.users || data.followers || data.following || []);
    } catch (error) {
      console.error('Load users error:', error);
      setModalUsers([]);
    } finally {
      setModalLoading(false);
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
          <div style={{ textAlign: 'center', padding: '100px' }}>
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
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
            <FiInfo size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '1.2rem' }}>User not found</p>
          </div>
        </main>
      </div>
    );
  }

  const mediaPosts = posts.filter(p => p.media && p.media.length > 0);
  const tabs = [
    { id: 'posts', icon: <FiGrid />, label: 'Posts', count: posts.length },
    { id: 'media', icon: <FiImage />, label: 'Media', count: mediaPosts.length },
    { id: 'about', icon: <FiInfo />, label: 'About', count: null }
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content" style={{ maxWidth: '935px', padding: 0 }}>

        {/* ========== COVER PHOTO ========== */}
        <div style={{
          position: 'relative',
          height: '280px',
          background: getCoverUrl(profile)
            ? `url(${getCoverUrl(profile)}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          borderRadius: '0 0 24px 24px'
        }}>
          {/* Gradient overlay for text readability */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            borderRadius: '0 0 24px 24px'
          }} />

          {/* Edit cover button (own profile) */}
          {isOwnProfile && (
            <button
              onClick={() => navigate('/settings')}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                padding: '10px 16px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <FiCamera size={16} />
              Edit Cover
            </button>
          )}
        </div>

        {/* ========== PROFILE HEADER ========== */}
        <div style={{
          padding: '0 24px',
          marginTop: '-75px',
          position: 'relative',
          zIndex: 10
        }}>

          {/* Avatar + Actions Row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>

            {/* Avatar with online badge */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '158px',
                height: '158px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #facc15, #f59e0b, #facc15)',
                padding: '4px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <img
                  src={getAvatarUrl(profile)}
                  alt={profile.fullName}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '4px solid var(--bg-primary)',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Online status indicator */}
              {profile.isOnline && (
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  border: '4px solid var(--bg-primary)',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.5)'
                }} />
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '10px'
            }}>
              {isOwnProfile ? (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}
                  >
                    <FiEdit size={18} />
                    Edit Profile
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px'
                    }}
                  >
                    <FiShare2 size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleFollow}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 28px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      minWidth: '130px',
                      justifyContent: 'center'
                    }}
                  >
                    {isFollowing ? <><FiUserCheck size={18} /> Following</> : <><FiUserPlus size={18} /> Follow</>}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/messages/${targetUserId}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}
                  >
                    <FiMessageCircle size={18} />
                    Message
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '12px',
                      borderRadius: '12px'
                    }}
                  >
                    <FiMoreHorizontal size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + Username + Verified */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-white)'
              }}>
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <IoCheckmarkCircle
                  size={24}
                  style={{ color: '#3b82f6' }}
                  title="Verified"
                />
              )}
            </div>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1rem'
            }}>
              @{profile.username}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px',
              color: 'var(--text-white)'
            }}>
              {profile.bio}
            </p>
          )}

          {/* Info chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            {profile.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMapPin size={16} /> {profile.location}
              </span>
            )}
            {profile.college && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎓 {profile.college}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-yellow)'
                }}
              >
                <FiLink size={16} /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCalendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* ========== STATS ROW (Instagram Style) ========== */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '40px',
            padding: '20px 0',
            borderTop: '1px solid var(--border-dark)',
            borderBottom: '1px solid var(--border-dark)'
          }}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--text-white)'
              }}>
                {formatNumber(profile._count?.posts || 0)}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '2px'
              }}>
                Posts
              </div>
            </div>

            <div onClick={() => openModal('followers')} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--text-white)'
              }}>
                {formatNumber(profile._count?.followers || 0)}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '2px'
              }}>
                Followers
              </div>
            </div>

            <div onClick={() => openModal('following')} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--text-white)'
              }}>
                {formatNumber(profile._count?.following || 0)}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '2px'
              }}>
                Following
              </div>
            </div>
          </div>
        </div>

        {/* ========== TABS ========== */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-dark)',
          padding: '0 24px',
          marginTop: '8px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-yellow)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-yellow)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span style={{
                  fontSize: '0.8rem',
                  opacity: 0.7
                }}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========== TAB CONTENT ========== */}
        <div style={{ padding: '24px' }}>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '20px',
                gap: '8px'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '10px',
                    background: viewMode === 'grid' ? 'var(--accent-yellow)' : 'var(--bg-input)',
                    color: viewMode === 'grid' ? '#000' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '10px',
                    background: viewMode === 'list' ? 'var(--accent-yellow)' : 'var(--bg-input)',
                    color: viewMode === 'list' ? '#000' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiImage size={18} />
                </button>
              </div>

              {posts.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-muted)'
                }}>
                  <FiCamera size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem' }}>No posts yet</p>
                  {isOwnProfile && (
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Share your first post!</p>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View - Instagram Style */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px'
                }}>
                  {posts.map(post => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        overflow: 'hidden',
                        borderRadius: '4px',
                        background: 'var(--bg-input)'
                      }}
                    >
                      {post.media && post.media.length > 0 ? (
                        <img
                          src={getImageUrl(post.media[0].url)}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          textAlign: 'center',
                          lineHeight: '1.4'
                        }}>
                          {post.content?.substring(0, 80)}...
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: '#fff',
                        fontWeight: '600'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiHeart /> {post._count?.likes || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiMessageCircle /> {post._count?.comments || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* List View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              )}
            </>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            mediaPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)'
              }}>
                <FiImage size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No media posts yet</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px'
              }}>
                {mediaPosts.map(post => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      overflow: 'hidden',
                      borderRadius: '4px'
                    }}
                  >
                    <img
                      src={getImageUrl(post.media[0]?.url)}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>
                ))}
              </div>
            )
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-dark)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'var(--text-white)'
              }}>
                About {profile.fullName}
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {profile.bio && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Bio</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.bio}</p>
                  </div>
                )}

                {profile.college && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>College</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.college}</p>
                  </div>
                )}

                {profile.department && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Department</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.department}</p>
                  </div>
                )}

                {profile.batch && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Batch</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.batch}</p>
                  </div>
                )}

                {profile.graduationYear && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Graduation Year</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.graduationYear}</p>
                  </div>
                )}

                {profile.location && (
                  <div>
                    <label style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Location</label>
                    <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>{profile.location}</p>
                  </div>
                )}

                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Member Since</label>
                  <p style={{ marginTop: '4px', color: 'var(--text-white)' }}>
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========== FOLLOWERS/FOLLOWING MODAL ========== */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '70vh',
              overflow: 'hidden',
              border: '1px solid var(--border-dark)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '700',
                textTransform: 'capitalize'
              }}>
                {modalType}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '12px',
              maxHeight: 'calc(70vh - 70px)',
              overflowY: 'auto'
            }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                </div>
              ) : modalUsers.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: 'var(--text-muted)'
                }}>
                  <p>No {modalType} yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {modalUsers.map(user => (
                    <div 
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => {
                        setShowModal(false);
                        navigate(`/profile/${user.id}`);
                      }}
                    >
                      {/* Avatar */}
                      <img 
                        src={getImageUrl(user.avatarUrl) || `https://api.dicebear.com/8.x/initials/svg?seed=${user.fullName}&backgroundColor=facc15&textColor=000`}
                        alt={user.fullName}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* User Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: 'var(--text-white)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.fullName}
                        </p>
                        <p style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}>
                          @{user.username}
                        </p>
                      </div>

                      {/* Follow Button (if not own profile) */}
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle follow (simplified - you can enhance this)
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'var(--bg-input)',
                            color: 'var(--text-white)',
                            border: '1px solid var(--border-dark)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
