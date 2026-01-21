import { query, run } from '../config/database.js'

export const getSiteSettings = async (req, res) => {
  try {
    const settings = await query('SELECT setting_key, setting_value, is_public FROM site_settings')
    
    // Convert to object
    const settingsObj = {}
    settings.forEach(item => {
      // Parse JSON if possible (for social links etc)
      try {
        if (item.setting_value.startsWith('{') || item.setting_value.startsWith('[')) {
            settingsObj[item.setting_key] = JSON.parse(item.setting_value)
        } else {
            settingsObj[item.setting_key] = item.setting_value
        }
      } catch (e) {
        settingsObj[item.setting_key] = item.setting_value
      }
    })

    res.status(200).json({ success: true, settings: settingsObj })
  } catch (error) {
    console.error('Get Settings Error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
}

export const updateSiteSettings = async (req, res) => {
  try {
    const updates = req.body // { site_title: '...', social_links: {...} }
    
    // Loop through updates
    for (const [key, value] of Object.entries(updates)) {
      // Stringify objects
      const finalValue = typeof value === 'object' ? JSON.stringify(value) : value
      
      // Update or Insert
      await run(`
        INSERT INTO site_settings (setting_key, setting_value) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP
      `, [key, finalValue])
    }

    res.status(200).json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update Settings Error:', error)
    res.status(500).json({ success: false, message: 'Failed to update settings' })
  }
}

export const getPublicSettings = async (req, res) => {
    try {
        const settings = await query('SELECT setting_key, setting_value FROM site_settings WHERE is_public = 1')
        const settingsObj = {}
        settings.forEach(item => {
            try {
                if (item.setting_value.startsWith('{') || item.setting_value.startsWith('[')) {
                    settingsObj[item.setting_key] = JSON.parse(item.setting_value)
                } else {
                    settingsObj[item.setting_key] = item.setting_value
                }
            } catch (e) {
                settingsObj[item.setting_key] = item.setting_value
            }
        })
        res.status(200).json({ success: true, settings: settingsObj })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching public settings' })
    }
}
