import jwt from 'jsonwebtoken'
import { queryOne } from '../config/database.js'

// Verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token

        // Check for token in cookies or Authorization header
        if (req.cookies?.token) {
            token = req.cookies.token
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

        // Get user from database
        const user = queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.userId])

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        // Attach user info to request
        req.user = user
        req.userId = user.id
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token'
        })
    }
}

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token

        if (req.cookies?.token) {
            token = req.cookies.token
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
            const user = queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.userId])
            if (user) {
                req.user = user
                req.userId = user.id
            }
        }

        next()
    } catch (error) {
        // Continue without user
        next()
    }
}

// Admin only middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        })
    }
}

// Seller or Admin middleware
export const sellerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
        next()
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Seller or Admin only.'
        })
    }
}
