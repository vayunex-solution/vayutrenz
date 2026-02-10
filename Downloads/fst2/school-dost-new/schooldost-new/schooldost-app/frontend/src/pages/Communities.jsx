// Communities Page - Groups
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { groupAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { FiPlus, FiUsers, FiLock, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Communities() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPrivate: false,
    category: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reload when filters change
  useEffect(() => {
    if (activeTab === 'discover') {
      loadDiscoverGroups();
    }
  }, [debouncedSearch, selectedCategory, activeTab]);

  const loadInitialData = async () => {
    try {
      const [myGroupsRes, categoriesRes] = await Promise.all([
        groupAPI.getMy(),
        groupAPI.getCategories()
      ]);
      setMyGroups(myGroupsRes.data.groups || []);
      setCategories(categoriesRes.data.categories || []);
      loadDiscoverGroups();
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load communities');
    }
  };

  const loadDiscoverGroups = async () => {
    setLoading(true);
    try {
      const { data } = await groupAPI.getAll(searchQuery, selectedCategory);
      setGroups(data.groups || []);
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
      setNewGroup({ name: '', description: '', isPrivate: false, category: '' });
      toast.success('Group created successfully!');
      navigate(`/groups/${data.group.id}`);
    } catch (error) {
      console.error('Create group error:', error);
      toast.error('Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupAPI.join(groupId);
      const joinedGroup = groups.find(g => g.id === groupId);

      // If private, it's a request
      if (joinedGroup.isPrivate) {
        toast.success('Join request sent');
      } else {
        toast.success('Joined group!');
        if (joinedGroup) {
          setMyGroups(prev => [{ ...joinedGroup, role: 'member' }, ...prev]);
          // Optional: remove from discover or keep it
        }
      }
    } catch (error) {
      console.error('Join group error:', error);
      toast.error(error.response?.data?.error || 'Failed to join group');
    }
  };

  // Predefined categories for creation if none exist from backend
  const PREDEFINED_CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Tech', 'Art', 'Social', 'Gaming', 'Music'];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Communities</h1>
            <p className="subtitle">Find your tribe on campus</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Group
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="filters-bar" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="select-wrapper" style={{ position: 'relative' }}>
            <FiFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padLeft: '35px' }}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
              ))}
              {/* Fallback if no categories yet */}
              {categories.length === 0 && PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

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
          <div className="loading-spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid-layout">
            {(activeTab === 'discover' ? groups : myGroups).map(group => (
              <div key={group.id} className="card group-card">
                <div className="card-header">
                  <div
                    className="group-avatar-placeholder"
                    style={{
                      background: group.imageUrl ? `url(${group.imageUrl})` : 'var(--accent-primary)',
                      backgroundSize: 'cover'
                    }}
                  >
                    {!group.imageUrl && (group.isPrivate ? <FiLock /> : <FiUsers />)}
                  </div>
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <span className="badge-category">{group.category || 'General'}</span>
                  </div>
                </div>

                <p className="group-desc">{group.description || 'No description'}</p>

                <div className="group-stats">
                  <span>{group._count?.members || 0} members</span>
                  <span>•</span>
                  <span>{group.isPrivate ? 'Private' : 'Public'}</span>
                </div>

                {activeTab === 'my' ? (
                  <button
                    className="btn btn-secondary full-width"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    Open Group
                  </button>
                ) : (
                  <button
                    className="btn btn-primary full-width"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    {group.isPrivate ? 'Request to Join' : 'Join Group'}
                  </button>
                )}
              </div>
            ))}

            {(activeTab === 'discover' ? groups : myGroups).length === 0 && (
              <div className="empty-state">
                <p>No groups found. {activeTab === 'discover' ? 'Try different filters.' : 'Join some groups!'}</p>
              </div>
            )}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Create New Group</h2>
              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <ImageUpload 
                     label="Group Icon (Optional)" 
                     onUpload={(url) => setNewGroup(prev => ({...prev, imageUrl: url}))} 
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-input"
                    value={newGroup.category}
                    onChange={e => setNewGroup({ ...newGroup, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {PREDEFINED_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newGroup.isPrivate}
                    onChange={e => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                  />
                  <label htmlFor="isPrivate">Private Group (Requires approval to join)</label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Group</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .group-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .card-header {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }
        .group-avatar-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background-color: var(--accent-primary);
          flex-shrink: 0;
        }
        .group-info h3 {
          font-size: 1.1rem;
          margin: 0 0 5px 0;
        }
        .badge-category {
          font-size: 0.75rem;
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: 10px;
          color: var(--text-secondary);
        }
        .group-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .group-stats {
          font-size: 0.85rem;
          color: var(--text-muted);
          display: flex;
          gap: 8px;
        }
        .full-width {
          width: 100%;
          margin-top: auto;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: var(--bg-card);
          padding: 30px;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          border: 1px solid var(--border-color);
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }
        .modal-actions button {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
