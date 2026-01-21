import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist
} from '../controllers/wishlist.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// All wishlist routes are protected
router.use(protect)

router.get('/', getWishlist)
router.post('/add', addToWishlist)
router.post('/toggle', toggleWishlist)
router.get('/check/:productId', checkWishlist)
router.delete('/:productId', removeFromWishlist)

export default router
