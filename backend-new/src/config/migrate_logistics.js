import { exec } from './database.js'

const migrateLogistics = async () => {
    try {
        console.log('🔄 Creating logistics tables...')

        // Delivery Partners (Linked to Users, similar to Sellers)
        await exec(`
           CREATE TABLE IF NOT EXISTS delivery_partners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                vehicle_number VARCHAR(50),
                vehicle_type VARCHAR(50),
                phone VARCHAR(20),
                status ENUM('active', 'inactive') DEFAULT 'active',
                current_location VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
           );
        `)

        // Assign Delivery Partner to Order column
        // We need to check if column exists first or just try add
        try {
             await exec(`ALTER TABLE orders ADD COLUMN delivery_partner_id INT DEFAULT NULL;`)
        } catch (e) {}

        try {
             await exec(`ALTER TABLE orders ADD CONSTRAINT fk_order_delivery FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL;`)
        } catch (e) {}

        // Tracking Events
        await exec(`
           CREATE TABLE IF NOT EXISTS order_tracking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                location VARCHAR(255),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
           );
        `)

        console.log('✅ Logistics tables created')
        process.exit(0)
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}
migrateLogistics()
