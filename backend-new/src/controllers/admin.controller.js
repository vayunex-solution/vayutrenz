import { callProcedure } from '../config/database.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
    try {
        const result = await callProcedure('sp_admin_get_dashboard_stats', []);
        
        res.json({
            success: true,
            data: result[0][0] || {}
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role = null } = req.query;
        
        const result = await callProcedure('sp_admin_get_users', [
            parseInt(page),
            parseInt(limit),
            role
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
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = null } = req.query;
        
        const result = await callProcedure('sp_admin_get_orders', [
            status,
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
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders',
            error: error.message
        });
    }
};

// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAllProductsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = null } = req.query;
        
        const result = await callProcedure('sp_admin_get_products', [
            status,
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
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['user', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }
        
        await callProcedure('sp_admin_update_user_role', [parseInt(id), role]);
        
        res.json({
            success: true,
            message: 'User role updated'
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role',
            error: error.message
        });
    }
};
