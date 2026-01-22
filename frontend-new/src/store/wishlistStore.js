import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      
      // Fetch wishlist from server
      fetchWishlist: async () => {
        try {
          set({ loading: true })
          const { data } = await axiosInstance.get('/wishlist')
          set({ items: data.data, loading: false })
          return data.data
        } catch (error) {
          set({ loading: false })
          console.log('Fetch wishlist error:', error)
        }
      },
      
      // Toggle wishlist (add/remove)
      toggleWishlist: async (product) => {
        const isInWishlist = get().isInWishlist(product.id)
        
        if (isInWishlist) {
          // Remove
          set(state => ({
            items: state.items.filter(item => item.product_id !== product.id)
          }))
          toast.success('Removed from wishlist')
        } else {
          // Add
          set(state => ({
            items: [...state.items, { 
              product_id: product.id, 
              product,
              added_at: new Date().toISOString()
            }]
          }))
          toast.success('Added to wishlist!')
        }
        
        // Sync with server
        try {
          await axiosInstance.post('/wishlist/toggle', { productId: product.id })
        } catch (error) {
          console.log('Wishlist sync failed:', error)
        }
      },
      
      // Add to wishlist
      addToWishlist: async (product) => {
        if (get().isInWishlist(product.id)) return
        
        set(state => ({
          items: [...state.items, { 
            product_id: product.id, 
            product,
            added_at: new Date().toISOString()
          }]
        }))
        
        toast.success('Added to wishlist!')
        
        try {
          await axiosInstance.post('/wishlist/add', { productId: product.id })
        } catch (error) {
          console.log('Add to wishlist failed:', error)
        }
      },
      
      // Remove from wishlist
      removeFromWishlist: async (productId) => {
        set(state => ({
          items: state.items.filter(item => item.product_id !== productId)
        }))
        
        toast.success('Removed from wishlist')
        
        try {
          await axiosInstance.delete(`/wishlist/${productId}`)
        } catch (error) {
          console.log('Remove from wishlist failed:', error)
        }
      },
      
      // Check if product is in wishlist
      isInWishlist: (productId) => {
        return (get().items || []).some(item => item.product_id === productId)
      },
      
      // Get count
      getCount: () => (get().items || []).length
    }),
    {
      name: 'luxe_wishlist',
      partialize: (state) => ({ items: state.items })
    }
  )
)
