import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { verifyOtp, resendOtp, isLoading } = useAuthStore()

    const [otp, setOtp] = useState('')
    const [email, setEmail] = useState('')
    const [manualEmail, setManualEmail] = useState('')

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email)
        }
    }, [location])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const targetEmail = email || manualEmail

        if (!targetEmail) {
            toast.error('Email is required')
            return
        }

        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP')
            return
        }

        const result = await verifyOtp(targetEmail, otp)
        if (result.success) {
            toast.success('Email verified! Welcome!')
            navigate('/')
        } else {
            toast.error(result.message)
        }
    }
    const handleResend = async () => {
        const targetEmail = email || manualEmail
        if (!targetEmail) {
            toast.error('Email is required to resend OTP')
            return
        }
        const result = await resendOtp(targetEmail)
        if (result.success) {
            toast.success('New OTP sent!')
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '60px', height: '60px', background: '#F5F5F5',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto'
                    }}>
                        <Mail size={24} color="#FF4D00" />
                    </div>
                </div>

                <h1 className="auth-title">Verify Your Email</h1>
                {email ? (
                    <p className="auth-subtitle">
                        We sent a 6-digit code to <br />
                        <strong>{email}</strong>
                    </p>
                ) : (
                    <div className="form-group">
                        <label className="form-label">Enter your email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            placeholder="Enter your email"
                            style={{ textAlign: 'center' }}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Verification Code</label>
                        <input
                            type="text"
                            className="form-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            style={{
                                letterSpacing: '10px',
                                textAlign: 'center',
                                fontSize: '24px',
                                fontWeight: '600'
                            }}
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        className="auth-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '5px' }}
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp

