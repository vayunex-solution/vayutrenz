// Forgot Password Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { authAPI } from '../services/api';
import logoImg from '../assets/logo.png';

export default function ForgotPassword() {
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.forgotPassword({ email });
            setSent(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <button
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px',
                    background: 'var(--bg-card)',
                    borderRadius: '10px',
                    color: 'var(--text-white)',
                    border: '1px solid var(--border-dark)'
                }}
            >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            <div className="auth-card">
                <div className="auth-logo">
                    <img
                        src={logoImg}
                        alt="School Dost"
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                </div>

                {sent ? (
                    <>
                        <h2 className="auth-title">Check your email 📧</h2>
                        <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
                            If an account exists with {email}, we've sent a password reset link.
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                            <FiArrowLeft /> Back to Login
                        </Link>
                    </>
                ) : (
                    <>
                        <h2 className="auth-title">Forgot Password?</h2>
                        <p className="auth-subtitle">Enter your email to receive a reset link</p>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label"><FiMail /> Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p className="auth-link">
                            Remember your password? <Link to="/login">Login</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
