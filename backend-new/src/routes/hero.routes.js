import express from 'express'
import { getHeroSlides, addHeroSlide, deleteHeroSlide, updateHeroSlide } from '../controllers/hero.controller.js'
// Note: In real app, we would add auth middleware here for add/delete
// import { protect, adminOrSeller } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getHeroSlides)
router.post('/', addHeroSlide) // Add protect middleware later
router.put('/:id', updateHeroSlide)
router.delete('/:id', deleteHeroSlide)

export default router
