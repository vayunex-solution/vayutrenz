// Communities Page - Groups
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { groupAPI } from '../services/api';
import { FiPlus, FiUsers, FiLock } from 'react-icons/fi';

export default function Communities() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        groupAPI.getAll(),
        groupAPI.getMy()
      ]);
      setGroups(allGroupsRes.data.groups || []);
      setMyGroups(myGroupsRes.data.groups || []);
    } catch (error) {
      console.error('Load groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;

    try {
      const { data } = await groupAPI.create(newGroup);
      setMyGroups(prev => [{ ...data.group, role: 'admin' }, ...prev]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', isPrivate: false });
    } catch (error) {
      console.error('Create group error:', error);
      alert('Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupAPI.join(groupId);
      const joinedGroup = groups.find(g => g.id === groupId);
      if (joinedGroup) {
        setMyGroups(prev => [{ ...joinedGroup, role: 'member' }, ...prev]);
        setGroups(prev => prev.filter(g => g.id !== groupId));
      }
    } catch (error) {
      console.error('Join group error:', error);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content" style={{ maxWidth: 'calc(100% - var(--sidebar-width))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Communities</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button 
            className={`tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        ) : activeTab === 'discover' ? (
          /* Discover Groups */
          groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <p>No groups to discover. Create one!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {groups.map(group => (
                <div key={group.id} className="widget-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {group.isPrivate ? <FiLock color="#000" /> : <FiUsers color="#000" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem' }}>{group.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {group._count?.members || 0} members
                      </p>
                    </div>
                  </div>
                  {group.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                      {group.description}
                    </p>
                  )}
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join Group
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* My Groups */
          myGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <p>You haven't joined any groups yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {myGroups.map(group => (
                <div key={group.id} className="widget-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {group.isPrivate ? <FiLock color="#000" /> : <FiUsers color="#000" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem' }}>{group.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {group.role === 'admin' ? '👑 Admin' : 'Member'} • {group._count?.members || 0} members
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    Open Group
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowCreateModal(false)}>
            <div style={{
              background: 'var(--bg-card)',
              padding: '30px',
              borderRadius: 'var(--border-radius)',
              width: '100%',
              maxWidth: '450px'
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '20px' }}>Create New Group</h2>
              
              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label className="form-label">Group Name *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input"
                    placeholder="What is this group about?"
                    rows={3}
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={newGroup.isPrivate}
                      onChange={e => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                    />
                    <span>Make this group private</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
