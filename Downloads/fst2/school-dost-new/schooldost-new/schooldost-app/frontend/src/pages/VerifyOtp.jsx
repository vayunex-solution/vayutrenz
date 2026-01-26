// Verify OTP Page
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiHash, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { authAPI } from '../services/api';
import logoImg from '../assets/logo.png';

export default function VerifyOtp() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/register');
        }

        // Timer for cooldown
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [location.state, navigate, resendCooldown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authAPI.verifyOtp({ email, otp: code });
            alert('Email verified successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        try {
            await authAPI.resendOtp({ email });
            setResendCooldown(60); // 60 seconds cooldown
            alert('New verification code sent!');
        } catch (err) {
            setError('Failed to resend code');
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

                <h2 className="auth-title">Verify Email 🔐</h2>
                <p className="auth-subtitle">
                    Enter the 6-digit code sent to <br />
                    <strong>{email}</strong>
                </p>

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

                <form onSubmit={handleVerify}>
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        justifyContent: 'center',
                        marginBottom: '24px' 
                    }}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                style={{
                                    width: '40px',
                                    height: '50px',
                                    padding: '0',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-dark)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-white)',
                                    fontWeight: 'bold'
                                }}
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading} 
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                        Didn't receive code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-yellow)',
                            cursor: resendCooldown > 0 ? 'default' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <FiArrowLeft /> Back to Signup
                    </Link>
                </div>
            </div>
        </div>
    );
}
