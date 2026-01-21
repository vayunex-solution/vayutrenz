import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CursorGlow from './components/layout/CursorGlow'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Wishlist from './pages/Wishlist'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import Account from './pages/Account'
import Contact from './pages/Contact'
import SellerRegistration from './pages/seller/SellerRegistration'
import SellerDashboard from './pages/seller/SellerDashboard'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'
import OrderTracking from './pages/OrderTracking'
import AdminDashboard from './pages/admin/AdminDashboard'

// Store
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

function App() {
  const { checkAuth } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => {
    checkAuth()
    initTheme()
  }, [])

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collection/*" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/become-seller" element={<SellerRegistration />} />
          <Route path="/seller/*" element={<SellerDashboard />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/myaccount" element={<Account />} />
          <Route path="/account/*" element={<Account />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
