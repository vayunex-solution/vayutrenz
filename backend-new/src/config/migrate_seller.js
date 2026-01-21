import { exec } from './database.js'

const migrateSeller = async () => {
  try {
    console.log('🔄 Creating seller_profiles table...')
    
    await exec(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        business_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        business_address TEXT NOT NULL,
        tax_id VARCHAR(100),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        logo_url VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)
    console.log('✅ Created seller_profiles table')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateSeller()
