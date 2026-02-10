// Messages Page - Enhanced Professional Chat Interface
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { messageAPI, userAPI, uploadAPI } from '../services/api';
import {
  getSocket,
  startTyping,
  stopTyping
} from '../services/socket';
import { FiSend, FiSearch, FiMoreVertical, FiImage, FiSmile, FiArrowLeft, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { IoCheckmarkDone, IoCheckmark } from 'react-icons/io5';
import toast from 'react-hot-toast';
import './Messages.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getAvatarUrl = (user) => {
  if (!user) return 'https://api.dicebear.com/8.x/initials/svg?seed=User';
  if (user.avatarUrl) {
    return user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE}${user.avatarUrl}`;
  }
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.fullName || 'User')}&backgroundColor=facc15&textColor=000`;
};

const formatLastSeen = (date) => {
  if (!date) return 'Offline';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMsg, setEditingMsg] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = getSocket();

  // Load conversations on mount
  useEffect(() => { loadConversations(); }, []);

  // Handle URL param selection
  useEffect(() => {
    if (userId) {
      const existingConvo = conversations.find(c => c.user.id === userId);
      if (existingConvo) {
        if (selectedUser?.id !== userId) selectConversation(existingConvo);
      } else {
        loadNewUser(userId);
      }
    }
  }, [userId, conversations]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (selectedUser && message.senderId === selectedUser.id) {
        setMessages(prev => [...prev, message]);
        // Send read receipt
        socket.emit('message:read', { senderId: message.senderId });
        updateConversationOnReceive(message);
      } else {
        updateConversationOnReceive(message, true);
      }
    };

    const handleTypingStart = ({ userId: typerId }) => {
      setTypingUsers(prev => new Set(prev).add(typerId));
    };

    const handleTypingStop = ({ userId: typerId }) => {
      setTypingUsers(prev => { const next = new Set(prev); next.delete(typerId); return next; });
    };

    const handleUserOnline = ({ userId: onlineId }) => {
      setConversations(prev => prev.map(c =>
        c.user.id === onlineId ? { ...c, user: { ...c.user, isOnline: true } } : c
      ));
      if (selectedUser?.id === onlineId) setSelectedUser(prev => ({ ...prev, isOnline: true }));
    };

    const handleUserOffline = ({ userId: offlineId }) => {
      setConversations(prev => prev.map(c =>
        c.user.id === offlineId ? { ...c, user: { ...c.user, isOnline: false, lastSeen: new Date().toISOString() } } : c
      ));
      if (selectedUser?.id === offlineId) setSelectedUser(prev => ({ ...prev, isOnline: false, lastSeen: new Date().toISOString() }));
    };

    // Read receipts
    const handleReadReceipt = ({ readBy }) => {
      if (selectedUser?.id === readBy) {
        setMessages(prev => prev.map(m => m.senderId === currentUser.id ? { ...m, isRead: true } : m));
      }
    };

    // Real-time delete/edit
    const handleDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m));
    };

    const handleEdited = (updatedMsg) => {
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, content: updatedMsg.content, isEdited: true } : m));
    };

    socket.on('message:receive', handleReceive);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('message:read', handleReadReceipt);
    socket.on('message:deleted', handleDeleted);
    socket.on('message:edited', handleEdited);

    return () => {
      socket.off('message:receive', handleReceive);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('message:read', handleReadReceipt);
      socket.off('message:deleted', handleDeleted);
      socket.off('message:edited', handleEdited);
    };
  }, [selectedUser, conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, selectedUser]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const loadConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally { setLoading(false); }
  };

  const loadNewUser = async (id) => {
    try {
      const { data } = await userAPI.getProfile(id);
      const newConvo = { user: data.user, unreadCount: 0, lastMessage: null };
      setConversations(prev => {
        if (prev.find(c => c.user.id === id)) return prev;
        return [newConvo, ...prev];
      });
      setSelectedUser(data.user);
      loadMessages(id);
    } catch (err) { console.error("Failed to load user for chat", err); }
  };

  const loadMessages = async (targetUserId) => {
    try {
      const { data } = await messageAPI.getMessages(targetUserId);
      setMessages(data.messages || []);
      // Send read receipt
      if (socket) socket.emit('message:read', { senderId: targetUserId });
    } catch (error) { console.error('Load messages error:', error); }
  };

  const selectConversation = (convo) => {
    setSelectedUser(convo.user);
    loadMessages(convo.user.id);
    navigate(`/messages/${convo.user.id}`);
    setShowChatOnMobile(true);
    setConversations(prev => prev.map(c =>
      c.user.id === convo.user.id ? { ...c, unreadCount: 0 } : c
    ));
    setContextMenu(null);
    setEditingMsg(null);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setSelectedUser(null);
    navigate('/messages');
  };

  const updateConversationOnReceive = (message, incrementUnread = false) => {
    setConversations(prev => {
      const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
      const existingIndex = prev.findIndex(c => c.user.id === otherUserId);
      let updatedConvos = [...prev];
      if (existingIndex > -1) {
        const convo = updatedConvos[existingIndex];
        updatedConvos.splice(existingIndex, 1);
        updatedConvos.unshift({
          ...convo,
          lastMessage: message,
          unreadCount: incrementUnread ? convo.unreadCount + 1 : convo.unreadCount
        });
      } else {
        if (incrementUnread) loadConversations();
      }
      return updatedConvos;
    });
  };

  // Image upload
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only images are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }

    setImagePreview(URL.createObjectURL(file));

    try {
      const { data: uploadData } = await uploadAPI.image(file);
      const mediaUrl = uploadData.url;

      const { data } = await messageAPI.send(selectedUser.id, '', mediaUrl, 'image');
      setMessages(prev => [...prev, data.message]);
      updateConversationOnReceive(data.message);
      setImagePreview(null);
      toast.success('Image sent!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to send image');
      setImagePreview(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    setNewMessage('');
    stopTyping(selectedUser.id);

    // Optimistic
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMsg]);
    updateConversationOnReceive(tempMsg);

    try {
      const { data } = await messageAPI.send(selectedUser.id, content);
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
      updateConversationOnReceive(data.message);
    } catch (error) {
      console.error('Send failed', error);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(content);
      toast.error('Failed to send');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await messageAPI.delete(msgId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m));
      toast.success('Message deleted');
    } catch { toast.error('Failed to delete'); }
    setContextMenu(null);
  };

  const handleStartEdit = (msg) => {
    setEditingMsg(msg.id);
    setEditContent(msg.content);
    setContextMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const { data } = await messageAPI.edit(editingMsg, editContent.trim());
      setMessages(prev => prev.map(m => m.id === editingMsg ? { ...m, content: data.message.content, isEdited: true } : m));
      toast.success('Message edited');
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to edit'); }
    setEditingMsg(null);
    setEditContent('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedUser) {
      if (!isTyping) { setIsTyping(true); startTyping(selectedUser.id); }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(selectedUser.id);
      }, 2000);
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    if (msg.senderId !== currentUser.id || msg.isDeleted) return;
    setContextMenu({ x: e.clientX, y: e.clientY, msg });
  };

  // Filter conversations by search
  const filteredConvos = searchQuery.trim()
    ? conversations.filter(c => c.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <div className="app-layout messages-page">
      <Sidebar />

      <main className="main-content messages-container" style={{ maxWidth: 'none', margin: '0 0 0 var(--sidebar-width)', padding: 0, height: '100vh', display: 'flex' }}>

        {/* LEFT: Conversations List */}
        <div className={`conversation-list ${showChatOnMobile ? 'hidden' : ''}`}>
          <div className="conversation-list-header">
            <h2>Messages</h2>
            <div className="search-box" style={{ marginBottom: 0, padding: '10px 14px' }}>
              <FiSearch />
              <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="conversation-list-content">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner"></div></div>
            ) : filteredConvos.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>{searchQuery ? 'No results' : 'No conversations yet.'}</p>
                {!searchQuery && <p style={{ fontSize: '0.8rem' }}>Visit a profile to start chatting!</p>}
              </div>
            ) : (
              filteredConvos.map(convo => (
                <div key={convo.user.id} onClick={() => selectConversation(convo)} className="conversation-item"
                  style={{
                    padding: '16px 20px', display: 'flex', gap: '12px', cursor: 'pointer',
                    background: selectedUser?.id === convo.user.id ? 'var(--bg-input)' : 'transparent',
                    borderBottom: '1px solid var(--border-dark)', transition: '0.2s'
                  }}
                  onMouseEnter={(e) => { if (selectedUser?.id !== convo.user.id) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                  onMouseLeave={(e) => { if (selectedUser?.id !== convo.user.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={getAvatarUrl(convo.user)} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    {convo.user.isOnline && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%',
                        border: '2px solid var(--bg-card)'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-white)' }}>{convo.user.fullName}</span>
                      {convo.lastMessage && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{
                        fontSize: '0.85rem',
                        color: convo.unreadCount > 0 ? 'var(--text-white)' : 'var(--text-muted)',
                        fontWeight: convo.unreadCount > 0 ? '600' : '400',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px'
                      }}>
                        {typingUsers.has(convo.user.id) ? (
                          <span style={{ color: 'var(--accent-yellow)' }}>Typing...</span>
                        ) : convo.lastMessage?.mediaUrl ? (
                          <span>📷 Photo</span>
                        ) : (
                          convo.lastMessage?.content || 'Started a chat'
                        )}
                      </p>
                      {convo.unreadCount > 0 && (
                        <span style={{
                          background: 'var(--accent-yellow)', color: '#000',
                          fontSize: '0.75rem', fontWeight: 'bold',
                          padding: '2px 8px', borderRadius: '10px', minWidth: '20px', textAlign: 'center'
                        }}>
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Chat Window */}
        <div className={`chat-window ${showChatOnMobile ? 'active' : ''}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <button className="mobile-back-btn" onClick={handleBackToList}><FiArrowLeft size={22} /></button>
                  <img src={getAvatarUrl(selectedUser)} className="chat-header-avatar" alt="" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-white)' }}>{selectedUser.fullName}</h3>
                    <p style={{ fontSize: '0.8rem', color: selectedUser.isOnline ? '#22c55e' : 'var(--text-muted)' }}>
                      {typingUsers.has(selectedUser.id) ? (
                        <span className="typing-animation">typing<span>.</span><span>.</span><span>.</span></span>
                      ) : selectedUser.isOnline ? 'Online' : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
                    </p>
                  </div>
                </div>
                <button style={{ padding: '8px', color: 'var(--text-gray)' }}><FiMoreVertical size={20} /></button>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-upload-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button onClick={() => setImagePreview(null)}><FiX /></button>
                  <div className="upload-progress">Sending...</div>
                </div>
              )}

              {/* Messages Area */}
              <div className="chat-messages-area">
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === currentUser.id;
                  const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                  return (
                    <div key={msg.id || index}
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      style={{
                        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                        marginTop: showAvatar ? '8px' : '2px', gap: '8px'
                      }}>
                      {!isMine && (
                        <div style={{ width: '32px' }}>
                          {showAvatar && <img src={getAvatarUrl(selectedUser)} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />}
                        </div>
                      )}

                      <div style={{ maxWidth: '65%' }}>
                        {/* Editing inline */}
                        {editingMsg === msg.id ? (
                          <div className="edit-message-inline">
                            <input value={editContent} onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingMsg(null); }}
                              autoFocus />
                            <button onClick={handleSaveEdit}><FiCheck size={16} /></button>
                            <button onClick={() => setEditingMsg(null)}><FiX size={16} /></button>
                          </div>
                        ) : (
                          <div style={{
                            padding: msg.mediaUrl ? '4px' : '12px 16px',
                            borderRadius: '18px',
                            background: msg.isDeleted ? 'transparent' : (isMine ? 'var(--accent-yellow)' : 'var(--bg-input)'),
                            color: msg.isDeleted ? 'var(--text-muted)' : (isMine ? '#000' : 'var(--text-white)'),
                            fontSize: '0.95rem', lineHeight: '1.5', position: 'relative',
                            fontStyle: msg.isDeleted ? 'italic' : 'normal',
                            border: msg.isDeleted ? '1px solid var(--border-dark)' : 'none',
                            borderTopRightRadius: isMine ? '4px' : '18px',
                            borderTopLeftRadius: !isMine ? '4px' : '18px',
                            boxShadow: isMine && !msg.isDeleted ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                          }}>
                            {msg.mediaUrl && !msg.isDeleted && (
                              <img src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_BASE}${msg.mediaUrl}`}
                                alt="Shared" className="chat-media-image" />
                            )}
                            {msg.content && <div style={{ padding: msg.mediaUrl ? '8px 12px' : 0 }}>
                              {msg.isDeleted ? '🚫 This message was deleted' : msg.content}
                            </div>}
                            <div style={{
                              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px',
                              marginTop: '4px', fontSize: '0.7rem', padding: msg.mediaUrl ? '0 8px 4px' : 0,
                              color: isMine ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)'
                            }}>
                              {msg.isEdited && <span style={{ marginRight: '4px' }}>edited</span>}
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMine && !msg.isDeleted && (
                                msg.isRead ? <IoCheckmarkDone size={14} color="#2563eb" /> : <IoCheckmark size={14} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator bubble */}
                {typingUsers.has(selectedUser.id) && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <img src={getAvatarUrl(selectedUser)} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                    <div className="typing-bubble">
                      <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Context Menu */}
              {contextMenu && (
                <div className="msg-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                  <button onClick={() => handleStartEdit(contextMenu.msg)}><FiEdit2 size={14} /> Edit</button>
                  <button className="delete" onClick={() => handleDeleteMessage(contextMenu.msg.id)}><FiTrash2 size={14} /> Delete</button>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="chat-input-area">
                <div className="chat-input-wrapper">
                  <button type="button" style={{ color: 'var(--text-muted)', padding: '4px', background: 'transparent', border: 'none' }}><FiSmile size={22} /></button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    style={{ color: 'var(--text-muted)', padding: '4px', background: 'transparent', border: 'none' }}>
                    <FiImage size={22} />
                  </button>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                  <input type="text" value={newMessage} onChange={handleTyping} placeholder="Type a message..." />
                  <button type="submit" disabled={!newMessage.trim()}
                    style={{
                      background: newMessage.trim() ? 'var(--accent-yellow)' : 'transparent',
                      color: newMessage.trim() ? '#000' : 'var(--text-muted)',
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default'
                    }}>
                    <FiSend size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="chat-empty-state">
              <div style={{ width: '80px', height: '80px', background: 'var(--bg-input)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <FiSend size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-white)' }}>Your Messages</h2>
              <p>Send private photos and messages to a friend or group.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
