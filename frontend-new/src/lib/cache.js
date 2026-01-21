// Cache utility with TTL (Time To Live)
const CACHE_PREFIX = 'luxe_'

export const cacheUtils = {
  // Set data with TTL (in minutes)
  set: (key, data, ttlMinutes = 60) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (ttlMinutes * 60 * 1000)
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
    } catch (error) {
      console.warn('Cache set failed:', error)
    }
  },

  // Get data if not expired
  get: (key) => {
    try {
      const itemStr = localStorage.getItem(CACHE_PREFIX + key)
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr)
      if (Date.now() > item.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key)
        return null
      }
      return item.data
    } catch (error) {
      console.warn('Cache get failed:', error)
      return null
    }
  },

  // Check if cache exists and is valid
  isValid: (key) => {
    return cacheUtils.get(key) !== null
  },

  // Remove specific cache
  remove: (key) => {
    localStorage.removeItem(CACHE_PREFIX + key)
  },

  // Clear all app cache
  clearAll: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  },

  // Get cache age in minutes
  getAge: (key) => {
    try {
      const itemStr = localStorage.getItem(CACHE_PREFIX + key)
      if (!itemStr) return null
      const item = JSON.parse(itemStr)
      return Math.floor((Date.now() - item.timestamp) / 60000)
    } catch {
      return null
    }
  }
}

// Cache key patterns
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  CATEGORIES_GENDER: (gender) => `categories_${gender}`,
  FEATURED_PRODUCTS: (gender) => `featured_${gender}`,
  PRODUCTS_LIST: (page, gender, sort) => `products_${page}_${gender}_${sort}`,
  PRODUCT_DETAIL: (id) => `product_${id}`,
  CART: 'cart',
  WISHLIST: 'wishlist',
  USER_PROFILE: 'user_profile',
  SEARCH_RESULTS: (query) => `search_${query.toLowerCase().replace(/\s+/g, '_')}`
}

// Cache invalidation helpers
export const invalidateCache = {
  onLogin: () => {
    cacheUtils.remove('cart')
    cacheUtils.remove('wishlist')
    cacheUtils.remove('user_profile')
  },
  
  onLogout: () => {
    cacheUtils.remove('cart')
    cacheUtils.remove('wishlist')
    cacheUtils.remove('user_profile')
  },
  
  onOrderPlaced: () => {
    cacheUtils.remove('cart')
  },
  
  onProductUpdated: (productId) => {
    cacheUtils.remove(`product_${productId}`)
    Object.keys(localStorage)
      .filter(key => key.startsWith('luxe_products_'))
      .forEach(key => localStorage.removeItem(key))
  },
  
  onCategoryUpdated: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('luxe_categories'))
      .forEach(key => localStorage.removeItem(key))
  }
}

export default cacheUtils
