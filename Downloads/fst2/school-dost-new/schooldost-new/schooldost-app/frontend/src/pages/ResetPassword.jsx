// Reset Password Page
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiLock, FiSun, FiMoon, FiCheck } from 'react-icons/fi';
import { authAPI } from '../services/api';
import logoImg from '../assets/logo.png';

export default function ResetPassword() {
    const { theme, toggleTheme } = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword({ token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2 className="auth-title">Invalid Link</h2>
                    <p className="auth-subtitle">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '20px' }}>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

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

                {success ? (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <FiCheck size={40} style={{ color: '#22c55e' }} />
                            </div>
                            <h2 className="auth-title">Password Reset! ✅</h2>
                            <p className="auth-subtitle">
                                Your password has been reset successfully. Redirecting to login...
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-subtitle">Enter your new password</p>

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
                                <label className="form-label"><FiLock /> New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FiLock /> Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
