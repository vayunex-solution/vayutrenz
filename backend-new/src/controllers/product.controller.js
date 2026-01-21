import { query, queryOne, run } from '../config/database.js'

// Get all products with filters
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            gender,
            sort = 'newest',
            minPrice,
            maxPrice,
            search,
            featured,
            seller_id
        } = req.query

        const offset = (parseInt(page) - 1) * parseInt(limit)
        let whereClauses = ['p.is_active = 1']
        let params = []

        if (seller_id) {
            whereClauses.push('seller_id = ?')
            params.push(seller_id)
        }

        if (category) {
            whereClauses.push('category_id = (SELECT id FROM categories WHERE slug = ?)')
            params.push(category)
        }

        if (gender && gender !== 'all') {
            whereClauses.push("(gender = ? OR gender = 'unisex')")
            params.push(gender)
        }

        if (minPrice) {
            whereClauses.push('price >= ?')
            params.push(parseFloat(minPrice))
        }

        if (maxPrice) {
            whereClauses.push('price <= ?')
            params.push(parseFloat(maxPrice))
        }

        if (search) {
            whereClauses.push('(name LIKE ? OR description LIKE ? OR brand LIKE ?)')
            const searchTerm = `%${search}%`
            params.push(searchTerm, searchTerm, searchTerm)
        }

        if (featured === 'true') {
            whereClauses.push('is_featured = 1')
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

        let orderBy = 'ORDER BY created_at DESC'
        if (sort === 'price_low') orderBy = 'ORDER BY price ASC'
        else if (sort === 'price_high') orderBy = 'ORDER BY price DESC'
        else if (sort === 'rating') orderBy = 'ORDER BY rating DESC'
        else if (sort === 'newest') orderBy = 'ORDER BY created_at DESC'

        // Get total count
        const countResult = await queryOne(`SELECT COUNT(*) as total FROM products ${whereClause}`, params)
        const total = countResult?.total || 0

        // Get products
        const products = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset])

        // Format products
        const formattedProducts = products.map(p => ({
            ...p,
            image: p.primary_image,
            originalPrice: p.original_price,
            businessName: p.business_name,
            sizes: p.sizes ? p.sizes.split(',') : [],
            colors: p.colors ? p.colors.split(',') : [],
            images: p.images ? p.images.split(',') : []
        }))

        res.json({
            success: true,
            products: formattedProducts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        console.error('Get products error:', error)
        res.status(500).json({ success: false, message: 'Failed to get products' })
    }
}

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const { gender = 'all', limit = 10 } = req.query

        let whereClause = 'WHERE is_active = 1 AND is_featured = 1'
        let params = []

        if (gender && gender !== 'all') {
            whereClause += " AND (gender = ? OR gender = 'unisex')"
            params.push(gender)
        }

        const products = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY rating DESC
      LIMIT ?
    `, [...params, parseInt(limit)])

        const formattedProducts = products.map(p => ({
            ...p,
            image: p.primary_image,
            originalPrice: p.original_price,
            businessName: p.business_name
        }))

        res.json({ success: true, products: formattedProducts })
    } catch (error) {
        console.error('Get featured products error:', error)
        res.status(500).json({ success: false, message: 'Failed to get featured products' })
    }
}

// Get single product
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await queryOne(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `, [id])

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        // Format product
        const formattedProduct = {
            ...product,
            image: product.primary_image,
            originalPrice: product.original_price,
            businessName: product.business_name,
            sizes: product.sizes ? product.sizes.split(',') : [],
            colors: product.colors ? product.colors.split(',') : [],
            images: product.images ? product.images.split(',') : [product.primary_image]
        }

        res.json({ success: true, product: formattedProduct })
    } catch (error) {
        console.error('Get product error:', error)
        res.status(500).json({ success: false, message: 'Failed to get product' })
    }
}

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { q, limit = 20 } = req.query

        if (!q) {
            return res.json({ success: true, products: [] })
        }

        const searchTerm = `%${q}%`
        const products = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)
      ORDER BY p.rating DESC
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, parseInt(limit)])

        const formattedProducts = products.map(p => ({
            ...p,
            image: p.primary_image,
            originalPrice: p.original_price,
            businessName: p.business_name
        }))

        res.json({ success: true, products: formattedProducts })
    } catch (error) {
        console.error('Search products error:', error)
        res.status(500).json({ success: false, message: 'Failed to search products' })
    }
}

// Create Product
export const createProduct = async (req, res) => {
    try {
        const { 
            name, slug, description, price, original_price = null, 
            category_id, gender = 'unisex', brand, 
            primary_image, images = '', sizes = '', colors = '' 
        } = req.body

        let seller_id = null
        let business_name = 'VayuTrenz'

        // Determine seller
        if (req.user.role === 'seller') {
            const profile = await queryOne('SELECT id, business_name FROM seller_profiles WHERE user_id = ?', [req.user.id])
            if (!profile) return res.status(403).json({ success: false, message: 'Seller profile not found' })
            if (profile.status !== 'approved') return res.status(403).json({ success: false, message: 'Seller account not approved' })
            
            seller_id = profile.id
            business_name = profile.business_name
        } else if (req.user.role === 'admin') {
             // Admin creating product (optional logic)
        }

        const result = await run(`
            INSERT INTO products (
                name, slug, description, price, original_price, 
                category_id, gender, brand, seller_id, business_name,
                primary_image, images, sizes, colors, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            name, slug, description, price, original_price, 
            category_id, gender, brand, seller_id, business_name,
            primary_image, images, sizes, colors
        ])

        res.status(201).json({ success: true, message: 'Product created', id: result.lastInsertRowid })
    } catch (error) {
        console.error('Create product error:', error)
        res.status(500).json({ success: false, message: 'Failed to create product' })
    }
}

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        
        // Check ownership
        const product = await queryOne('SELECT seller_id FROM products WHERE id = ?', [id])
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

        if (req.user.role === 'seller') {
            const profile = await queryOne('SELECT id FROM seller_profiles WHERE user_id = ?', [req.user.id])
            if (!profile || product.seller_id !== profile.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' })
            }
        }

        // Build generic update query
        const allowedFields = ['name', 'description', 'price', 'original_price', 'category_id', 'gender', 'brand', 'primary_image', 'images', 'sizes', 'colors', 'is_active']
        let setClause = []
        let params = []

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                setClause.push(`${field} = ?`)
                params.push(updates[field])
            }
        })

        if (setClause.length === 0) return res.json({ success: true, message: 'No changes' })

        params.push(id)
        await run(`UPDATE products SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params)

        res.json({ success: true, message: 'Product updated' })
    } catch (error) {
        console.error('Update product error:', error)
        res.status(500).json({ success: false, message: 'Update failed' })
    }
}

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        // Check ownership
        const product = await queryOne('SELECT seller_id FROM products WHERE id = ?', [id])
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

        if (req.user.role === 'seller') {
            const profile = await queryOne('SELECT id FROM seller_profiles WHERE user_id = ?', [req.user.id])
            if (!profile || product.seller_id !== profile.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' })
            }
        }

        await run('DELETE FROM products WHERE id = ?', [id])
        res.json({ success: true, message: 'Product deleted' })
    } catch (error) {
        console.error('Delete product error:', error)
        res.status(500).json({ success: false, message: 'Delete failed' })
    }
}
