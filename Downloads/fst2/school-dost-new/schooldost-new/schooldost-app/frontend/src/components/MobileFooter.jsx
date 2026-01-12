// Mobile Footer Bar Component
import { NavLink } from 'react-router-dom';
import { FiHome, FiHeart, FiPlusCircle, FiMessageCircle, FiUser } from 'react-icons/fi';

export default function MobileFooter() {
  const links = [
    { to: '/', icon: <FiHome />, label: 'Home' },
    { to: '/matches', icon: <FiHeart />, label: 'Matches' },
    { to: '/create', icon: <FiPlusCircle />, label: 'Post' },
    { to: '/messages', icon: <FiMessageCircle />, label: 'Chat' },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <footer className="mobile-footer">
      <nav className="mobile-footer-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `mobile-footer-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
