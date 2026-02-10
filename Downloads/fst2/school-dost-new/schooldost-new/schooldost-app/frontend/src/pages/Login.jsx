// Login Page - With Official Logo
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import logoImg from '../assets/logo.png';
import './Auth.css'; // Import Premium Styles

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px',
          background: 'var(--bg-card)',
          borderRadius: '50%',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <img
            src={logoImg}
            alt="School Dost"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain'
            }}
          />
        </div>

        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Login to connect with your dosts</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
