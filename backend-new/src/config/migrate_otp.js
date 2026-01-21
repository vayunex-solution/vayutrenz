import { exec, pool } from './database.js'

const migrateOtp = async () => {
    try {
        console.log('🔄 validting connection...')
        await pool.query('SELECT 1')
        console.log('✅ Connected to DB')

        console.log('🔄 Adding otp_code and otp_expires to users table...')

        // Add otp_code
        try {
            await exec(`ALTER TABLE users ADD COLUMN otp_code VARCHAR(6) NULL;`)
            console.log('✅ Added otp_code column')
        } catch (e) {
            if (e.message.includes("Duplicate column")) {
                console.log('⚠️ otp_code column already exists')
            } else {
                console.error('❌ Failed to add otp_code:', e.message)
            }
        }

        // Add otp_expires
        try {
            await exec(`ALTER TABLE users ADD COLUMN otp_expires TIMESTAMP NULL;`)
            console.log('✅ Added otp_expires column')
        } catch (e) {
            if (e.message.includes("Duplicate column")) {
                console.log('⚠️ otp_expires column already exists')
            } else {
                console.error('❌ Failed to add otp_expires:', e.message)
            }
        }

        console.log('✅ Migration complete!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

migrateOtp()
