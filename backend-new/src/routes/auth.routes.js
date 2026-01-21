import express from 'express'
import { body } from 'express-validator'
import { register, login, logout, getMe, verifyOtp, resendOtp } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = express.Router()

// Validation rules
const registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
]

const verifyOtpValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
]

// Routes
router.post('/register', registerValidation, validate, register)
router.post('/login', loginValidation, validate, login)
router.post('/verify-otp', verifyOtpValidation, validate, verifyOtp)
router.post('/resend-otp', body('email').isEmail(), validate, resendOtp)
router.post('/logout', logout)
router.get('/me', protect, getMe)

export default router
