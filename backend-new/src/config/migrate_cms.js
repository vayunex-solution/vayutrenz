import { exec, pool } from './database.js'

const migrateCms = async () => {
  try {
    console.log('🔄 Connected to DB')

    console.log('🔄 Creating site_settings table...')
    
    await exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        description VARCHAR(255),
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Created site_settings table')

    // Seed default data
    console.log('🔄 Seeding default settings...')
    const defaults = [
        ['site_logo', '/logo.png', 'Website Logo', 1],
        ['site_title', 'VayuTrenz', 'Website Title', 1],
        ['contact_email', 'support@vayutrenz.com', 'Contact Email', 1],
        ['contact_phone', '+91 9876543210', 'Contact Phone', 1],
        ['social_links', JSON.stringify({ facebook: '', instagram: '', twitter: '' }), 'Social Media Links', 1],
        ['shipping_fee', '50', 'Standard Shipping Fee', 1],
        ['free_shipping_threshold', '1000', 'Free Shipping Amount', 1]
    ]

    for (const [key, value, desc, isPublic] of defaults) {
        try {
            await exec(`
                INSERT INTO site_settings (setting_key, setting_value, description, is_public) 
                VALUES (?, ?, ?, ?)
            `, [key, value, desc, isPublic])
            console.log(`   - Added ${key}`)
        } catch (e) {
            if (e.message.includes('Duplicate entry')) {
                console.log(`   - ${key} already exists`)
            } else {
                console.error(`   - Failed to add ${key}:`, e.message)
            }
        }
    }

    // Create Contact Messages Table
    await exec(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            subject VARCHAR(200),
            message TEXT NOT NULL,
            status ENUM('new', 'read', 'replied') DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `)
    console.log('✅ Created contact_messages table')

    console.log('✅ CMS Migration complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateCms()
