import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'

const ProductCard = ({ product, showWishlist = true }) => {
  const addToCart = useCartStore(state => state.addToCart)
  const { toggleWishlist, isInWishlist } = useWishlistStore()

  const inWishlist = isInWishlist(product.id || product._id)

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  // Format price
  const formatPrice = (price) => {
    if (!price) return '₹0'
    return `₹${Number(price).toLocaleString('en-IN')}`
  }

  // Calculate discount
  const discount = product.discount ||
    (product.originalPrice && product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0)

  return (
    <Link
      to={`/product/${product.id || product._id}`}
      className="product-card"
    >
      {/* Image */}
      <div className="product-card-image">
        <img
          src={product.image || product.primary_image || '/placeholder.jpg'}
          alt={product.name}
          loading="lazy"
        />

        {/* Offer Badge */}
        {product.offer && (
          <span className="product-card-badge">{product.offer}</span>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div className="product-card-rating">
            ★ {product.rating}
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            className={`product-card-wishlist ${inWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
          >
            <Heart size={18} fill={inWishlist ? '#E74C3C' : 'none'} color={inWishlist ? '#E74C3C' : '#333'} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="product-card-content">
        <div className="product-card-brand">
          <h3>{product.businessName || product.brand || 'Brand'}</h3>
        </div>

        <p className="product-card-name">{product.name}</p>

        <div className="product-card-price">
          <span className="product-card-price-current">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="product-card-price-original">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="product-card-discount">
                {discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
