import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { marketplaceAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import { FiMessageCircle, FiCheckCircle, FiTrash2, FiTag, FiClock, FiShield } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const { data } = await marketplaceAPI.get(id);
      setListing(data.listing);
    } catch (error) {
      console.error('Load listing error:', error);
      toast.error('Item not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    navigate(`/messages?user=${listing.sellerId}`);
  };

  const handleMarkSold = async () => {
    try {
      await marketplaceAPI.update(id, { status: 'sold' });
      setListing(prev => ({ ...prev, status: 'sold' }));
      toast.success('Marked as Sold');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await marketplaceAPI.delete(id);
      toast.success('Listing deleted');
      navigate('/marketplace');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="spinner"></div></div></div>;
  if (!listing) return null;

  const isSeller = listing.sellerId === user.id;
  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <button className="back-link" onClick={() => navigate('/marketplace')}>&larr; Back to Marketplace</button>

        <div className="item-detail-grid">
          <div className="item-gallery card" style={{ padding: 0, overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={listing.title} style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <div className="text-muted">No Image Available</div>
            )}
          </div>

          <div className="item-info-col">
            <div className="card">
              <span className="category-badge">{listing.category}</span>
              {listing.status === 'sold' && <span className="sold-badge">SOLD</span>}

              <h1 className="item-title mt-2">{listing.title}</h1>
              <div className="item-price">₹{listing.price}</div>

              <div className="item-meta-row">
                <span><FiTag /> {listing.condition} Condition</span>
                <span><FiClock /> Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>

              <hr className="divider" />

              <h3>Description</h3>
              <p className="item-desc">{listing.description}</p>

              {listing.contactInfo && (
                <div className="contact-info-box">
                  <strong>Contact Info:</strong> {listing.contactInfo}
                </div>
              )}
            </div>

            <div className="card seller-card">
              <h3>Seller Information</h3>
              <div className="seller-row">
                <img src={getAvatarUrl(listing.seller)} className="avatar-md" alt="" />
                <div>
                  <strong>{listing.seller.fullName}</strong>
                  <div className="text-muted small">{listing.seller.college}</div>
                </div>
              </div>

              {!isSeller && (
                <button className="btn btn-primary w-100 mt-3" onClick={handleContactSeller}>
                  <FiMessageCircle /> Chat with Seller
                </button>
              )}

              {isSeller && (
                <div className="seller-actions mt-3">
                  {listing.status !== 'sold' && (
                    <button className="btn btn-success w-100 mb-2" onClick={handleMarkSold}>
                      <FiCheckCircle /> Mark as Sold
                    </button>
                  )}
                  <button className="btn btn-outline-danger w-100" onClick={handleDelete}>
                    <FiTrash2 /> Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
         .back-link {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 0.9rem;
         }
         .item-detail-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 24px;
         }
         @media (max-width: 768px) {
            .item-detail-grid {
               grid-template-columns: 1fr;
            }
         }
         .item-title {
            font-size: 1.8rem;
            margin-bottom: 5px;
         }
         .item-price {
            font-size: 1.5rem;
            color: var(--primary-color);
            font-weight: bold;
            margin-bottom: 15px;
         }
         .item-meta-row {
            display: flex;
            gap: 15px;
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 15px;
         }
         .item-meta-row span {
            display: flex;
            align-items: center;
            gap: 5px;
         }
         .category-badge {
            background: var(--bg-secondary);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
         }
         .sold-badge {
            background: var(--danger-color);
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 10px;
         }
         .contact-info-box {
            background: var(--bg-secondary);
            padding: 10px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 0.9rem;
         }
         .seller-row {
            display: flex;
            align-items: center;
            gap: 12px;
         }
         .avatar-md {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
         }
      `}</style>
    </div>
  );
}
