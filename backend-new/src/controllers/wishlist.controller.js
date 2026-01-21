import { query, queryOne, run } from '../config/database.js'

// Get wishlist
export const getWishlist = async (req, res) => {
    try {
        const items = await query(`
      SELECT w.id as wishlist_id, w.product_id,
             p.id, p.name, p.price, p.original_price, p.primary_image, 
             p.brand, p.business_name, p.rating, p.discount
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [req.userId])

        const formattedItems = items.map(item => ({
            wishlist_id: item.wishlist_id,
            product_id: item.product_id,
            product: {
                id: item.id,
                name: item.name,
                price: item.price,
                originalPrice: item.original_price,
                image: item.primary_image,
                brand: item.brand,
                businessName: item.business_name,
                rating: item.rating,
                discount: item.discount
            }
        }))

        res.json({ success: true, items: formattedItems })
    } catch (error) {
        console.error('Get wishlist error:', error)
        res.status(500).json({ success: false, message: 'Failed to get wishlist' })
    }
}

// Add to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body

        // Check if product exists
        const product = await queryOne('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId])
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        // Check if already in wishlist
        const existing = await queryOne('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.userId, productId])
        if (existing) {
            return res.json({ success: true, message: 'Already in wishlist' })
        }

        // Add to wishlist
        await run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.userId, productId])

        res.json({ success: true, message: 'Added to wishlist' })
    } catch (error) {
        console.error('Add to wishlist error:', error)
        res.status(500).json({ success: false, message: 'Failed to add to wishlist' })
    }
}

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        await run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.userId, productId])

        res.json({ success: true, message: 'Removed from wishlist' })
    } catch (error) {
        console.error('Remove from wishlist error:', error)
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist' })
    }
}

// Toggle wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body

        const existing = await queryOne('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.userId, productId])

        if (existing) {
            await run('DELETE FROM wishlist WHERE id = ?', [existing.id])
            res.json({ success: true, message: 'Removed from wishlist', inWishlist: false })
        } else {
            await run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.userId, productId])
            res.json({ success: true, message: 'Added to wishlist', inWishlist: true })
        }
    } catch (error) {
        console.error('Toggle wishlist error:', error)
        res.status(500).json({ success: false, message: 'Failed to toggle wishlist' })
    }
}

// Check if in wishlist
export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        const existing = await queryOne('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.userId, productId])

        res.json({ success: true, inWishlist: !!existing })
    } catch (error) {
        console.error('Check wishlist error:', error)
        res.status(500).json({ success: false, message: 'Failed to check wishlist' })
    }
}
