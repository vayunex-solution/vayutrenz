import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RefreshCw, Shield, Award, ChevronRight, ChevronLeft, Loader } from 'lucide-react'
import { useProductStore } from '../store/productStore'
import { useThemeStore } from '../store/themeStore'
import ProductCard from '../components/product/ProductCard'
import axiosInstance from '../lib/axios'

const Home = () => {
  const { featuredProducts, getFeaturedProducts, getCategories } = useProductStore()
  const { theme } = useThemeStore()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch Slides from Backend
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axiosInstance.get('/hero')
        const slidesData = res.data?.data || []
        if (res.data?.success && slidesData.length > 0) {
          setSlides(slidesData)
        } else {
            // Fallback if DB empty
            setSlides([
                { id: 1, title: 'FUTURE FASHION', subtitle: 'Experience the new era.', image_url: 'https://pngimg.com/d/running_shoes_PNG5816.png', accent_color: '#D4F804', category_link: '/products?category=sneakers' },
                { id: 2, title: 'URBAN STYLE', subtitle: 'Premium streetwear.', image_url: 'https://pngimg.com/d/jacket_PNG8050.png', accent_color: '#FF3B30', category_link: '/products?category=jackets' }
            ])
        }
      } catch (err) {
        console.error("Failed to fetch slides", err)
        // Fallback
        setSlides([
            { id: 1, title: 'FUTURE FASHION', subtitle: 'Experience the new era.', image_url: 'https://pngimg.com/d/running_shoes_PNG5816.png', accent_color: '#D4F804', category_link: '/products?category=sneakers' },
            { id: 2, title: 'URBAN STYLE', subtitle: 'Premium streetwear.', image_url: 'https://pngimg.com/d/jacket_PNG8050.png', accent_color: '#FF3B30', category_link: '/products?category=jackets' },
            { id: 3, title: 'TIMELESS LUXURY', subtitle: 'Accessories that define you.', image_url: 'https://pngimg.com/d/watches_PNG9866.png', accent_color: '#FFD700', category_link: '/products?category=accessories' }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchSlides()
    getFeaturedProducts('all', 10)
    getCategories('all')
    
    // Parallax
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides])
  
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const categories = [
    { name: 'Streetwear', image: 'https://images.pexels.com/photos/1670735/pexels-photo-1670735.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { name: 'Formal', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop' },
    { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=500&auto=format&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=500&auto=format&fit=crop' }
  ]
  
  if (loading) return <div className="loader-container"><Loader className="spin" size={40} /></div>

  return (
    <div className="home-page">
      {/* 🌟 GLOSSY CAROUSEL HERO (RESTORED DESIGN) */}
      <section className="hero-carousel glossy-hero">
        
        {/* Dynamic Background */}
        <div className="hero-gradient-bg" style={{
            background: `radial-gradient(circle at 50% 50%, ${slides[currentSlide].accent_color}20 0%, var(--color-bg) 100%)`
        }}></div>
        
        <div className="glass-particles"></div>

        <div className="hero-3d-content container">
          {/* Text Section */}
          <div 
            className="hero-text-3d"
            style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -2}deg) rotateY(${mousePos.x * 2}deg)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className={`slide-text-content ${index === currentSlide ? 'active' : ''}`}>
                <div className="glass-badge" style={{ 
                    color: slide.accent_color,
                    borderColor: `${slide.accent_color}40`,
                    background: `${slide.accent_color}10`
                }}>
                   NEW COLLECTION
                </div>
                <h1 className="hero-glitch-text" data-text={slide.title}>
                  {slide.title}
                </h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <Link 
                  to={slide.category_link} 
                  className="btn-glossy-primary"
                  style={{ 
                      boxShadow: `0 10px 30px ${slide.accent_color}40`,
                      background: `linear-gradient(135deg, ${slide.accent_color}, ${slide.accent_color}dd)` 
                  }}
                >
                  EXPLORE NOW
                </Link>
              </div>
            ))}
          </div>

          {/* 3D Product */}
          <div className="hero-product-3d">
            <div className="floating-card-container" style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * -5}deg)` }}>
              <div className="card-glow" style={{ background: slides[currentSlide].accent_color }}></div>
              <div className="glass-product-card">
                {slides.map((slide, index) => (
                  <img 
                    key={slide.id}
                    src={slide.image_url} 
                    alt={slide.title} 
                    className={`floating-product-img ${index === currentSlide ? 'active' : ''}`}
                    style={{ transform: `translateX(${mousePos.x * -10}px)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="slider-controls">
          <button onClick={prevSlide} className="slider-btn"><ChevronLeft /></button>
          <div className="slider-dots">
            {slides.map(( slide, idx) => (
              <span 
                key={slide.id} 
                className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                style={{ background: idx === currentSlide ? slide.accent_color : '' }}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="slider-btn"><ChevronRight /></button>
        </div>
      </section>
      
      {/* 🖼️ COLLECTIONS */}
      <section className="section cinematic-categories">
        <div className="section-header">
          <h2 className="section-title">THE COLLECTIONS</h2>
        </div>
        <div className="cinematic-grid">
          {categories.map((cat, index) => (
            <Link key={index} to={`/products?category=${cat.name.toLowerCase()}`} className="cinematic-card">
              <div className="cinematic-bg" style={{ backgroundImage: `url(${cat.image})` }}></div>
              <div className="cinematic-overlay"></div>
              <div className="cinematic-content">
                <h3>{cat.name}</h3>
                <span className="view-link">View Collection <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ⚡ TRENDING */}
      <section className="section bg-gradient-fade">
        <div className="container">
          <div className="section-header center-align">
            <h2 className="section-title">TRENDING NOW</h2>
            <div className="s-underline"></div>
          </div>
          <div className="product-grid">
            {featuredProducts.length > 0 ? featuredProducts.slice(0,8).map((product, index) => (
              <div key={product.id || index} className="product-card-3d-hover">
                <ProductCard product={product} />
              </div>
            )) : <p className="text-center text-muted">Loading trending items...</p>}
          </div>
        </div>
      </section>
        
      {/* 🏆 SERVICES */}
      <div className="services-banner">
        {[{icon: Truck, t: 'Fast Delivery'}, {icon: RefreshCw, t: 'Easy Returns'}, {icon: Shield, t: 'Secure Payment'}, {icon: Award, t: 'Premium Quality'}].map((s, i) => (
          <div key={i} className="service-item">
            <s.icon size={32} />
            <div>
              <h4>{s.t}</h4>
              <p>Top Notch Service</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home

