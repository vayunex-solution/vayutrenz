import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { cacheUtils, CACHE_KEYS } from '../lib/cache'

export const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  product: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0
  },
  
  // Get all products with caching
  getProducts: async ({ page = 1, limit = 12, gender = 'all', sort = 'newest', category = null } = {}) => {
    const cacheKey = CACHE_KEYS.PRODUCTS_LIST(page, gender, sort)
    
    // Check cache first
    const cached = cacheUtils.get(cacheKey)
    if (cached && !category) {
      set({ 
        products: cached.data, 
        pagination: cached.pagination,
        loading: false 
      })
      
      // Background refresh if cache is old (> 15 min)
      if (cacheUtils.getAge(cacheKey) > 15) {
        get().refreshProducts({ page, limit, gender, sort })
      }
      return cached
    }
    
    set({ loading: true, error: null })
    
    try {
      const params = { page, limit, gender, sort }
      if (category) params.category = category
      
      const { data } = await axiosInstance.get('/products', { params })
      
      // Cache the result (without category filter)
      if (!category) {
        cacheUtils.set(cacheKey, {
          data: data.data,
          pagination: data.pagination
        }, 30) // 30 min cache
      }
      
      set({ 
        products: data.data, 
        pagination: data.pagination,
        loading: false 
      })
      
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
  
  // Silent background refresh
  refreshProducts: async (params) => {
    try {
      const { data } = await axiosInstance.get('/products', { params })
      const cacheKey = CACHE_KEYS.PRODUCTS_LIST(params.page, params.gender, params.sort)
      cacheUtils.set(cacheKey, {
        data: data.data,
        pagination: data.pagination
      }, 30)
      set({ products: data.data, pagination: data.pagination })
    } catch (error) {
      console.log('Background refresh failed:', error)
    }
  },
  
  // Get featured products with caching
  getFeaturedProducts: async (gender = 'all', limit = 8) => {
    const cacheKey = CACHE_KEYS.FEATURED_PRODUCTS(gender)
    
    const cached = cacheUtils.get(cacheKey)
    if (cached) {
      set({ featuredProducts: cached, loading: false })
      
      if (cacheUtils.getAge(cacheKey) > 30) {
        get().refreshFeaturedProducts(gender, limit)
      }
      return cached
    }
    
    set({ loading: true })
    
    try {
      const { data } = await axiosInstance.get('/products/featured', {
        params: { gender, limit }
      })
      
      cacheUtils.set(cacheKey, data.data, 60) // 1 hour cache
      set({ featuredProducts: data.data, loading: false })
      
      return data.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  
  // Background refresh for featured
  refreshFeaturedProducts: async (gender, limit) => {
    try {
      const { data } = await axiosInstance.get('/products/featured', {
        params: { gender, limit }
      })
      cacheUtils.set(CACHE_KEYS.FEATURED_PRODUCTS(gender), data.data, 60)
      set({ featuredProducts: data.data })
    } catch (error) {
      console.log('Background refresh failed:', error)
    }
  },
  
  // Get single product with caching
  getProductById: async (id) => {
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(id)
    
    const cached = cacheUtils.get(cacheKey)
    if (cached) {
      set({ product: cached, loading: false })
      return cached
    }
    
    set({ loading: true, product: null })
    
    try {
      const { data } = await axiosInstance.get(`/products/${id}`)
      
      cacheUtils.set(cacheKey, data.data, 60) // 1 hour cache
      set({ product: data.data, loading: false })
      
      return data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
  
  // Search products
  searchProducts: async (query, page = 1, limit = 12) => {
    set({ loading: true })
    
    try {
      const { data } = await axiosInstance.get('/products/search', {
        params: { q: query, page, limit }
      })
      
      set({ 
        products: data.data,
        pagination: data.pagination,
        loading: false 
      })
      
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
  
  // Get categories with caching
  getCategories: async (gender = 'all') => {
    const cacheKey = CACHE_KEYS.CATEGORIES_GENDER(gender)
    
    const cached = cacheUtils.get(cacheKey)
    if (cached) {
      set({ categories: cached })
      return cached
    }
    
    try {
      const { data } = await axiosInstance.get('/categories', {
        params: { gender }
      })
      
      cacheUtils.set(cacheKey, data.data, 1440) // 24 hour cache
      set({ categories: data.data })
      
      return data.data
    } catch (error) {
      console.error('Get categories error:', error)
      return []
    }
  },
  
  // Clear product
  clearProduct: () => set({ product: null })
}))
