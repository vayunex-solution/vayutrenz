import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { groupAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import { toast } from 'react-hot-toast';
import {
  FiUsers, FiLock, FiSettings, FiMoreHorizontal, FiTrash2,
  FiUserMinus, FiUserCheck, FiMessageSquare, FiSend, FiPaperclip,
  FiMapPin, FiShield, FiMic, FiMicOff
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // feed, chat, members, about, settings

  // Data States
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);

  // Input States
  const [newPostContent, setNewPostContent] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const chatBottomRef = useRef(null);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  useEffect(() => {
    if (activeTab === 'feed') loadPosts();
    if (activeTab === 'chat') {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Poll for chat
      return () => clearInterval(interval);
    }
    if (activeTab === 'members') loadMembers(); // usually loaded with group but good to refresh
    if (activeTab === 'settings') loadRequests();
  }, [activeTab, groupId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadGroupDetails = async () => {
    try {
      const { data } = await groupAPI.get(groupId);
      setGroup(data.group);
      setMembers(data.group.members || []);
    } catch (error) {
      console.error('Load group error:', error);
      toast.error('Failed to load group');
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const { data } = await groupAPI.getPosts(groupId);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Load posts error:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await groupAPI.getMessages(groupId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const loadMembers = async () => {
    // Already loaded in getGroup, but if we need separate endpoint later...
    // For now iterate group.members
  };

  const loadRequests = async () => {
    if (group?.userRole !== 'admin' && group?.userRole !== 'moderator') return;
    try {
      const { data } = await groupAPI.getRequests(groupId);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Load requests error:', error);
    }
  };

  // Actions
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const { data } = await groupAPI.createPost(groupId, { content: newPostContent });
      setPosts([data.post, ...posts]);
      setNewPostContent('');
      toast.success('Posted!');
    } catch (error) {
      toast.error('Failed to post');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await groupAPI.sendMessage(groupId, { content: newMessage });
      setMessages([...messages, data.message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send');
    }
  };

  const handleJoin = async () => {
    try {
      const { data } = await groupAPI.join(groupId);
      if (data.pending) toast.success('Request sent!');
      else {
        toast.success('Joined!');
        loadGroupDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return;
    try {
      await groupAPI.leave(groupId);
      toast.success('Left group');
      navigate('/communities');
    } catch (error) {
      toast.error('Failed to leave');
    }
  };

  // Admin Actions
  const handleKick = async (userId) => {
    if (!window.confirm('Kick this member?')) return;
    try {
      await groupAPI.kick(groupId, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
      toast.success('Member kicked');
    } catch (error) {
      toast.error('Failed to kick');
    }
  };

  const handleMute = async (userId) => {
    try {
      const { data } = await groupAPI.toggleMute(groupId, userId);
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isMuted: data.isMuted } : m));
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to update mute status');
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await groupAPI.handleRequest(groupId, requestId, action);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success(`Request ${action}ed`);
      if (action === 'approve') loadGroupDetails(); // Reload members
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete post?')) return;
    try {
      await groupAPI.deletePost(groupId, postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handlePinPost = async (postId) => {
    try {
      const { data } = await groupAPI.togglePinPost(groupId, postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: data.isPinned } : p));
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="spinner"></div></div></div>;
  if (!group) return <div className="app-layout"><Sidebar /><div className="main-content">Group not found</div></div>;

  const isAdmin = group.userRole === 'admin';
  const isMod = group.userRole === 'moderator' || isAdmin;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Banner */}
        <div className="group-banner" style={{
          height: '150px',
          background: group.imageUrl ? `url(${group.imageUrl})` : 'var(--accent-gradient)',
          backgroundSize: 'cover',
          borderRadius: '16px',
          position: 'relative',
          marginBottom: '60px'
        }}>
          <div className="group-avatar-large">
            {group.imageUrl ? null : (group.isPrivate ? <FiLock /> : <FiUsers />)}
          </div>
        </div>

        <div className="group-header-info">
          <div>
            <h1>{group.name}</h1>
            <p className="text-muted">{group.category} • {members.length} members • {group.isPrivate ? 'Private' : 'Public'}</p>
          </div>
          <div>
            {!group.isMember ? (
              <button className="btn btn-primary" onClick={handleJoin} disabled={group.hasPendingRequest}>
                {group.hasPendingRequest ? 'Request Pending' : 'Join Group'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handleLeave}>Leave</button>
                {isMod && (
                  <button className="btn btn-secondary" onClick={() => setActiveTab('settings')}>
                    <FiSettings />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="group-desc-text">{group.description}</p>

        {/* Navigation */}
        <div className="tabs group-tabs">
          {['feed', 'chat', 'members', 'about'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {isMod && (
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Admin
            </button>
          )}
        </div>

        {/* Content */}
        <div className="group-content">
          {activeTab === 'feed' && (
            <div className="feed-container">
              {group.isMember && (
                <div className="create-group-post card">
                  <textarea
                    placeholder="Share something with the group..."
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    rows={2}
                  />
                  <div className="post-actions-row">
                    <button className="btn btn-sm btn-primary" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                      Post
                    </button>
                  </div>
                </div>
              )}

              <div className="posts-list">
                {posts.length === 0 && <div className="empty-state">No posts yet.</div>}
                {posts.map(post => (
                  <div key={post.id} className="card group-post-card" style={{ borderLeft: post.isPinned ? '4px solid var(--accent-yellow)' : 'none' }}>
                    <div className="card-header">
                      <img src={getAvatarUrl(post.author)} className="avatar-sm" alt="" />
                      <div className="post-meta">
                        <b>{post.author.fullName}</b>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      {post.isPinned && <span className="pinned-badge"><FiMapPin /> Pinned</span>}

                      {(isMod || post.authorId === user.id) && (
                        <div className="post-options">
                          {isMod && <button onClick={() => handlePinPost(post.id)} title="Pin/Unpin"><FiMapPin /></button>}
                          <button onClick={() => handleDeletePost(post.id)} className="text-danger"><FiTrash2 /></button>
                        </div>
                      )}
                    </div>
                    <p className="post-content">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="group-chat-container card">
              {group.isMember ? (
                <>
                  <div className="chat-messages">
                    {messages.map(msg => (
                      <div key={msg.id} className={`chat-bubble ${msg.senderId === user.id ? 'mine' : 'theirs'}`}>
                        {msg.senderId !== user.id && <small className="chat-author">{msg.sender.fullName}</small>}
                        <p>{msg.content}</p>
                        <span className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                  <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Message group..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-icon">
                      <FiSend />
                    </button>
                  </form>
                </>
              ) : (
                <div className="empty-state">Join group to chat</div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="members-list card">
              {members.map(member => (
                <div key={member.id} className="member-row">
                  <div className="member-info">
                    <img src={getAvatarUrl(member.user)} className="avatar-sm" alt="" />
                    <div>
                      <b>{member.user.fullName}</b>
                      <div className="member-role text-muted">
                        {member.role} {member.isMuted && '• 🔇 Muted'}
                      </div>
                    </div>
                  </div>
                  {isMod && member.userId !== user.id && (
                    <div className="member-actions">
                      <button onClick={() => handleMute(member.userId)} title={member.isMuted ? "Unmute" : "Mute"}>
                        {member.isMuted ? <FiMic /> : <FiMicOff />}
                      </button>
                      <button onClick={() => handleKick(member.userId)} className="text-danger" title="Kick">
                        <FiUserMinus />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && isMod && (
            <div className="admin-tab">
              <h3>Join Requests ({requests.length})</h3>
              <div className="card">
                {requests.length === 0 ? <p className="text-muted p-3">No pending requests</p> : (
                  requests.map(req => (
                    <div key={req.id} className="request-row p-3 border-bottom">
                      <div className="member-info">
                        <img src={getAvatarUrl(req.user)} className="avatar-sm" alt="" />
                        <div>
                          <b>{req.user.fullName}</b>
                          <div className="text-muted">{req.user.college}</div>
                        </div>
                      </div>
                      <div className="actions">
                        <button className="btn btn-sm btn-primary" onClick={() => handleRequest(req.id, 'approve')}>Accept</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleRequest(req.id, 'reject')}>Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <h3 className="mt-4">Danger Zone</h3>
              <div className="card p-3">
                <p>Delete Group (Cannot be undone)</p>
                <button className="btn btn-danger disabled">Delete Group</button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="card p-4">
              <h3>About {group.name}</h3>
              <p>{group.description}</p>
              <div className="mt-3">
                <strong>Category:</strong> {group.category}<br />
                <strong>Privacy:</strong> {group.isPrivate ? 'Private' : 'Public'}<br />
                <strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
         .group-avatar-large {
            position: absolute;
            bottom: -40px;
            left: 30px;
            width: 100px;
            height: 100px;
            border-radius: 20px;
            background: var(--bg-card);
            border: 4px solid var(--bg-body);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-md);
         }
         .group-header-info {
            margin-top: 50px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
         }
         .group-tabs {
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
         }
         
         /* Feed */
         .create-group-post textarea {
            width: 100%;
            border: none;
            resize: none;
            background: transparent;
            color: var(--text-primary);
            outline: none;
         }
         .post-actions-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
            border-top: 1px solid var(--border-color);
            padding-top: 10px;
         }
         .group-post-card {
            padding: 20px;
            margin-bottom: 15px;
         }
         .card-header {
             display: flex;
             align-items: center;
             gap: 12px;
             margin-bottom: 15px;
         }
         .post-meta {
            flex: 1;
            display: flex;
            flex-direction: column;
            font-size: 0.9rem;
         }
         .post-meta span {
            color: var(--text-muted);
            font-size: 0.8rem;
         }
         .post-options button {
            background: none;
            border: none;
            padding: 5px;
            cursor: pointer;
            color: var(--text-muted);
         }
         
         /* Chat */
         .group-chat-container {
             height: 600px;
             display: flex;
             flex-direction: column;
             padding: 0;
             overflow: hidden;
         }
         .chat-messages {
             flex: 1;
             padding: 20px;
             overflow-y: auto;
             display: flex;
             flex-direction: column;
             gap: 10px;
             background: var(--bg-secondary);
         }
         .chat-bubble {
             max-width: 70%;
             padding: 10px 15px;
             border-radius: 12px;
             position: relative;
         }
         .chat-bubble.mine {
             align-self: flex-end;
             background: var(--primary-color);
             color: white;
             border-bottom-right-radius: 2px;
         }
         .chat-bubble.theirs {
             align-self: flex-start;
             background: var(--bg-card);
             border: 1px solid var(--border-color);
             border-bottom-left-radius: 2px;
         }
         .chat-author {
             display: block;
             font-size: 0.75rem;
             color: var(--text-muted);
             margin-bottom: 2px;
         }
         .chat-time {
             font-size: 0.7rem;
             opacity: 0.7;
             display: block;
             text-align: right;
             margin-top: 4px;
         }
         .chat-input-area {
             padding: 15px;
             background: var(--bg-card);
             border-top: 1px solid var(--border-color);
             display: flex;
             gap: 10px;
         }
         .chat-input-area input {
             flex: 1;
             padding: 10px 15px;
             border-radius: 20px;
             border: 1px solid var(--border-color);
             outline: none;
             background: var(--bg-secondary);
             color: var(--text-primary);
         }
         
         /* Members */
         .member-row {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding: 15px;
             border-bottom: 1px solid var(--border-color);
         }
         .member-info {
             display: flex;
             align-items: center;
             gap: 12px;
         }
         .member-actions button {
             margin-left: 10px;
             background: none;
             border: none;
             cursor: pointer;
             font-size: 1.1rem;
             opacity: 0.7;
         }
         .member-actions button:hover {
             opacity: 1;
         }
         
         .avatar-sm {
             width: 40px;
             height: 40px;
             border-radius: 50%;
             object-fit: cover;
         }
      `}</style>
    </div>
  );
}
