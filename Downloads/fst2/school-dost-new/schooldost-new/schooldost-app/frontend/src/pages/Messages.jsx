// Messages Page - Direct Messaging
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import { getSocket, sendMessage as socketSendMessage, onMessageReceive } from '../services/socket';
import { FiSend, FiSearch } from 'react-icons/fi';

export default function Messages() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      loadMessages(userId);
    }
  }, [userId]);

  useEffect(() => {
    // Setup real-time message listener
    const socket = getSocket();
    if (socket) {
      onMessageReceive((message) => {
        if (selectedUser && message.senderId === selectedUser.id) {
          setMessages(prev => [...prev, message]);
        }
        // Update conversations list
        loadConversations();
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (targetUserId) => {
    try {
      const { data } = await messageAPI.getMessages(targetUserId);
      setMessages(data.messages || []);
      
      // Find user info from conversations
      const convo = conversations.find(c => c.user.id === targetUserId);
      if (convo) {
        setSelectedUser(convo.user);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data } = await messageAPI.send(selectedUser.id, content);
      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? data.message : m
      ));
      
      // Also emit via socket for real-time
      socketSendMessage(selectedUser.id, content);
    } catch (error) {
      console.error('Send message error:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(content);
    }
  };

  const selectConversation = (convo) => {
    setSelectedUser(convo.user);
    loadMessages(convo.user.id);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content" style={{ 
        maxWidth: 'calc(100% - var(--sidebar-width))',
        display: 'flex',
        gap: '0',
        padding: '0',
        height: '100vh'
      }}>
        {/* Conversations List */}
        <div style={{
          width: '320px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px' }}>
            <h2>Messages</h2>
            <div className="search-box" style={{ marginTop: '15px' }}>
              <FiSearch />
              <input type="text" placeholder="Search conversations" />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map(convo => (
                <div 
                  key={convo.user.id}
                  onClick={() => selectConversation(convo)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '15px 20px',
                    cursor: 'pointer',
                    background: selectedUser?.id === convo.user.id ? 'var(--bg-hover)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <img 
                    src={convo.user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${convo.user.fullName}`}
                    alt={convo.user.fullName}
                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600' }}>{convo.user.fullName}</div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {convo.lastMessage?.content}
                    </div>
                  </div>
                  {convo.unreadCount > 0 && (
                    <span style={{
                      background: 'var(--accent-primary)',
                      color: '#000',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img 
                  src={selectedUser.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.fullName}`}
                  alt={selectedUser.fullName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>{selectedUser.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: selectedUser.isOnline ? 'var(--success)' : 'var(--text-muted)' }}>
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                      marginBottom: '15px'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      background: msg.senderId === currentUser.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: msg.senderId === currentUser.id ? '#000' : 'var(--text-primary)'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form 
                onSubmit={handleSendMessage}
                style={{
                  padding: '15px 20px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '10px'
                }}
              >
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newMessage.trim()}
                >
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3>Select a conversation</h3>
                <p>Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
