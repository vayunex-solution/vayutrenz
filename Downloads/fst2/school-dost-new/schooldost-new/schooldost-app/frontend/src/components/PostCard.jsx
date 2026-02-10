import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiFlag, FiEdit2, FiBookmark, FiRepeat, FiCopy, FiSlash, FiCornerDownRight, FiThumbsUp, FiSend, FiX } from 'react-icons/fi';
import { postAPI, blockAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import PostCarousel from './PostCarousel';
import './PostCarousel.css';
import './PostCard.css';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [repostsCount, setRepostsCount] = useState(post._count?.reposts || 0);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showOptions, setShowOptions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Poll state
  const [pollData, setPollData] = useState(post.poll || null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingOption, setVotingOption] = useState(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = user?.id === post.authorId;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  // ===== ACTIONS =====
  const handleLike = async () => {
    try {
      if (!isLiked) {
        setShowBigHeart(true);
        setTimeout(() => setShowBigHeart(false), 1000);
      }
      const { data } = await postAPI.like(post.id);
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch { toast.error('Failed to like'); }
  };

  const handleSave = async () => {
    try {
      const { data } = await postAPI.save(post.id);
      setIsSaved(data.saved);
      toast.success(data.saved ? 'Post saved' : 'Post unsaved');
    } catch { toast.error('Failed to save'); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success('Link copied!');
    } catch { toast.error('Failed to copy'); }
    setShowShareMenu(false);
  };

  const handleRepost = async () => {
    try {
      const { data } = await postAPI.repost(post.id);
      setIsReposted(data.reposted);
      setRepostsCount(prev => data.reposted ? prev + 1 : prev - 1);
      toast.success(data.reposted ? 'Reposted!' : 'Repost removed');
    } catch { toast.error('Failed to repost'); }
    setShowShareMenu(false);
  };

  const handleDoubleTap = (e) => { e.preventDefault(); handleLike(); };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await postAPI.comment(post.id, comment, replyingTo?.id || null);
      if (replyingTo) {
        // Add reply to parent comment
        setComments(prev => prev.map(c =>
          c.id === replyingTo.id
            ? { ...c, replies: [...(c.replies || []), data.comment], _count: { ...c._count, replies: (c._count?.replies || 0) + 1 } }
            : c
        ));
      } else {
        setComments(prev => [data.comment, ...prev]);
      }
      setComment('');
      setReplyingTo(null);
      toast.success('Comment posted!');
    } catch { toast.error('Failed to comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postAPI.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const { data } = await postAPI.likeComment(commentId);
      setComments(prev => prev.map(c =>
        c.id === commentId
          ? { ...c, isLikedByMe: data.liked, _count: { ...c._count, likes: (c._count?.likes || 0) + (data.liked ? 1 : -1) } }
          : c
      ));
    } catch { toast.error('Failed to like comment'); }
  };

  const handleUpdate = async () => {
    try {
      if (editContent.trim() !== post.content) {
        await postAPI.update(post.id, editContent);
        post.content = editContent;
        if (onUpdate) onUpdate();
        toast.success('Post updated');
      }
      setIsEditing(false);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      try {
        await postAPI.delete(post.id);
        if (typeof onDelete === 'function') onDelete(post.id);
        else if (onUpdate) onUpdate();
        toast.success('Post deleted');
      } catch { toast.error('Failed to delete'); }
    }
    setShowOptions(false);
  };

  const handleBlockUser = async () => {
    if (window.confirm(`Block ${post.author?.fullName}?`)) {
      try {
        await blockAPI.block(post.author?.id);
        toast.success(`${post.author?.fullName} blocked`);
        if (onUpdate) onUpdate();
      } catch (e) { toast.error(e.response?.data?.error || 'Failed to block'); }
    }
    setShowOptions(false);
  };

  const handlePollVote = async (optionId) => {
    if (hasVoted || votingOption) return;
    setVotingOption(optionId);
    try {
      const { data } = await postAPI.votePoll(pollData.id, optionId);
      setPollData(data.poll);
      setHasVoted(true);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to vote'); }
    finally { setVotingOption(null); }
  };

  // ===== RENDER =====
  return (
    <div className="post-card">
      {/* Repost indicator */}
      {post.repostOf && (
        <div className="repost-indicator">
          <FiRepeat size={14} /> Reposted
        </div>
      )}

      <div className="post-header">
        <Link to={`/profile/${post.author?.id}`}>
          <img src={getAvatarUrl(post.author)} alt={post.author?.fullName} className="post-avatar" />
        </Link>
        <div className="post-author-info">
          <div className="post-author-row">
            <Link to={`/profile/${post.author?.id}`}>
              <span className="post-author-name">{post.author?.fullName}</span>
            </Link>
            {post.author?.batch && <span className="post-batch-tag">{post.author.batch}</span>}
          </div>
          <div className="post-meta">@{post.author?.username} • {formatDate(post.createdAt)}</div>
        </div>

        <div style={{ position: 'relative' }}>
          <button className="post-options" onClick={() => { setShowOptions(!showOptions); setShowShareMenu(false); }}>
            <FiMoreHorizontal size={18} />
          </button>
          {showOptions && (
            <div className="post-options-menu">
              {isOwner && (
                <>
                  <button className="post-option-item" onClick={() => { setIsEditing(true); setShowOptions(false); }}>
                    <FiEdit2 /> Edit
                  </button>
                  <button className="post-option-item delete" onClick={handleDelete}>
                    <FiTrash2 /> Delete
                  </button>
                </>
              )}
              {!isOwner && (
                <button className="post-option-item" onClick={handleBlockUser}>
                  <FiSlash /> Block {post.author?.fullName?.split(' ')[0]}
                </button>
              )}
              <button className="post-option-item" onClick={() => { toast('Report submitted!', { icon: '🚩' }); setShowOptions(false); }}>
                <FiFlag /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area with double tap */}
      <div onDoubleClick={handleDoubleTap} style={{ cursor: 'pointer', position: 'relative', userSelect: 'none' }}>
        <div className="post-content">
          {isEditing ? (
            <div style={{ marginBottom: '10px' }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--primary-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleUpdate} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          ) : (
            post.content.split(' ').map((word, index) =>
              word.startsWith('#') ? (
                <Link key={index} to={`/hashtag/${word.slice(1)}`} style={{ color: '#1d9bf0', marginRight: '4px', fontWeight: '500' }}>{word}</Link>
              ) : (
                <span key={index} style={{ marginRight: '4px' }}>{word}</span>
              )
            )
          )}
        </div>

        {/* Quote repost preview */}
        {post.repostOf && (
          <div className="quote-preview">
            <div className="quote-header">
              <img src={getAvatarUrl(post.repostOf.author)} alt="" className="quote-avatar" />
              <span className="quote-name">{post.repostOf.author?.fullName}</span>
              <span className="quote-time">• {formatDate(post.repostOf.createdAt)}</span>
            </div>
            <p className="quote-content">{post.repostOf.content?.substring(0, 200)}{post.repostOf.content?.length > 200 ? '...' : ''}</p>
          </div>
        )}

        {post.media && post.media.length > 0 && <PostCarousel media={post.media} />}

        {/* Poll */}
        {pollData && (
          <div className="poll-display">
            <div className="poll-question">📊 {pollData.question}</div>
            <div className="poll-options-list">
              {pollData.options.map((option) => {
                const totalVotes = pollData._count?.votes || 0;
                const optionVotes = option._count?.votes || 0;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                return (
                  <button key={option.id} className={`poll-option-btn ${hasVoted ? 'voted' : ''} ${votingOption === option.id ? 'voting' : ''}`}
                    onClick={() => handlePollVote(option.id)} disabled={hasVoted || votingOption}>
                    <div className="poll-option-content">
                      <span className="poll-option-text">{option.text}</span>
                      {hasVoted && <span className="poll-option-percent">{percentage}%</span>}
                    </div>
                    {hasVoted && <div className="poll-option-bar" style={{ width: `${percentage}%` }} />}
                  </button>
                );
              })}
            </div>
            <div className="poll-total-votes">{pollData._count?.votes || 0} votes</div>
          </div>
        )}

        {showBigHeart && (
          <div className="big-heart-overlay"><FiHeart /></div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="post-actions">
        <button className={`post-action ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <FiHeart className={`heart-icon ${isLiked ? 'animate-like' : ''}`} style={{ fill: isLiked ? 'currentColor' : 'none' }} />
          <span>{likesCount}</span>
        </button>

        <button className="post-action" onClick={() => setShowComments(!showComments)}>
          <FiMessageCircle />
          <span>{post._count?.comments || comments.length}</span>
        </button>

        {/* Share with dropdown */}
        <div style={{ position: 'relative' }}>
          <button className={`post-action ${isReposted ? 'reposted' : ''}`} onClick={() => { setShowShareMenu(!showShareMenu); setShowOptions(false); }}>
            <FiRepeat style={{ color: isReposted ? '#22c55e' : undefined }} />
            <span>{repostsCount || ''}</span>
          </button>
          {showShareMenu && (
            <div className="share-menu">
              <button className="share-menu-item" onClick={handleRepost}>
                <FiRepeat /> {isReposted ? 'Undo Repost' : 'Repost'}
              </button>
              <button className="share-menu-item" onClick={handleCopyLink}>
                <FiCopy /> Copy Link
              </button>
            </div>
          )}
        </div>

        <button className={`post-action ${isSaved ? 'saved' : ''}`} onClick={handleSave} style={{ marginLeft: 'auto' }}>
          <FiBookmark style={{ fill: isSaved ? 'currentColor' : 'none' }} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Reply indicator */}
          {replyingTo && (
            <div className="replying-to">
              <FiCornerDownRight size={14} />
              <span>Replying to <strong>{replyingTo.user?.fullName}</strong></span>
              <button onClick={() => setReplyingTo(null)}><FiX size={14} /></button>
            </div>
          )}

          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              className="comment-input"
              placeholder={replyingTo ? `Reply to ${replyingTo.user?.fullName}...` : "Add a comment..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="post-comment-btn" disabled={!comment.trim()}>
              <FiSend size={16} />
            </button>
          </form>

          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <img src={getAvatarUrl(c.user)} alt={c.user?.fullName} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header-row">
                    <span className="comment-author">{c.user?.fullName}</span>
                    <span className="comment-time">{formatDate(c.createdAt)}</span>
                    {c.isEdited && <span className="comment-edited">(edited)</span>}
                  </div>
                  <p className="comment-text">{c.content}</p>
                  <div className="comment-actions-row">
                    <button className={`comment-action-btn ${c.isLikedByMe ? 'liked' : ''}`} onClick={() => handleLikeComment(c.id)}>
                      <FiThumbsUp size={13} /> {c._count?.likes || ''}
                    </button>
                    <button className="comment-action-btn" onClick={() => { setReplyingTo(c); setComment(''); }}>
                      <FiCornerDownRight size={13} /> Reply
                    </button>
                    {c.userId === user?.id && (
                      <button className="comment-action-btn delete" onClick={() => handleDeleteComment(c.id)}>
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Nested replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="comment-replies">
                      {c.replies.map(reply => (
                        <div key={reply.id} className="comment-item reply">
                          <img src={getAvatarUrl(reply.user)} alt="" className="comment-avatar small" />
                          <div className="comment-content">
                            <div className="comment-header-row">
                              <span className="comment-author">{reply.user?.fullName}</span>
                              <span className="comment-time">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="comment-text">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
