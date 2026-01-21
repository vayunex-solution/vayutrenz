import express from 'express'
import { applySeller, getSellerProfile, getAllSellers, updateSellerStatus, getSellerOrders } from '../controllers/seller.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Protected (Applicant/Seller)
router.post('/apply', protect, applySeller)
router.get('/status', protect, getSellerProfile)
router.get('/orders', protect, getSellerOrders)

// Admin
router.get('/admin', protect, admin, getAllSellers)
router.put('/admin/:id/status', protect, admin, updateSellerStatus)

export default router
