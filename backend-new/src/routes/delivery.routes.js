import express from 'express'
import { registerDeliveryPartner, getDeliveryProfile, getAssignedOrders, updateTrackingStatus, getTrackingTimeline } from '../controllers/delivery.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Partner
router.post('/register', protect, registerDeliveryPartner)
router.get('/profile', protect, getDeliveryProfile)
router.get('/orders', protect, getAssignedOrders)
router.post('/orders/:orderId/track', protect, updateTrackingStatus)

// Public (Customer)
router.get('/track/:orderId', getTrackingTimeline)

export default router
