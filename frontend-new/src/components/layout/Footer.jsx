import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
            <span>STORE</span>
          </div>
          <p className="footer-description">
            Your one-stop shop for trendy fashion. Discover the latest styles at unbeatable prices.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link"><Facebook size={18} /></a>
            <a href="#" className="footer-social-link"><Twitter size={18} /></a>
            <a href="#" className="footer-social-link"><Instagram size={18} /></a>
            <a href="#" className="footer-social-link"><Youtube size={18} /></a>
          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="footer-section-title">Customer Service</h4>
          <div className="footer-links">
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/shipping" className="footer-link">Shipping Info</Link>
            <Link to="/returns" className="footer-link">Returns & Exchanges</Link>
            <Link to="/size-guide" className="footer-link">Size Guide</Link>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="footer-section-title">Shop</h4>
          <div className="footer-links">
            <Link to="/products?gender=men" className="footer-link">Men</Link>
            <Link to="/products?gender=women" className="footer-link">Women</Link>
            <Link to="/products?sort=newest" className="footer-link">New Arrivals</Link>
            <Link to="/products?sale=true" className="footer-link">Sale</Link>
            <Link to="/products" className="footer-link">All Products</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="footer-section-title">Company</h4>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/careers" className="footer-link">Careers</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">© {currentYear} STORE. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/privacy" className="footer-link">Privacy</Link>
          <Link to="/terms" className="footer-link">Terms</Link>
          <Link to="/sitemap" className="footer-link">Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
