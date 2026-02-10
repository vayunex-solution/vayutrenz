// Authentication Controller - Enhanced with OAuth & Password Reset (Secured)
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth.middleware');
const { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail, sendWelcomeEmail } = require('../config/email');
const { validatePassword } = require('../middleware/security.middleware');

// Register new user
const register = async (req, res) => {
    try {
        const { email, password, fullName, username } = req.body;

        // Validation
        if (!email || !password || !fullName || !username) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Username validation (alphanumeric, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Username must be 3-20 characters, letters, numbers, underscores only' });
        }

        // Password validation
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({ 
                error: 'Password too weak', 
                details: passwordCheck.errors 
            });
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                username: username.toLowerCase(),
                verificationToken: otp,
                tokenExpiry: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        // Send OTP email (async)
        // Note: In production, consider using a queue
        sendOtpEmail(email, otp, fullName).catch(err => console.error('Failed to send OTP:', err));

        // Generate token (optional: you might want to force login after verification, but here we can return it)
        // Usually for OTP flow, we verify first, then issue token.
        // But to keep it effectively similar to before, we return token but user needs to verify to use verified features.
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Account created! Please check your email for the verification code.',
            user,
            token,
            requireVerification: true
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                bio: true,
                college: true,
                department: true,
                batch: true,
                isProfileComplete: true,
                isVerified: true,
                emailVerified: true,
                googleId: true,
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user signed up with Google
        if (user.googleId && !user.password) {
            return res.status(401).json({ error: 'Please login with Google' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update online status
        await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: true }
        });

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
                verificationToken: otp,
                tokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Update user verification status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                isVerified: true,
                verificationToken: null,
                tokenExpiry: null
            }
        });

        // Send Welcome Email
        sendWelcomeEmail(email, user.fullName).catch(err => console.error('Failed to send welcome email:', err));

        res.json({ message: 'Email verified successfully! You can now access all features.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: otp,
                tokenExpiry: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
            }
        });

        // Send OTP email
        await sendOtpEmail(email, otp, user.fullName);

        res.json({ message: 'New verification code sent' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend code' });
    }
};

// Verify email link (Legacy support)
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                tokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification link' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                tokenExpiry: null
            }
        });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
};

// Forgot password - request reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If the email exists, a reset link will be sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            }
        });

        // Send reset email
        await sendPasswordResetEmail(email, resetToken, user.fullName);

        res.json({ message: 'If the email exists, a reset link will be sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset link' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

// Google OAuth callback handler
const googleCallback = async (req, res) => {
    try {
        const { user, token } = req.user;
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&userId=${user.id}`);
    } catch (error) {
        console.error('Google callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
};

// Get current user
const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                username: true,
                avatarUrl: true,
                coverUrl: true,
                bio: true,
                college: true,
                department: true,
                batch: true,
                graduationYear: true,
                phone: true,
                location: true,
                interests: true,
                isProfileComplete: true,
                isVerified: true,
                isVerified: true,
                emailVerified: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            }
        });

        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user details' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { isOnline: false, lastSeen: new Date() }
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};
// Refresh Token
const refreshTokenEndpoint = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

        const decoded = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (user.isBanned) return res.status(403).json({ error: 'Account banned' });

        const newToken = generateToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
};

// Deactivate Account
const deactivateAccount = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { isDeactivated: true, isOnline: false }
        });
        res.json({ message: 'Account deactivated. Login again to reactivate.' });
    } catch (error) {
        console.error('Deactivate error:', error);
        res.status(500).json({ error: 'Failed to deactivate' });
    }
};

module.exports = { 
    register, 
    login, 
    me, 
    logout, 
    verifyEmail, 
    verifyOtp,
    resendOtp,
    forgotPassword, 
    resetPassword,
    googleCallback,
    refreshTokenEndpoint,
    deactivateAccount
};
