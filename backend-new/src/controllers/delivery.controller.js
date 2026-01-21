import { run, queryOne, query } from '../config/database.js'

// --- Delivery Partner Management ---

export const registerDeliveryPartner = async (req, res) => {
    try {
        const userId = req.user.id
        const { vehicle_number, vehicle_type, phone } = req.body

        // Check existing
        const existing = await queryOne('SELECT * FROM delivery_partners WHERE user_id = ?', [userId])
        if (existing) return res.status(400).json({ success: false, message: 'Already registered' })

        await run(`
            INSERT INTO delivery_partners (user_id, vehicle_number, vehicle_type, phone, status)
            VALUES (?, ?, ?, ?, 'active')
        `, [userId, vehicle_number, vehicle_type, phone])

        res.status(201).json({ success: true, message: 'Delivery Partner Registered' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' })
    }
}

export const getDeliveryProfile = async (req, res) => {
    try {
        const profile = await queryOne('SELECT * FROM delivery_partners WHERE user_id = ?', [req.user.id])
        res.json({ success: true, profile })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed' })
    }
}

// --- Order Logistics ---

export const getAssignedOrders = async (req, res) => {
    try {
        const profile = await queryOne('SELECT id FROM delivery_partners WHERE user_id = ?', [req.user.id])
        if (!profile) return res.status(403).json({ success: false, message: 'Not a delivery partner' })

        const orders = await query(`
            SELECT o.*, u.name as customer_name, u.phone as customer_phone, 
                   u.address as customer_address, u.city as customer_city, u.zip_code as customer_zip
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.delivery_partner_id = ? AND o.status NOT IN ('delivered', 'cancelled')
            ORDER BY o.created_at ASC
        `, [profile.id])

        res.json({ success: true, orders })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed' })
    }
}

export const updateTrackingStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status, location, description } = req.body
        const userId = req.user.id

        // Verify partner assignment
        const profile = await queryOne('SELECT id FROM delivery_partners WHERE user_id = ?', [userId])
        if (!profile) return res.status(403).json({ success: false, message: 'Unauthorized' })

        // Check order ownership
        const order = await queryOne('SELECT id FROM orders WHERE id = ? AND delivery_partner_id = ?', [orderId, profile.id])
        if (!order) return res.status(403).json({ success: false, message: 'Order not assigned to you' })

        // Add tracking event
        await run(`
            INSERT INTO order_tracking (order_id, status, location, description)
            VALUES (?, ?, ?, ?)
        `, [orderId, status, location, description])

        // Update main order status if needed
        if (['shipped', 'out_for_delivery', 'delivered'].includes(status)) {
            await run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
        }

        res.json({ success: true, message: 'Tracking updated' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' })
    }
}

// For Customer Tracking Page
export const getTrackingTimeline = async (req, res) => {
    try {
        const { orderId } = req.params
        const events = await query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC', [orderId])
        const order = await queryOne('SELECT status FROM orders WHERE id = ?', [orderId])

        res.json({ success: true, timeline: events, currentStatus: order?.status })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed' })
    }
}
