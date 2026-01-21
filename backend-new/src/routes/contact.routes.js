import express from 'express'
import { submitContact, getMessages, deleteMessage } from '../controllers/contact.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public
router.post('/', submitContact)

// Admin
router.get('/', protect, admin, getMessages)
router.delete('/:id', protect, admin, deleteMessage)

export default router
