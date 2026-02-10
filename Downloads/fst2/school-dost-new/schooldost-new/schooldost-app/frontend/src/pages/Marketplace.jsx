import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { marketplaceAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { FiPlus, FiFilter, FiTag, FiDollarSign, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Marketplace() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse'); // browse, selling

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        condition: '',
        sort: 'newest'
    });

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '', description: '', price: '',
        category: '', condition: 'good',
        images: [], contactInfo: ''
    });

    const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
    const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Other'];

    useEffect(() => {
        loadData();
    }, [activeTab, filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'browse') {
                const { data } = await marketplaceAPI.getAll(filters);
                setListings(data.listings || []);
            } else {
                const { data } = await marketplaceAPI.getMy();
                setMyListings(data.listings || []);
            }
        } catch (error) {
            console.error('Load market error:', error);
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            const itemData = { ...newItem, images: newItem.images.length ? newItem.images : null };
            const { data } = await marketplaceAPI.create(itemData);
            toast.success('Listing created!');
            setShowCreateModal(false);
            setNewItem({ title: '', description: '', price: '', category: '', condition: 'good', images: [], contactInfo: '' });
            navigate(`/marketplace/${data.listing.id}`);
        } catch (error) {
            console.error('Create item error:', error);
            toast.error('Failed to create listing');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Campus Marketplace</h1>
                        <p className="subtitle">Buy and sell with fellow students</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <FiPlus /> Sell Item
                    </button>
                </div>

                <div className="tabs">
                    <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>Browse Items</button>
                    <button className={`tab ${activeTab === 'selling' ? 'active' : ''}`} onClick={() => setActiveTab('selling')}>My Listings</button>
                </div>

                {activeTab === 'browse' && (
                    <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select className="form-input" style={{ width: 'auto' }} value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select className="form-input" style={{ width: 'auto' }} value={filters.condition} onChange={e => handleFilterChange('condition', e.target.value)}>
                            <option value="">Any Condition</option>
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select className="form-input" style={{ width: 'auto' }} value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input type="number" className="form-input" placeholder="Min ₹" style={{ width: '80px' }}
                                value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} />
                            <span>-</span>
                            <input type="number" className="form-input" placeholder="Max ₹" style={{ width: '80px' }}
                                value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-spinner-container"><div className="spinner"></div></div>
                ) : (
                    <div className="grid-layout">
                        {activeTab === 'browse' ? (
                            listings.length === 0 ? <p className="text-muted text-center col-span-3">No items found.</p> :
                                listings.map(item => <ItemCard key={item.id} item={item} onClick={() => navigate(`/marketplace/${item.id}`)} />)
                        ) : (
                            myListings.length === 0 ? <p className="text-muted text-center col-span-3">You haven't listed anything yet.</p> :
                                myListings.map(item => <ItemCard key={item.id} item={item} onClick={() => navigate(`/marketplace/${item.id}`)} />)
                        )}
                    </div>
                )}

                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>Sell an Item</h2>
                            <form onSubmit={handleCreateItem}>
                                <div className="form-group">
                                    <label>Item Title</label>
                                    <input type="text" className="form-input" required
                                        value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                                </div>

                                <div className="row" style={{ display: 'flex', gap: '15px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Price (₹)</label>
                                        <input type="number" className="form-input" required min="0"
                                            value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select className="form-input" required
                                            value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                            <option value="">Select...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Condition</label>
                                    <select className="form-input" required
                                        value={newItem.condition} onChange={e => setNewItem({ ...newItem, condition: e.target.value })}>
                                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <ImageUpload 
                                       label="Item Image (Optional)" 
                                       onUpload={(url) => setNewItem(prev => ({...prev, images: url ? [url] : []}))} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="form-input" rows={3} required
                                        value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Contact Info (Phone/Email)</label>
                                    <input type="text" className="form-input" placeholder="How should buyers contact you?"
                                        value={newItem.contactInfo} onChange={e => setNewItem({ ...newItem, contactInfo: e.target.value })} />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">List Item</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
         .grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
         }
         .item-card {
            background: var(--bg-card);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid var(--border-color);
         }
         .item-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
         }
         .item-image {
            height: 180px;
            background: var(--bg-secondary);
            background-size: cover;
            background-position: center;
            position: relative;
         }
         .price-tag {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: bold;
         }
         .item-info {
            padding: 15px;
         }
         .item-title {
            font-weight: bold;
            margin-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
         }
         .item-meta {
            font-size: 0.85rem;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
         }
         .condition-badge {
             font-size: 0.75rem;
             background: var(--bg-secondary);
             padding: 2px 6px;
             border-radius: 4px;
         }
      `}</style>
        </div>
    );
}

function ItemCard({ item, onClick }) {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;
    return (
        <div className="item-card" onClick={onClick}>
            <div className="item-image" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!imageUrl && <FiShoppingBag size={40} color="var(--text-muted)" opacity={0.5} />}
                <div className="price-tag">₹{item.price}</div>
            </div>
            <div className="item-info">
                <div className="item-title">{item.title}</div>
                <div className="item-meta">
                    <span>{item.category}</span>
                    <span className="condition-badge">{item.condition}</span>
                </div>
            </div>
        </div>
    );
}
