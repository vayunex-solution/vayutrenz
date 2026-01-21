import { useEffect } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// Sub pages
const Profile = () => {
  const { user } = useAuthStore()
  
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Profile</h2>
      <div className="glass-card" style={{ padding: 'var(--spacing-6)' }}>
        <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Name</label>
            <p style={{ fontWeight: 500 }}>{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Email</label>
            <p style={{ fontWeight: 500 }}>{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>Phone</label>
            <p style={{ fontWeight: 500 }}>{user?.phone || 'Not added'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Orders = () => (
  <div>
    <h2 style={{ marginBottom: 'var(--spacing-6)' }}>My Orders</h2>
    <div className="glass-card" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
      <Package size={48} color="var(--color-gray-500)" style={{ marginBottom: 'var(--spacing-4)' }} />
      <p style={{ color: 'var(--color-gray-400)' }}>No orders yet</p>
    </div>
  </div>
)

const Addresses = () => (
  <div>
    <h2 style={{ marginBottom: 'var(--spacing-6)' }}>My Addresses</h2>
    <div className="glass-card" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
      <MapPin size={48} color="var(--color-gray-500)" style={{ marginBottom: 'var(--spacing-4)' }} />
      <p style={{ color: 'var(--color-gray-400)' }}>No addresses saved</p>
      <button className="btn btn-accent" style={{ marginTop: 'var(--spacing-4)' }}>
        Add Address
      </button>
    </div>
  </div>
)

const Account = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])
  
  if (!isAuthenticated) {
    return null
  }
  
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }
  
  const menuItems = [
    { icon: User, label: 'Profile', path: '/account' },
    { icon: Package, label: 'Orders', path: '/account/orders' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: MapPin, label: 'Addresses', path: '/account/addresses' }
  ]
  
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="heading-3" style={{ marginBottom: 'var(--spacing-8)' }}>
          My Account
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '280px 1fr', 
          gap: 'var(--spacing-8)',
          alignItems: 'start'
        }}>
          {/* Sidebar */}
          <motion.div
            className="glass-card"
            style={{ padding: 'var(--spacing-4)', position: 'sticky', top: '120px' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* User Info */}
            <div style={{ 
              padding: 'var(--spacing-4)', 
              borderBottom: '1px solid var(--glass-border)',
              marginBottom: 'var(--spacing-2)'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-3)'
              }}>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <p style={{ fontWeight: 600 }}>{user?.name}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>
                {user?.email}
              </p>
            </div>
            
            {/* Menu */}
            <nav>
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/account'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-white)' : 'var(--color-gray-400)',
                    background: isActive ? 'var(--color-gray-800)' : 'transparent',
                    marginBottom: 'var(--spacing-1)',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
              
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-error)',
                  background: 'transparent',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: 'var(--spacing-4)',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: 'var(--spacing-4)'
                }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </nav>
          </motion.div>
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Routes>
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="*" element={<Navigate to="/account" replace />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Account
