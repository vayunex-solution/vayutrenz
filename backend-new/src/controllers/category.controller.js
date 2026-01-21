import { query, queryOne, run } from '../config/database.js'

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const { gender = 'all' } = req.query

        let whereClause = 'WHERE is_active = 1'
        let params = []

        if (gender && gender !== 'all') {
            whereClause += " AND (gender = ? OR gender = 'unisex')"
            params.push(gender)
        }

        const categories = await query(`
      SELECT * FROM categories ${whereClause} ORDER BY name ASC
    `, params)

        res.json({ success: true, categories })
    } catch (error) {
        console.error('Get categories error:', error)
        res.status(500).json({ success: false, message: 'Failed to get categories' })
    }
}

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params

        const category = await queryOne('SELECT * FROM categories WHERE slug = ? AND is_active = 1', [slug])

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' })
        }

        res.json({ success: true, category })
    } catch (error) {
        console.error('Get category error:', error)
        res.status(500).json({ success: false, message: 'Failed to get category' })
    }
}

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, image_url, gender = 'unisex', is_active = 1 } = req.body

        if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and Slug required' })

        const result = await run(`
            INSERT INTO categories (name, slug, description, image_url, gender, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, slug, description, image_url, gender, is_active])

        res.status(201).json({ success: true, message: 'Category created', id: result.lastInsertRowid })
    } catch (error) {
        console.error('Create category error:', error)
        res.status(500).json({ success: false, message: 'Failed to create category' })
    }
}

// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, slug, description, image_url, gender, is_active } = req.body

        await run(`
            UPDATE categories 
            SET name = ?, slug = ?, description = ?, image_url = ?, gender = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, slug, description, image_url, gender, is_active, id])

        res.json({ success: true, message: 'Category updated' })
    } catch (error) {
        console.error('Update category error:', error)
        res.status(500).json({ success: false, message: 'Update failed' })
    }
}

// Delete Category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        // Check for products
        const products = await queryOne('SELECT count(*) as count FROM products WHERE category_id = ?', [id])
        if (products && products.count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete category with products' })
        }

        await run('DELETE FROM categories WHERE id = ?', [id])
        res.json({ success: true, message: 'Category deleted' })
    } catch (error) {
        console.error('Delete category error:', error)
        res.status(500).json({ success: false, message: 'Delete failed' })
    }
}
