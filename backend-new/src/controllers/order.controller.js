import { callProcedure } from '../config/database.js';

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const result = await callProcedure('sp_orders_get_by_user', [
            userId,
            parseInt(page),
            parseInt(limit)
        ]);

        res.json({
            success: true,
            data: result[0] || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result[1]?.[0]?.total_count || 0
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await callProcedure('sp_orders_get_by_id', [parseInt(id)]);

        if (!result[0] || result[0].length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = result[0][0];
        order.items = result[1] || [];

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, items, subtotal, shippingFee = 0, discount = 0, notes = '' } = req.body;

        if (!addressId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Address and items are required'
            });
        }

        const total = subtotal - discount + shippingFee;

        // Create order
        const orderResult = await callProcedure('sp_orders_create', [
            userId,
            addressId,
            subtotal,
            shippingFee,
            discount,
            total,
            notes
        ]);

        const orderId = orderResult[0][0].order_id;
        const orderNumber = orderResult[0][0].order_number;

        // Add order items
        for (const item of items) {
            await callProcedure('sp_orders_add_item', [
                orderId,
                item.productId,
                item.variantId || null,
                item.quantity,
                item.price
            ]);
        }

        // Clear user's cart
        await callProcedure('sp_cart_clear', [userId]);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId,
                orderNumber
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await callProcedure('sp_orders_cancel', [parseInt(id)]);

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        await callProcedure('sp_orders_update_status', [
            parseInt(id),
            orderStatus || null,
            paymentStatus || null
        ]);

        res.json({
            success: true,
            message: 'Order status updated'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};
