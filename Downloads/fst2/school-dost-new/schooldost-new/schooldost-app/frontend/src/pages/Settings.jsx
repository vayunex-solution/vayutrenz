// Settings Page - With Profile Picture Upload
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, uploadAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { FiCamera, FiSave, FiLogOut, FiUser, FiMail, FiMapPin, FiBook, FiCalendar } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    college: user?.college || '',
    batch: user?.batch || '',
    course: user?.course || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const { data } = await uploadAPI.avatar(file);
      const fullAvatarUrl = `${API_BASE}${data.avatarUrl}`;
      updateUser({ ...user, avatarUrl: fullAvatarUrl });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await userAPI.updateProfile(formData);
      updateUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getAvatarUrl = () => {
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
      
      <main className="main-content" style={{ maxWidth: '800px' }}>
        <header className="page-header">
          <h1>Settings</h1>
          <p>Manage your profile and preferences</p>
        </header>

        {message.text && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            background: message.type === 'success' 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {message.text}
          </div>
        )}

        {/* Profile Picture Section */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--border-dark)',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={getAvatarUrl()}
              alt={user?.fullName}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                objectFit: 'cover',
                border: '4px solid var(--accent-yellow)'
              }}
            />
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              style={{
                position: 'absolute',
                bottom: '-8px',
                right: '-8px',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--accent-yellow)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--bg-card)',
                cursor: 'pointer'
              }}
            >
              {uploadingAvatar ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              ) : (
                <FiCamera size={18} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <h2 style={{ marginTop: '16px', fontSize: '1.3rem' }}>{user?.fullName}</h2>
          <p style={{ color: 'var(--text-muted)' }}>@{user?.username}</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid var(--border-dark)'
          }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUser /> Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your username"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-input"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label"><FiMapPin style={{ marginRight: '6px' }} />Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <h3 style={{ margin: '32px 0 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiBook /> Education Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">College/School</label>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Your institution"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label"><FiCalendar style={{ marginRight: '6px' }} />Batch</label>
                <input
                  type="text"
                  name="batch"
                  className="form-input"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Course/Class</label>
                <input
                  type="text"
                  name="course"
                  className="form-input"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech CSE"
                />
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1, minWidth: '150px' }}
              >
                {loading ? 'Saving...' : (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ minWidth: '120px', color: '#ef4444' }}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
