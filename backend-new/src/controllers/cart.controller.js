import { query, queryOne, run } from '../config/database.js'

// Get cart
export const getCart = async (req, res) => {
    try {
        const items = await query(`
      SELECT ci.id as cart_item_id, ci.quantity, ci.size, ci.color,
             p.id, p.name, p.price, p.original_price, p.primary_image, p.brand, p.business_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [req.userId])

        const formattedItems = items.map(item => ({
            cart_item_id: item.cart_item_id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            product: {
                id: item.id,
                name: item.name,
                price: item.price,
                originalPrice: item.original_price,
                image: item.primary_image,
                brand: item.brand,
                businessName: item.business_name
            }
        }))

        res.json({ success: true, items: formattedItems })
    } catch (error) {
        console.error('Get cart error:', error)
        res.status(500).json({ success: false, message: 'Failed to get cart' })
    }
}

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size, color } = req.body

        // Check if product exists
        const product = await queryOne('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId])
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        // Check if item already in cart
        const existingItem = await queryOne(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.userId, productId]
        )

        if (existingItem) {
            // Update quantity
            await run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existingItem.id])
        } else {
            // Insert new item
            await run('INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
                [req.userId, productId, quantity, size || null, color || null])
        }

        res.json({ success: true, message: 'Item added to cart' })
    } catch (error) {
        console.error('Add to cart error:', error)
        res.status(500).json({ success: false, message: 'Failed to add to cart' })
    }
}

// Update cart item
export const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params
        const { quantity } = req.body

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' })
        }

        await run('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, req.userId])

        res.json({ success: true, message: 'Cart updated' })
    } catch (error) {
        console.error('Update cart error:', error)
        res.status(500).json({ success: false, message: 'Failed to update cart' })
    }
}

// Remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params

        await run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.userId])

        res.json({ success: true, message: 'Item removed from cart' })
    } catch (error) {
        console.error('Remove from cart error:', error)
        res.status(500).json({ success: false, message: 'Failed to remove from cart' })
    }
}

// Clear cart
export const clearCart = async (req, res) => {
    try {
        await run('DELETE FROM cart_items WHERE user_id = ?', [req.userId])

        res.json({ success: true, message: 'Cart cleared' })
    } catch (error) {
        console.error('Clear cart error:', error)
        res.status(500).json({ success: false, message: 'Failed to clear cart' })
    }
}
