import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// All cart routes are protected
router.use(protect)

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/:id', updateCartItem)
router.delete('/clear', clearCart)
router.delete('/:id', removeFromCart)

export default router
