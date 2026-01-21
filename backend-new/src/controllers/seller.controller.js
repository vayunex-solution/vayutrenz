import { run, queryOne, query } from '../config/database.js'

export const applySeller = async (req, res) => {
    try {
        const userId = req.user.id
        const { business_name, business_address, tax_id, description } = req.body
        const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        // Check if already exists
        const existing = await queryOne('SELECT * FROM seller_profiles WHERE user_id = ?', [userId])
        if (existing) return res.status(400).json({ success: false, message: 'Already applied' })

        // Check slug
        const slugCheck = await queryOne('SELECT * FROM seller_profiles WHERE slug = ?', [slug])
        if (slugCheck) return res.status(400).json({ success: false, message: 'Business name taken' })

        await run(`
            INSERT INTO seller_profiles (user_id, business_name, slug, business_address, tax_id, description, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [userId, business_name, slug, business_address, tax_id, description])

        res.status(201).json({ success: true, message: 'Application submitted' })
    } catch (error) {
        console.error('Apply seller error:', error)
        res.status(500).json({ success: false, message: 'Application failed' })
    }
}

export const getSellerProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const profile = await queryOne('SELECT * FROM seller_profiles WHERE user_id = ?', [userId])
        res.json({ success: true, profile })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed' })
    }
}

export const getAllSellers = async (req, res) => {
    try {
        const sellers = await query(`
            SELECT s.*, u.name as owner_name, u.email 
            FROM seller_profiles s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `)
        res.json({ success: true, sellers })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed' })
    }
}

export const updateSellerStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' })
        }

        await run('UPDATE seller_profiles SET status = ? WHERE id = ?', [status, id])
        res.json({ success: true, message: 'Status updated' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' })
    }
}

export const getSellerOrders = async (req, res) => {
    try {
        const userId = req.user.id
        
        // 1. Get Seller Profile ID
        const seller = await queryOne('SELECT id FROM seller_profiles WHERE user_id = ?', [userId])
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' })

        // 2. Fetch Orders containing seller's products
        const orders = await query(`
            SELECT 
                oi.id as item_id,
                o.order_number,
                o.created_at,
                o.order_status,
                p.name as product_name,
                p.price,
                oi.quantity,
                oi.total_price,
                u.name as customer_name,
                a.city as customer_city
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.address_id = a.id
            WHERE p.seller_id = ?
            ORDER BY o.created_at DESC
        `, [seller.id])

        res.json({ success: true, orders })
    } catch (error) {
        console.error('Get seller orders error:', error)
        res.status(500).json({ success: false, message: 'Fetch orders failed' })
    }
}
