import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlistStore()
  const addToCart = useCartStore(state => state.addToCart)
  
  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`
  
  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <Heart className="empty-state-icon" />
          <h2 className="empty-state-title">Your wishlist is empty</h2>
          <p className="empty-state-text">Save items you love by clicking the heart icon.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Explore Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="page-container">
      <h1 className="page-title">My Wishlist ({items.length})</h1>
      
      <div className="product-grid">
        {items.map((item) => {
          const product = item.product || item
          const discount = product.originalPrice && product.price 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : product.discount || 0
            
          return (
            <div 
              key={item.product_id || product.id}
              className="product-card"
              style={{ position: 'relative' }}
            >
              <Link to={`/product/${product.id}`}>
                <div className="product-card-image">
                  <img 
                    src={product.image || product.primary_image || '/placeholder.jpg'}
                    alt={product.name}
                  />
                  {product.rating > 0 && (
                    <div className="product-card-rating">★ {product.rating}</div>
                  )}
                </div>
              </Link>
              
              <div className="product-card-content">
                <Link to={`/product/${product.id}`}>
                  <div className="product-card-brand">
                    <h3>{product.businessName || product.brand || 'Brand'}</h3>
                  </div>
                  <p className="product-card-name">{product.name}</p>
                </Link>
                
                <div className="product-card-price">
                  <span className="product-card-price-current">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="product-card-price-original">{formatPrice(product.originalPrice)}</span>
                      <span className="product-card-discount">{discount}%</span>
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeFromWishlist(product.id)}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Wishlist
