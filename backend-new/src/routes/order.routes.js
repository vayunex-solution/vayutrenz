import express from 'express';
import {
    getUserOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    updateOrderStatus
} from '../controllers/order.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order routes are protected
router.use(protect);

router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', admin, updateOrderStatus);

export default router;
