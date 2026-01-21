import { callProcedure } from '../config/database.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, gender, dateOfBirth, avatarUrl } = req.body;
        
        await callProcedure('sp_user_update_profile', [
            userId,
            name || null,
            phone || null,
            gender || null,
            dateOfBirth || null,
            avatarUrl || null
        ]);
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await callProcedure('sp_addresses_get', [userId]);
        
        res.json({
            success: true,
            data: result[0] || []
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get addresses',
            error: error.message
        });
    }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, street, city, state, pincode, country, landmark, addressType } = req.body;
        
        const result = await callProcedure('sp_addresses_add', [
            userId,
            fullName,
            phone,
            street,
            city,
            state,
            pincode,
            country || 'India',
            landmark || null,
            addressType || 'home'
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: { addressId: result[0][0].address_id }
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, street, city, state, pincode, country, landmark, addressType } = req.body;
        
        await callProcedure('sp_addresses_update', [
            parseInt(id),
            fullName,
            phone,
            street,
            city,
            state,
            pincode,
            country,
            landmark,
            addressType
        ]);
        
        res.json({
            success: true,
            message: 'Address updated successfully'
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update address',
            error: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        
        await callProcedure('sp_addresses_delete', [parseInt(id)]);
        
        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete address',
            error: error.message
        });
    }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await callProcedure('sp_addresses_set_default', [userId, parseInt(id)]);
        
        res.json({
            success: true,
            message: 'Default address updated'
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set default address',
            error: error.message
        });
    }
};
