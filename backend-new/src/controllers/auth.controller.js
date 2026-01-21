import { query, queryOne, run } from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail, sendOtpEmail } from '../services/email.service.js'

// Register (Send OTP)
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    // Check if user exists
    const existingUser = await queryOne('SELECT id, is_verified FROM users WHERE email = ?', [email])
    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(400).json({ success: false, message: 'Email already registered' })
      }
      // If user exists but not verified, resend OTP? Or better update details and resend.
      // For now, let's treat it as "Email already registered" but maybe hint verify.
      return res.status(400).json({ success: false, message: 'Email already registered', isVerified: false })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Insert user
    // Note: We use MySQL format for date/timestamp? mysql2 handles Date object.
    await run(
      'INSERT INTO users (name, email, password, phone, otp_code, otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, otp, otpExpires, 0]
    )

    // Send OTP Email
    sendOtpEmail({ email, name }, otp).catch(err => console.error('OTP email failed:', err))

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email',
      email // Send back email for local state
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
}

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'User already verified' })
    }

    // Check OTP
    if (user.otp_code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    // Check Expiry (user.otp_expires is Date object from mysql2)
    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP expired' })
    }

    // Activate User
    await run('UPDATE users SET is_verified = 1, otp_code = NULL WHERE id = ?', [user.id])

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Send Welcome Email
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err))

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ success: false, message: 'Verification failed' })
  }
}

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email])

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.is_verified) return res.status(400).json({ success: false, message: 'User already verified' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    await run('UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?', [otp, otpExpires, user.id])

    sendOtpEmail(user, otp).catch(err => console.error('OTP email failed:', err))

    res.json({ success: true, message: 'OTP resent successfully' })
  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({ success: false, message: 'Failed to resend OTP' })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Check Verification (Optional: Enforce?)
    if (!user.is_verified) {
      // Allow them to proceed? Or block?
      // User asked for "otp jae", usually implies mandatory verification.
      // Let's block and ask for OTP.
      return res.status(403).json({ success: false, message: 'Please verify your email', isVerified: false })
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Remove password from response
    delete user.password
    delete user.otp_code

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
}

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await queryOne('SELECT id, name, email, phone, role, avatar FROM users WHERE id = ?', [req.user.userId])
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({ success: false, message: 'Failed to get user' })
  }
}

// Logout
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
}
