import { exec, run, query, queryOne, saveDb } from './database.js'

const initDatabase = async () => {
  console.log('🔄 Initializing SQLite database...')

  // Users table
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Categories table
  exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      gender TEXT DEFAULT 'unisex',
      parent_id INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Products table
  exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      discount INTEGER DEFAULT 0,
      category_id INTEGER,
      brand TEXT,
      business_name TEXT,
      gender TEXT DEFAULT 'unisex',
      stock INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      offer TEXT,
      primary_image TEXT,
      images TEXT,
      sizes TEXT,
      colors TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Cart table
  exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      size TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Wishlist table
  exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Addresses table
  exec(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Orders table
  exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_number TEXT NOT NULL,
      total_amount REAL NOT NULL,
      shipping_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      address_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Order items table
  exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      size TEXT,
      color TEXT
    )
  `)


  // Hero Slides table (Dynamic Carousel)
  exec(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category_link TEXT NOT NULL,
      accent_color TEXT DEFAULT '#FFD700',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ All tables created!')

  // Insert sample data
  await insertSampleData()
  await insertHeroSlides()
}

const insertHeroSlides = async () => {
    const existing = queryOne('SELECT COUNT(*) as count FROM hero_slides')
    if (existing && existing.count > 0) return

    console.log('📦 Seeding hero slides...')
    const slides = [
        ['FUTURE FOOTWEAR', 'Experience the new era of speed.', 'https://pngimg.com/d/running_shoes_PNG5816.png', '/products?category=sneakers', '#D4F804'],
        ['URBAN AESTHETIC', 'Premium streetwear for the bold.', 'https://pngimg.com/d/jacket_PNG8050.png', '/products?category=jackets', '#FF3B30'],
        ['TIMELESS LUXURY', 'Accessories that define you.', 'https://pngimg.com/d/watches_PNG9866.png', '/products?category=accessories', '#FFD700']
    ]

    slides.forEach(slide => {
        run('INSERT INTO hero_slides (title, subtitle, image_url, category_link, accent_color) VALUES (?, ?, ?, ?, ?)', slide)
    })
    console.log('✅ Hero slides seeded!')
}

const insertSampleData = async () => {
  // Check if data already exists
  const existing = queryOne('SELECT COUNT(*) as count FROM products')
  if (existing && existing.count > 0) {
    console.log('📦 Sample data already exists, skipping...')
    return
  }

  console.log('📦 Inserting sample data...')

  // Insert categories
  const categories = [
    ['T-Shirts', 't-shirts', 'Trendy t-shirts for all occasions', 'unisex'],
    ['Shirts', 'shirts', 'Formal and casual shirts', 'unisex'],
    ['Jeans', 'jeans', 'Denim jeans and pants', 'unisex'],
    ['Dresses', 'dresses', 'Beautiful dresses for women', 'female'],
    ['Sneakers', 'sneakers', 'Stylish sneakers and shoes', 'unisex'],
    ['Jackets', 'jackets', 'Jackets and outerwear', 'unisex'],
    ['Accessories', 'accessories', 'Fashion accessories', 'unisex']
  ]

  categories.forEach(cat => {
    run('INSERT INTO categories (name, slug, description, gender) VALUES (?, ?, ?, ?)', cat)
  })

  // Insert products
  const products = [
    ['Mens Graphic Oversized T-Shirt', 'mens-graphic-tshirt', 'Premium cotton oversized t-shirt', 599, 1299, 54, 1, 'BEWAKOOF', 'BEWAKOOF', 'male', 100, 4.2, 1, 'OVERSIZED FIT', 'https://picsum.photos/seed/tshirt1/400/500', 'S,M,L,XL,XXL', 'Black,White,Navy'],
    ['Mens Black Slim Fit Jeans', 'mens-black-jeans', 'Comfortable slim fit jeans', 999, 1999, 50, 3, 'ROADSTER', 'ROADSTER', 'male', 80, 4.5, 1, null, 'https://picsum.photos/seed/jeans1/400/500', '28,30,32,34,36', 'Black,Blue'],
    ['Mens White Classic Sneakers', 'mens-white-sneakers', 'Classic white sneakers', 1499, 2999, 50, 5, 'PUMA', 'PUMA', 'male', 60, 4.3, 1, 'BESTSELLER', 'https://picsum.photos/seed/shoes1/400/500', '6,7,8,9,10,11', 'White,Black'],
    ['Womens Floral Print Dress', 'womens-floral-dress', 'Beautiful floral print dress', 899, 1599, 44, 4, 'SASSAFRAS', 'SASSAFRAS', 'female', 50, 4.6, 1, null, 'https://picsum.photos/seed/dress1/400/500', 'XS,S,M,L,XL', 'Black,Red,Blue'],
    ['Mens Navy Blue Polo T-Shirt', 'mens-navy-polo', 'Classic polo t-shirt', 449, 999, 55, 1, 'HRX', 'HRX', 'male', 120, 4.1, 1, null, 'https://picsum.photos/seed/polo1/400/500', 'S,M,L,XL', 'Navy,White,Black'],
    ['Womens Crop Top', 'womens-crop-top', 'Stylish crop top', 399, 799, 50, 1, 'ONLY', 'ONLY', 'female', 90, 4.4, 1, 'TRENDING', 'https://picsum.photos/seed/crop1/400/500', 'XS,S,M,L', 'White,Black,Pink'],
    ['Mens Casual Jacket', 'mens-casual-jacket', 'Lightweight jacket', 1299, 2499, 48, 6, 'WROGN', 'WROGN', 'male', 40, 4.3, 0, null, 'https://picsum.photos/seed/jacket1/400/500', 'S,M,L,XL,XXL', 'Black,Olive,Navy'],
    ['Unisex Sports Watch', 'unisex-sports-watch', 'Digital sports watch', 799, 1499, 47, 7, 'FASTRACK', 'FASTRACK', 'unisex', 70, 4.0, 0, null, 'https://picsum.photos/seed/watch1/400/500', 'One Size', 'Black,Blue,Red'],
    ['Mens Printed Shirt', 'mens-printed-shirt', 'Casual printed shirt', 699, 1399, 50, 2, 'HIGHLANDER', 'HIGHLANDER', 'male', 55, 4.2, 0, null, 'https://picsum.photos/seed/shirt1/400/500', 'S,M,L,XL,XXL', 'White,Blue,Black'],
    ['Womens Denim Jacket', 'womens-denim-jacket', 'Classic denim jacket', 1199, 2199, 45, 6, 'LEVIS', 'LEVIS', 'female', 35, 4.7, 1, 'NEW ARRIVAL', 'https://picsum.photos/seed/djacket1/400/500', 'XS,S,M,L,XL', 'Blue,Light Blue']
  ]

  products.forEach(prod => {
    run(`INSERT INTO products (name, slug, description, price, original_price, discount, category_id, brand, business_name, gender, stock, rating, is_featured, offer, primary_image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, prod)
  })

  console.log('✅ Sample data inserted!')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${products.length} products`)
}

export default initDatabase
