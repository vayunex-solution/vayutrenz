// Authentication Controller - Enhanced with OAuth & Password Reset (Secured)
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { generateToken } = require('../middleware/auth.middleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                username: username.toLowerCase(),
                verificationToken,
                tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
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

        // Send verification email (async, don't wait)
        sendVerificationEmail(email, verificationToken, fullName);

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Account created successfully. Please check your email to verify your account.',
            user,
            token
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
                isVerified: true,
                emailVerified: true,
                googleId: true
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

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Verify email
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
                isVerified: true,
                emailVerified: true,
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

module.exports = { 
    register, 
    login, 
    me, 
    logout, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    googleCallback
};
