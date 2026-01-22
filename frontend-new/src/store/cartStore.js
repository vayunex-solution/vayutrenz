import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      synced: true,
      
      // Get cart from server (for logged in users)
      fetchCart: async () => {
        try {
          set({ loading: true })
          const { data } = await axiosInstance.get('/cart')
          set({ items: data.data, loading: false, synced: true })
          return data.data
        } catch (error) {
          set({ loading: false })
          console.log('Fetch cart error:', error)
        }
      },
      
      // Add to cart with offline support
      addToCart: async (product, variant = null, quantity = 1) => {
        const tempId = Date.now()
        const newItem = {
          tempId,
          product,
          variant,
          quantity,
          cart_item_id: null
        }
        
        // Optimistic update
        set(state => ({
          items: [...state.items, newItem],
          synced: false
        }))
        
        toast.success('Added to cart!')
        
        // Try to sync with server
        try {
          const { data } = await axiosInstance.post('/cart/add', {
            productId: product.id,
            variantId: variant?.id || null,
            quantity
          })
          
          // Update with server response
          set(state => ({
            items: state.items.map(item =>
              item.tempId === tempId
                ? { ...item, cart_item_id: data.data.cartItemId, tempId: null }
                : item
            ),
            synced: true
          }))
        } catch (error) {
          console.log('Cart sync failed, will retry later')
          // Keep in local cart for retry
        }
      },
      
      // Update quantity
      updateQuantity: async (cartItemId, quantity) => {
        // Find item
        const item = get().items.find(
          i => i.cart_item_id === cartItemId || i.tempId === cartItemId
        )
        if (!item) return
        
        // Optimistic update
        set(state => ({
          items: state.items.map(i =>
            (i.cart_item_id === cartItemId || i.tempId === cartItemId)
              ? { ...i, quantity }
              : i
          )
        }))
        
        // Sync with server if possible
        if (item.cart_item_id) {
          try {
            await axiosInstance.put(`/cart/${item.cart_item_id}`, { quantity })
          } catch (error) {
            console.log('Update failed:', error)
          }
        }
      },
      
      // Remove from cart
      removeFromCart: async (cartItemId) => {
        const item = get().items.find(
          i => i.cart_item_id === cartItemId || i.tempId === cartItemId
        )
        
        // Optimistic update
        set(state => ({
          items: state.items.filter(
            i => i.cart_item_id !== cartItemId && i.tempId !== cartItemId
          )
        }))
        
        toast.success('Removed from cart')
        
        // Sync with server
        if (item?.cart_item_id) {
          try {
            await axiosInstance.delete(`/cart/${item.cart_item_id}`)
          } catch (error) {
            console.log('Remove failed:', error)
          }
        }
      },
      
      // Clear cart
      clearCart: async () => {
        set({ items: [] })
        
        try {
          await axiosInstance.delete('/cart/clear')
        } catch (error) {
          console.log('Clear cart failed:', error)
        }
      },
      
      // Get cart count
      getCount: () => {
        return (get().items || []).reduce((sum, item) => sum + item.quantity, 0)
      },
      
      // Get cart total
      getTotal: () => {
        return (get().items || []).reduce((sum, item) => {
          const price = item.product?.price || 0
          return sum + (price * item.quantity)
        }, 0)
      },
      
      // Sync pending items
      syncCart: async () => {
        const unsyncedItems = get().items.filter(item => item.tempId)
        if (unsyncedItems.length === 0) return
        
        for (const item of unsyncedItems) {
          try {
            const { data } = await axiosInstance.post('/cart/add', {
              productId: item.product.id,
              variantId: item.variant?.id || null,
              quantity: item.quantity
            })
            
            set(state => ({
              items: state.items.map(i =>
                i.tempId === item.tempId
                  ? { ...i, cart_item_id: data.data.cartItemId, tempId: null }
                  : i
              ),
              synced: true
            }))
          } catch (error) {
            console.log('Sync failed for item:', item)
          }
        }
      }
    }),
    {
      name: 'luxe_cart',
      partialize: (state) => ({ items: state.items })
    }
  )
)
