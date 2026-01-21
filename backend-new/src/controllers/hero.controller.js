import { query, run } from '../config/database.js'

// Get all active hero slides
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await query('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY created_at DESC')
    res.json({
      success: true,
      data: slides
    })
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Add a new hero slide (Seller/Admin)
export const addHeroSlide = async (req, res) => {
  try {
    const { title, subtitle, image_url, category_link, accent_color } = req.body
    
    if (!title || !subtitle || !image_url) {
      return res.status(400).json({ success: false, message: 'Please provide title, subtitle and image' })
    }

    const result = await run(
      'INSERT INTO hero_slides (title, subtitle, image_url, category_link, accent_color) VALUES (?, ?, ?, ?, ?)',
      [title, subtitle, image_url, category_link || '/products', accent_color || '#FFD700']
    )

    res.status(201).json({
      success: true,
      data: { id: result.lastInsertRowid, ...req.body },
      message: 'Hero slide created successfully'
    })
  } catch (error) {
    console.error('Error adding hero slide:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Delete a hero slide
export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params
    await run('DELETE FROM hero_slides WHERE id = ?', [id])
    res.json({ success: true, message: 'Slide deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
// Update a hero slide
export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params
    const { title, subtitle, image_url, category_link, accent_color, is_active } = req.body
    
    await run(`
      UPDATE hero_slides 
      SET title = ?, subtitle = ?, image_url = ?, category_link = ?, accent_color = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, subtitle, image_url, category_link, accent_color, is_active, id])

    res.json({ success: true, message: 'Slide updated successfully' })
  } catch (error) {
    console.error('Error updating slide:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
