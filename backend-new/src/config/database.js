import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL Database connected successfully!')
    console.log(`   Host: ${process.env.DB_HOST}`)
    console.log(`   Database: ${process.env.DB_NAME}`)
    connection.release()
    return true
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message)
    return false
  }
}

// Query helper - returns array of rows
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Query error:', sql, error.message)
    throw error
  }
}

// Get single row
const queryOne = async (sql, params = []) => {
  const results = await query(sql, params)
  return results[0] || null
}

// Run statement (INSERT, UPDATE, DELETE)
const run = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params)
    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows
    }
  } catch (error) {
    console.error('Run error:', sql, error.message)
    throw error
  }
}

// Execute raw SQL
const exec = async (sql, params = []) => {
  try {
    await pool.query(sql, params)
  } catch (error) {
    console.error('Exec error:', error.message)
    throw error
  }
}

// Call stored procedure
const callProcedure = async (procedureName, params = []) => {
  try {
    const placeholders = params.map(() => '?').join(', ')
    const sql = `CALL ${procedureName}(${placeholders})`
    const [results] = await pool.query(sql, params)
    return results
  } catch (error) {
    console.error(`Procedure ${procedureName} error:`, error.message)
    throw error
  }
}

// Initialize database tables
const initTables = async () => {
  console.log('🔄 Initializing MySQL tables...')

  try {
    // Users table
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('user', 'seller', 'admin') DEFAULT 'user',
        avatar VARCHAR(500),
        gender ENUM('male', 'female', 'other'),
        date_of_birth DATE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Categories table
    await exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(500),
        gender ENUM('men', 'women', 'unisex') DEFAULT 'unisex',
        parent_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Products table
    await exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        discount INT DEFAULT 0,
        category_id INT,
        brand VARCHAR(100),
        business_name VARCHAR(200),
        gender ENUM('male', 'female', 'unisex') DEFAULT 'unisex',
        stock INT DEFAULT 0,
        rating DECIMAL(2,1) DEFAULT 0,
        rating_count INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        offer VARCHAR(100),
        primary_image VARCHAR(500),
        images TEXT,
        sizes VARCHAR(255),
        colors VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Cart items table
    await exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        size VARCHAR(20),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Wishlist table
    await exec(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_wishlist (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Addresses table
    await exec(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        street VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        country VARCHAR(50) DEFAULT 'India',
        landmark VARCHAR(255),
        address_type ENUM('home', 'office', 'other') DEFAULT 'home',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Orders table
    await exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        address_id INT,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping_fee DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        order_status ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'placed',
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Order items table
    await exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        size VARCHAR(20),
        color VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Hero slides table
    await exec(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        button_text VARCHAR(100),
        button_link VARCHAR(255),
        image VARCHAR(500),
        bg_color VARCHAR(7),
        text_color VARCHAR(7) DEFAULT '#000000',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('✅ MySQL Tables initialized!')
    return true
  } catch (error) {
    console.error('❌ Table initialization error:', error.message)
    return false
  }
}

// Seed sample data
const seedData = async () => {
  try {
    // Check if data exists
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM products')
    if (countResult[0].count > 0) {
      console.log('📦 Sample data already exists')
      return
    }

    console.log('📦 Seeding sample data...')

    // Seed categories
    const categories = [
      ['T-Shirts', 't-shirts', 'Trendy t-shirts', 'unisex'],
      ['Shirts', 'shirts', 'Formal and casual shirts', 'unisex'],
      ['Jeans', 'jeans', 'Denim jeans', 'unisex'],
      ['Dresses', 'dresses', 'Beautiful dresses', 'women'],
      ['Sneakers', 'sneakers', 'Stylish sneakers', 'unisex'],
      ['Jackets', 'jackets', 'Jackets and outerwear', 'unisex'],
      ['Accessories', 'accessories', 'Fashion accessories', 'unisex']
    ]

    for (const [name, slug, desc, gender] of categories) {
      await run('INSERT INTO categories (name, slug, description, gender) VALUES (?, ?, ?, ?)', [name, slug, desc, gender])
    }

    // Seed products
    const products = [
      ['Mens Graphic Oversized T-Shirt', 599, 1299, 54, 1, 'BEWAKOOF', 'male', 4.2, 1, 'OVERSIZED FIT', 'https://picsum.photos/seed/tshirt1/400/500'],
      ['Mens Black Slim Fit Jeans', 999, 1999, 50, 3, 'ROADSTER', 'male', 4.5, 1, null, 'https://picsum.photos/seed/jeans1/400/500'],
      ['Mens White Classic Sneakers', 1499, 2999, 50, 5, 'PUMA', 'male', 4.3, 1, 'BESTSELLER', 'https://picsum.photos/seed/shoes1/400/500'],
      ['Womens Floral Print Dress', 899, 1599, 44, 4, 'SASSAFRAS', 'female', 4.6, 1, null, 'https://picsum.photos/seed/dress1/400/500'],
      ['Mens Navy Blue Polo T-Shirt', 449, 999, 55, 1, 'HRX', 'male', 4.1, 1, null, 'https://picsum.photos/seed/polo1/400/500'],
      ['Womens Crop Top', 399, 799, 50, 1, 'ONLY', 'female', 4.4, 1, 'TRENDING', 'https://picsum.photos/seed/crop1/400/500'],
      ['Mens Casual Jacket', 1299, 2499, 48, 6, 'WROGN', 'male', 4.3, 0, null, 'https://picsum.photos/seed/jacket1/400/500'],
      ['Unisex Sports Watch', 799, 1499, 47, 7, 'FASTRACK', 'unisex', 4.0, 0, null, 'https://picsum.photos/seed/watch1/400/500'],
      ['Mens Printed Shirt', 699, 1399, 50, 2, 'HIGHLANDER', 'male', 4.2, 0, null, 'https://picsum.photos/seed/shirt1/400/500'],
      ['Womens Denim Jacket', 1199, 2199, 45, 6, 'LEVIS', 'female', 4.7, 1, 'NEW ARRIVAL', 'https://picsum.photos/seed/djacket1/400/500']
    ]

    for (const [name, price, origPrice, discount, catId, brand, gender, rating, featured, offer, image] of products) {
      await run(
        'INSERT INTO products (name, price, original_price, discount, category_id, brand, business_name, gender, rating, is_featured, offer, primary_image, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 100, 1)',
        [name, price, origPrice, discount, catId, brand, brand, gender, rating, featured, offer, image]
      )
    }

    // Seed hero slides
    const heroSlides = [
      ['FUTURE FASHION', 'Experience the new era of style', 'EXPLORE NOW', '/products', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', '#c8e6a0', '#000000'],
      ['STREET STYLE', 'Urban fashion redefined', 'SHOP NOW', '/products?category=sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772', '#1a1a1a', '#ffffff'],
      ['SUMMER VIBES', 'Cool looks for hot days', 'VIEW COLLECTION', '/products?gender=female', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', '#fff5e6', '#000000']
    ]

    for (const [title, subtitle, btnText, btnLink, image, bgColor, textColor] of heroSlides) {
      await run(
        'INSERT INTO hero_slides (title, subtitle, button_text, button_link, image, bg_color, text_color) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, subtitle, btnText, btnLink, image, bgColor, textColor]
      )
    }

    console.log('✅ Sample data seeded successfully!')
  } catch (error) {
    console.error('❌ Seed error:', error.message)
  }
}

// Initialize database
const initDb = async () => {
  const connected = await testConnection()
  if (connected) {
    await initTables()
    await seedData()
  }
  return connected
}

export { pool, initDb, query, queryOne, run, exec, callProcedure, testConnection }
export default { pool, initDb, query, queryOne, run, exec, callProcedure, testConnection }
