// Post Card Component - Reference Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import { postAPI } from '../services/api';

export default function PostCard({ post, onUpdate }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      const { data } = await postAPI.like(post.id);
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const { data } = await postAPI.comment(post.id, comment);
      setComments(prev => [data.comment, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?.id}`}>
          <img 
            src={post.author?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${post.author?.fullName}&backgroundColor=facc15&textColor=000`} 
            alt={post.author?.fullName}
            className="post-avatar"
          />
        </Link>
        <div className="post-author-info">
          <div className="post-author-row">
            <Link to={`/profile/${post.author?.id}`}>
              <span className="post-author-name">{post.author?.fullName}</span>
            </Link>
            {post.author?.batch && (
              <span className="post-batch-tag">{post.author.batch}</span>
            )}
          </div>
          <div className="post-meta">
            @{post.author?.username} • {formatDate(post.createdAt)}
          </div>
        </div>
        <button className="post-options">
          <FiMoreHorizontal size={18} />
        </button>
      </div>

      <div className="post-content">
        {post.content}
      </div>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post" className="post-image" />
      )}

      <div className="post-actions">
        <button 
          className={`post-action ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
          <span>{likesCount}</span>
        </button>
        
        <button 
          className="post-action"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageCircle />
          <span>{post._count?.comments || comments.length}</span>
        </button>
        
        <button className="post-action">
          <FiShare2 />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-dark)' }}>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ flex: 1, padding: '10px 14px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Post
            </button>
          </form>
          
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <img 
                src={c.user?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${c.user?.fullName}&backgroundColor=facc15&textColor=000`}
                alt={c.user?.fullName}
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              />
              <div>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.user?.fullName}</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '2px' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
