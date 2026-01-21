import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Start server
const startServer = async () => {
  try {
    // Initialize database FIRST before importing routes
    const { initDb, testConnection } = await import('./config/database.js')
    await initDb()

    // Now import routes (which import controllers that use db)
    const authRoutes = (await import('./routes/auth.routes.js')).default
    const productRoutes = (await import('./routes/product.routes.js')).default
    const categoryRoutes = (await import('./routes/category.routes.js')).default
    const cartRoutes = (await import('./routes/cart.routes.js')).default
    const wishlistRoutes = (await import('./routes/wishlist.routes.js')).default
    const userRoutes = (await import('./routes/user.routes.js')).default
    const orderRoutes = (await import('./routes/order.routes.js')).default
    const heroRoutes = (await import('./routes/hero.routes.js')).default
    const cmsRoutes = (await import('./routes/cms.routes.js')).default
    const contactRoutes = (await import('./routes/contact.routes.js')).default
    const sellerRoutes = (await import('./routes/seller.routes.js')).default
    const deliveryRoutes = (await import('./routes/delivery.routes.js')).default

    // Mount routes
    app.use('/api/auth', authRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/categories', categoryRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/wishlist', wishlistRoutes)
    app.use('/api/orders', orderRoutes)
    app.use('/api/hero', heroRoutes)
    app.use('/api/cms', cmsRoutes)
    app.use('/api/contact', contactRoutes)
    app.use('/api/seller', sellerRoutes)
    app.use('/api/delivery', deliveryRoutes)

    // Error handlers (MUST be after routes)
    app.use((err, req, res, next) => {
      console.error('Error:', err)
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
      })
    })

    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' })
    })

    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => {
      console.log(`
  =========================================
  🚀 E-commerce API Server
  =========================================
  📍 Port: ${PORT}
  📍 Environment: ${process.env.NODE_ENV || 'development'}
  📍 Database: MySQL (Remote: 65.108.76.42)
  📍 Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}
  =========================================
      `)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
