import { exec } from './database.js'

const migrateSellerProducts = async () => {
    try {
        console.log('🔄 Adding seller_id to products...')

        // Add seller_id column if not exists
        // Since we can't easily check column existence, we'll try adding it and ignore error if it exists
        // But for safety, let's assume it doesn't exist or use a safer query if possible in mysql

        // We will try to add it. If it fails (duplicate column), we catch it.
        await exec(`
           ALTER TABLE products
           ADD COLUMN seller_id INT,
           ADD CONSTRAINT fk_products_seller
           FOREIGN KEY (seller_id) REFERENCES seller_profiles(id)
           ON DELETE SET NULL;
        `)

        console.log('✅ Added seller_id to products')
        process.exit(0)
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
            console.log('⚠️ seller_id already exists')
            process.exit(0)
        }
        console.error('Migration failed:', error)
        process.exit(1)
    }
}
migrateSellerProducts()
