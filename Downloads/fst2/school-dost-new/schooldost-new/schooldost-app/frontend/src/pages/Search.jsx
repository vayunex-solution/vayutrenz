import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { searchAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import { FiSearch, FiUser, FiFileText, FiUsers, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ users: [], posts: [], groups: [], events: [], marketplace: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, users, posts, groups, events, marketplace

  useEffect(() => {
    if (initialQuery) {
       handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    // Update URL
    setSearchParams({ q: query });
    
    try {
      const { data } = await searchAPI.global(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'users', label: 'People', icon: <FiUser /> },
    { id: 'posts', label: 'Posts', icon: <FiFileText /> },
    { id: 'groups', label: 'Communities', icon: <FiUsers /> },
    { id: 'events', label: 'Events', icon: <FiCalendar /> },
    { id: 'marketplace', label: 'Market', icon: <FiShoppingBag /> },
  ];

  const renderUsers = () => (
     <div className="search-section">
        <h3>People</h3>
        {results.users && results.users.length > 0 ? (
           <div className="grid-layout">
              {results.users.map(u => (
                 <div key={u.id} className="card result-card" onClick={() => navigate(`/profile/${u.id}`)}>
                    <img src={getAvatarUrl(u)} className="avatar-md" alt="" />
                    <div className="result-info">
                       <strong>{u.fullName}</strong>
                       <small>@{u.username}</small>
                       {u.college && <small className="text-muted block">{u.college}</small>}
                    </div>
                 </div>
              ))}
           </div>
        ) : <p className="text-muted">No people found.</p>}
     </div>
  );

  const renderPosts = () => (
     <div className="search-section">
        <h3>Posts</h3>
        {results.posts && results.posts.length > 0 ? (
           <div className="list-layout">
              {results.posts.map(p => (
                 <div key={p.id} className="card result-row" onClick={() => navigate(`/post/${p.id}`)}>
                    <div className="result-content">
                       <strong>{p.author.fullName}</strong>: {p.content.substring(0, 100)}...
                    </div>
                 </div>
              ))}
           </div>
        ) : <p className="text-muted">No posts found.</p>}
     </div>
  );

  const renderGroups = () => (
     <div className="search-section">
        <h3>Communities</h3>
        {results.groups && results.groups.length > 0 ? (
           <div className="grid-layout">
              {results.groups.map(g => (
                 <div key={g.id} className="card result-card" onClick={() => navigate(`/groups/${g.id}`)}>
                    <div className="avatar-md placeholder-icon"><FiUsers /></div>
                    <div className="result-info">
                       <strong>{g.name}</strong>
                       <small>{g._count?.members || 0} members</small>
                    </div>
                 </div>
              ))}
           </div>
        ) : <p className="text-muted">No communities found.</p>}
     </div>
  );

  const renderEvents = () => (
     <div className="search-section">
        <h3>Events</h3>
        {results.events && results.events.length > 0 ? (
           <div className="grid-layout">
              {results.events.map(e => (
                 <div key={e.id} className="card result-card" onClick={() => navigate(`/events/${e.id}`)}>
                    <div className="avatar-md placeholder-icon"><FiCalendar /></div>
                    <div className="result-info">
                       <strong>{e.title}</strong>
                       <small>{new Date(e.dateTime).toLocaleDateString()}</small>
                    </div>
                 </div>
              ))}
           </div>
        ) : <p className="text-muted">No events found.</p>}
     </div>
  );

  const renderMarketplace = () => (
     <div className="search-section">
        <h3>Marketplace</h3>
        {results.marketplace && results.marketplace.length > 0 ? (
           <div className="grid-layout">
              {results.marketplace.map(m => (
                 <div key={m.id} className="card result-card" onClick={() => navigate(`/marketplace/${m.id}`)}>
                    <div className="avatar-md placeholder-icon"><FiShoppingBag /></div>
                    <div className="result-info">
                       <strong>{m.title}</strong>
                       <small>₹{m.price}</small>
                    </div>
                 </div>
              ))}
           </div>
        ) : <p className="text-muted">No items found.</p>}
     </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="search-header">
           <form onSubmit={handleSearch} className="global-search-bar">
              <FiSearch className="search-icon" />
              <input 
                 type="text" 
                 placeholder="Search for people, posts, groups..." 
                 value={query}
                 onChange={e => setQuery(e.target.value)}
                 autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                 {loading ? 'Searching...' : 'Search'}
              </button>
           </form>
        </div>

        <div className="tabs search-tabs">
           {tabs.map(tab => (
              <button 
                 key={tab.id} 
                 className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                 onClick={() => setActiveTab(tab.id)}
              >
                 {tab.icon} {tab.label}
              </button>
           ))}
        </div>

        <div className="search-results-container">
           {activeTab === 'all' && (
              <>
                 {renderUsers()}
                 {renderGroups()}
                 {renderEvents()}
                 {renderMarketplace()}
                 {renderPosts()}
              </>
           )}
           {activeTab === 'users' && renderUsers()}
           {activeTab === 'posts' && renderPosts()}
           {activeTab === 'groups' && renderGroups()}
           {activeTab === 'events' && renderEvents()}
           {activeTab === 'marketplace' && renderMarketplace()}
        </div>
      </main>

      <style>{`
         .search-header {
            margin-bottom: 20px;
         }
         .global-search-bar {
            display: flex;
            align-items: center;
            background: var(--bg-card);
            border-radius: 12px;
            padding: 5px 10px;
            border: 1px solid var(--border-color);
            gap: 10px;
         }
         .global-search-bar input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px;
            font-size: 1rem;
            color: var(--text-primary);
            outline: none;
         }
         .search-icon {
            font-size: 1.2rem;
            color: var(--text-muted);
            margin-left: 5px;
         }
         .search-tabs {
            margin-bottom: 20px;
            overflow-x: auto;
         }
         .search-section {
            margin-bottom: 30px;
         }
         .search-section h3 {
            margin-bottom: 15px;
            font-size: 1.1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
         }
         .grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
         }
         .list-layout {
            display: flex;
            flex-direction: column;
            gap: 10px;
         }
         .result-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            cursor: pointer;
            transition: background 0.2s;
         }
         .result-card:hover {
            background: var(--bg-secondary);
         }
         .avatar-md {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
         }
         .placeholder-icon {
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--text-muted);
         }
         .result-info {
            overflow: hidden;
         }
         .result-info strong {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
         }
         .result-row {
            padding: 15px;
            cursor: pointer;
         }
         .result-row:hover {
            background: var(--bg-secondary);
         }
      `}</style>
    </div>
  );
}
