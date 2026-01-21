import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getAllOrders,
    getAllProductsAdmin,
    updateUserRole
} from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes are protected and admin only
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/products', getAllProductsAdmin);
router.put('/users/:id/role', updateUserRole);

export default router;
