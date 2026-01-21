import { run, initDb } from './src/config/database.js'
import bcrypt from 'bcryptjs'

const createAdmin = async () => {
    try {
        await initDb()
        
        const email = 'admin@vayutrenz.com'
        const password = 'admin123'
        const hashedPassword = await bcrypt.hash(password, 10)
        
        console.log(`Creating admin: ${email}`)

        // Check if exists
        // We use INSERT IGNORE or just try/catch
        try {
            await run(`
                INSERT INTO users (name, email, password, role, is_verified)
                VALUES ('Super Admin', ?, ?, 'admin', 1)
            `, [email, hashedPassword])
            console.log('✅ Admin created successfully')
        } catch (e) {
            console.log('⚠️ Admin might already exist:', e.message)
            // Update role if exists
            await run(`UPDATE users SET role='admin' WHERE email=?`, [email])
            console.log('✅ Updated existing user to admin')
        }
        
        process.exit(0)
    } catch (e) {
        console.error('❌ Failed:', e)
        process.exit(1)
    }
}

createAdmin()
