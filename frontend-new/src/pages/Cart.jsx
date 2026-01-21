import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

const Cart = () => {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCartStore()
  
  const total = getTotal()
  const shippingFee = total > 499 ? 0 : 49
  const grandTotal = total + shippingFee
  
  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`
  
  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <ShoppingBag className="empty-state-icon" />
          <h2 className="empty-state-title">Your cart is empty</h2>
          <p className="empty-state-text">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="page-container">
      <h1 className="page-title">Shopping Cart ({items.length})</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
        {/* Cart Items */}
        <div>
          {items.map((item) => (
            <div className="cart-item" key={item.cart_item_id || item.tempId}>
              <Link to={`/product/${item.product?.id}`} className="cart-item-image">
                <img 
                  src={item.product?.image || item.product?.primary_image || '/placeholder.jpg'}
                  alt={item.product?.name}
                />
              </Link>
              
              <div className="cart-item-content">
                <Link to={`/product/${item.product?.id}`}>
                  <h3 className="cart-item-name">{item.product?.name}</h3>
                </Link>
                
                {(item.size || item.variant?.size) && (
                  <p className="cart-item-variant">
                    Size: {item.size || item.variant?.size}
                    {item.color || item.variant?.color ? ` • ${item.color || item.variant?.color}` : ''}
                  </p>
                )}
                
                <p className="cart-item-price">{formatPrice(item.product?.price)}</p>
                
                <div className="cart-item-actions">
                  <div className="quantity-selector">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.cart_item_id || item.tempId, Math.max(1, item.quantity - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.cart_item_id || item.tempId, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.cart_item_id || item.tempId)}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={clearCart}
            style={{ 
              color: 'var(--color-text-muted)', 
              fontSize: 'var(--text-sm)',
              marginTop: '10px'
            }}
          >
            Clear Cart
          </button>
        </div>
        
        {/* Order Summary */}
        <div className="order-summary">
          <h3 className="order-summary-title">Order Summary</h3>
          
          <div className="order-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <div className="order-summary-row">
            <span>Shipping</span>
            <span style={{ color: shippingFee === 0 ? 'var(--color-success)' : 'inherit' }}>
              {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
            </span>
          </div>
          
          {shippingFee > 0 && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '5px' }}>
              Add {formatPrice(499 - total)} more for free shipping!
            </p>
          )}
          
          <div className="order-summary-total">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
          
          <button 
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
          
          <Link 
            to="/products"
            style={{ 
              display: 'block', 
              textAlign: 'center', 
              marginTop: '15px',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)'
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Cart

