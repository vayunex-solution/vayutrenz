import express from 'express'
import {
    getProducts,
    getProductById,
    getFeaturedProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Protected routes
router.post('/', protect, createProduct)
router.put('/:id', protect, updateProduct)
router.delete('/:id', protect, deleteProduct)

export default router
