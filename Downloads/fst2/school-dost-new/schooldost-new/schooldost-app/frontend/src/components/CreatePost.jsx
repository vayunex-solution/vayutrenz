// Create Post Component - With Image Upload
import { useState, useRef } from 'react';
import { FiImage, FiVideo, FiBarChart2, FiHash, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { postAPI, uploadAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image first if exists
      if (image) {
        setUploadingImage(true);
        const uploadRes = await uploadAPI.image(image);
        imageUrl = uploadRes.data.imageUrl;
        setUploadingImage(false);
      }

      // Create post
      const { data } = await postAPI.create({
        content,
        imageUrl
      });

      setContent('');
      setImage(null);
      setImagePreview(null);

      if (onPostCreated) onPostCreated(data.post);
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
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
    <div className="create-post">
      <div className="create-post-top">
        <img
          src={getAvatarUrl()}
          alt={user?.fullName}
          className="create-post-avatar"
        />
        <div className="create-post-input-wrapper">
          <textarea
            className="create-post-input"
            placeholder="Ready to share something awesome today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{
          position: 'relative',
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
          <button
            onClick={removeImage}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <button
        className="create-post-btn"
        onClick={handleSubmit}
        disabled={loading || (!content.trim() && !image)}
      >
        {loading ? (
          uploadingImage ? 'Uploading image...' : 'Posting...'
        ) : 'Share with Dosts'}
      </button>

      <div className="create-post-actions">
        <button className="create-post-action" onClick={handleImageClick}>
          <FiImage /> Image
        </button>
        <button className="create-post-action" onClick={() => alert('Video support coming soon!')}>
          <FiVideo /> Video
        </button>
        <button className="create-post-action">
          <FiBarChart2 /> Polls
        </button>
        <button className="create-post-action">
          <FiHash /> Batch Tagging
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}
