import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { cacheUtils, invalidateCache } from '../lib/cache'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // Check auth on app load
  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, isAuthenticated: false })
      return
    }
    
    try {
      set({ isLoading: true })
      const { data } = await axiosInstance.get('/auth/me')
      set({ 
        user: data.data, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
  
  // Login
  login: async (email, password) => {
    try {
      set({ isLoading: true })
      const { data } = await axiosInstance.post('/auth/login', { email, password })
      
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      
      invalidateCache.onLogin()
      
      set({ 
        user: data.data, 
        isAuthenticated: true, 
        isLoading: false 
      })
      
      return { success: true, user: data.data }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  },
  
  // Register (Send OTP)
  register: async (email, password, name) => {
    try {
      set({ isLoading: true })
      const { data } = await axiosInstance.post('/auth/register', { 
        email, 
        password, 
        name 
      })
      
      set({ isLoading: false })
      return { success: true, message: data.message }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      set({ isLoading: true })
      const { data } = await axiosInstance.post('/auth/verify-otp', { email, otp })
      
      if (data.token) {
        localStorage.setItem('token', data.token)
        invalidateCache.onLogin()
        
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false 
        })
      }
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        message: error.response?.data?.message || 'Verification failed' 
      }
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      const { data } = await axiosInstance.post('/auth/resend-otp', { email })
      return { success: true, message: data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend OTP' 
      }
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.log('Logout error:', error)
    }
    
    localStorage.removeItem('token')
    invalidateCache.onLogout()
    
    set({ user: null, isAuthenticated: false })
  },
  
  // Update profile
  updateProfile: async (profileData) => {
    try {
      const { data } = await axiosInstance.put('/users/profile', profileData)
      set({ user: { ...get().user, ...profileData } })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      }
    }
  }
}))
