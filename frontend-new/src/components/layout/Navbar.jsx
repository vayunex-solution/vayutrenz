import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  LayoutGrid
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useThemeStore } from '../../store/themeStore'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [gender, setGender] = useState('MEN')

  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const { user, isAuthenticated } = useAuthStore()
  const cartCount = useCartStore(state => state.getCount())
  const wishlistCount = useWishlistStore(state => state.getCount())
  const { theme, toggleTheme } = useThemeStore()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`)
      setSearchValue('')
    }
  }

  const categoryLinks = [
    { name: 'SHOP NOW', route: '/products' },
    { name: 'NEW ARRIVALS', route: '/products?sort=newest' },
    { name: 'T-SHIRTS', route: '/products?category=t-shirts' },
    { name: 'JEANS', route: '/products?category=jeans' },
    { name: 'ACCESSORIES', route: '/products?category=accessories' },
    { name: 'SNEAKERS', route: '/products?category=sneakers' }
  ]

  return (
    <nav className="navbar">
      {/* Mobile Top Header - Logo, Search & Theme Toggle */}
      <div className="mobile-top-header">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <span className="navbar-logo-text">LUXE</span>
        </div>
        <form className="mobile-header-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
          />
        </form>
        <button className="mobile-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Top Navbar - Desktop Only */}
      <div className="navbar-top">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <span className="navbar-logo-text">LUXE</span>
        </div>

        {/* Gender Links - Desktop */}
        <div className="navbar-gender-links">
          {['MEN', 'WOMEN'].map(item => (
            <Link
              key={item}
              to={`/products?gender=${item.toLowerCase()}`}
              className={`navbar-gender-link ${gender === item ? 'active' : ''}`}
              onClick={() => setGender(item)}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search className="navbar-search-icon" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for products, brands..."
          />
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar-action-link">
            <Heart />
            {wishlistCount > 0 && (
              <span className="navbar-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="navbar-action-link">
            <ShoppingBag />
            {cartCount > 0 && (
              <span className="navbar-badge">{cartCount}</span>
            )}
          </Link>

          {/* User */}
          {isAuthenticated ? (
            <Link to="/account" className="navbar-action-link">
              <User />
            </Link>
          ) : (
            <Link to="/login" className="navbar-login-btn">
              Login
            </Link>
          )}

          <button className="navbar-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Bottom Navbar - Category Links (Home page only) */}
      {isHomePage && (
        <div className="navbar-bottom">
          {/* Category Links */}
          <div className="navbar-category-links centered-links">
            {categoryLinks.map((link, index) => (
              <Link
                key={index}
                to={link.route}
                className="navbar-category-link"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      <div 
        className={`mobile-backdrop ${menuOpen ? 'open' : ''}`} 
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <form className="mobile-search-form" onSubmit={(e) => {
            handleSearch(e)
            setMenuOpen(false)
          }}>
            <Search size={20} className="mobile-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>

          <div className="mobile-menu-links">
            <div className="mobile-gender-toggle">
              {['MEN', 'WOMEN'].map(item => (
                <button
                  key={item}
                  className={`mobile-gender-btn ${gender === item ? 'active' : ''}`}
                  onClick={() => {
                    setGender(item)
                    setMenuOpen(false)
                    navigate(`/products?gender=${item.toLowerCase()}`)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {categoryLinks.map((link, index) => (
              <Link
                key={index}
                to={link.route}
                className="mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Fixed Bottom Navigation (Mobile Only) */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        
        <Link to="/products" className={`mobile-nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}>
          <LayoutGrid size={24} />
          <span>Shop</span>
        </Link>
        
        <Link to="/wishlist" className={`mobile-nav-item ${location.pathname === '/wishlist' ? 'active' : ''}`}>
          <Heart size={24} />
          <span>Wishlist</span>
        </Link>
        
        <Link to={isAuthenticated ? "/account" : "/login"} className={`mobile-nav-item ${location.pathname.match(/\/account|\/login/) ? 'active' : ''}`}>
          <User size={24} />
          <span>Account</span>
        </Link>
        
        <button 
          className={`mobile-nav-item ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
          <span>Menu</span>
        </button>
      </div>
    </nav>
  )
}


export default Navbar
