import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Truck, 
  RotateCcw, 
  Shield,
  Minus,
  Plus,
  ChevronLeft
} from 'lucide-react'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { product, loading, getProductById, clearProduct } = useProductStore()
  const addToCart = useCartStore(state => state.addToCart)
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  
  const inWishlist = product ? isInWishlist(product.id) : false
  
  useEffect(() => {
    if (id) {
      getProductById(id)
    }
    return () => clearProduct()
  }, [id])
  
  const handleAddToCart = () => {
    if (!product) return
    
    // Get selected variant
    const variant = product.variants?.find(v => 
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true)
    )
    
    addToCart(product, variant, quantity)
  }
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }
  
  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-12)' }}>
            <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-xl)' }}></div>
            <div>
              <div className="skeleton" style={{ height: '40px', marginBottom: 'var(--spacing-4)' }}></div>
              <div className="skeleton" style={{ height: '30px', width: '40%', marginBottom: 'var(--spacing-8)' }}></div>
              <div className="skeleton" style={{ height: '100px', marginBottom: 'var(--spacing-6)' }}></div>
              <div className="skeleton" style={{ height: '50px' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', textAlign: 'center' }}>
        <div className="container">
          <p>Product not found</p>
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>
            Back to Products
          </button>
        </div>
      </div>
    )
  }
  
  const images = product.images?.length > 0 
    ? product.images.map(img => img.image_url)
    : [product.primary_image || 'https://via.placeholder.com/600']
  
  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))] || []
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))] || []
  const colorHexMap = product.variants?.reduce((acc, v) => {
    if (v.color && v.color_hex) acc[v.color] = v.color_hex
    return acc
  }, {}) || {}
  
  const discount = product.discount_percent || 
    Math.round(((product.original_price - product.price) / product.original_price) * 100)
  
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ marginBottom: 'var(--spacing-6)' }}
        >
          <ChevronLeft size={20} /> Back
        </button>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: 'var(--spacing-12)' 
        }}>
          {/* Images */}
          <div>
            <motion.div 
              className="glass-card"
              style={{ overflow: 'hidden', marginBottom: 'var(--spacing-4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                style={{ 
                  width: '100%', 
                  aspectRatio: '3/4', 
                  objectFit: 'cover' 
                }}
              />
            </motion.div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedImage === i 
                        ? '2px solid var(--color-accent)' 
                        : '2px solid transparent',
                      opacity: selectedImage === i ? 1 : 0.6
                    }}
                  >
                    <img 
                      src={img} 
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Category */}
            <p style={{ 
              color: 'var(--color-accent)', 
              fontSize: 'var(--text-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--spacing-2)'
            }}>
              {product.category_name || 'Premium Collection'}
            </p>
            
            {/* Name */}
            <h1 className="heading-3" style={{ marginBottom: 'var(--spacing-4)' }}>
              {product.name}
            </h1>
            
            {/* Rating */}
            {product.avg_rating > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-6)',
                color: 'var(--color-gray-400)'
              }}>
                <Star size={18} fill="var(--color-warning)" color="var(--color-warning)" />
                <span>{product.avg_rating.toFixed(1)}</span>
                <span>({product.review_count} reviews)</span>
              </div>
            )}
            
            {/* Price */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 'var(--spacing-4)',
              marginBottom: 'var(--spacing-6)'
            }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>
                {formatPrice(product.price)}
              </span>
              {product.original_price > product.price && (
                <>
                  <span style={{ 
                    fontSize: 'var(--text-xl)', 
                    color: 'var(--color-gray-500)',
                    textDecoration: 'line-through'
                  }}>
                    {formatPrice(product.original_price)}
                  </span>
                  <span style={{ 
                    color: 'var(--color-success)',
                    fontWeight: 600
                  }}>
                    {discount}% off
                  </span>
                </>
              )}
            </div>
            
            {/* Sizes */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-3)',
                  fontWeight: 500
                }}>
                  Size
                </label>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: 'var(--spacing-3) var(--spacing-5)',
                        background: selectedSize === size ? 'var(--color-white)' : 'transparent',
                        color: selectedSize === size ? 'var(--color-black)' : 'var(--color-white)',
                        border: '1px solid var(--color-gray-600)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Colors */}
            {colors.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-3)',
                  fontWeight: 500
                }}>
                  Color: {selectedColor || 'Select'}
                </label>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        background: colorHexMap[color] || color,
                        border: selectedColor === color 
                          ? '3px solid var(--color-accent)' 
                          : '2px solid var(--color-gray-600)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div style={{ marginBottom: 'var(--spacing-8)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-3)',
                fontWeight: 500
              }}>
                Quantity
              </label>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                border: '1px solid var(--color-gray-600)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: 'var(--spacing-3)' }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ 
                  padding: '0 var(--spacing-6)', 
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: 'var(--spacing-3)' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
              <button 
                className="btn btn-accent btn-lg"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button 
                className="btn-icon"
                onClick={() => toggleWishlist(product)}
                style={{ 
                  width: '56px', 
                  height: '56px',
                  background: inWishlist ? 'var(--color-accent)' : 'var(--glass-bg)'
                }}
              >
                <Heart size={24} fill={inWishlist ? 'white' : 'none'} />
              </button>
            </div>
            
            {/* Features */}
            <div className="glass-card" style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3) 0',
                borderBottom: '1px solid var(--glass-border)'
              }}>
                <Truck size={20} color="var(--color-accent)" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Free delivery on orders above ₹999</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3) 0',
                borderBottom: '1px solid var(--glass-border)'
              }}>
                <RotateCcw size={20} color="var(--color-accent)" />
                <span style={{ fontSize: 'var(--text-sm)' }}>30 days easy return</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3) 0'
              }}>
                <Shield size={20} color="var(--color-accent)" />
                <span style={{ fontSize: 'var(--text-sm)' }}>100% authentic products</span>
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <div style={{ marginTop: 'var(--spacing-8)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)', fontWeight: 600 }}>Description</h3>
                <p style={{ color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
                  {product.description}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
