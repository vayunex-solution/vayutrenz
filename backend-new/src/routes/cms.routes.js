import express from 'express'
import { getSiteSettings, updateSiteSettings, getPublicSettings } from '../controllers/cms.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public route to get site config (logo, title, etc)
router.get('/settings', getPublicSettings)

// Admin routes
router.get('/admin/settings', protect, admin, getSiteSettings)
router.put('/admin/settings', protect, admin, updateSiteSettings)

export default router
