import express from 'express'
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getCategories)
router.get('/:slug', getCategoryBySlug)

// Admin routes
router.post('/', protect, admin, createCategory)
router.put('/:id', protect, admin, updateCategory)
router.delete('/:id', protect, admin, deleteCategory)

export default router
