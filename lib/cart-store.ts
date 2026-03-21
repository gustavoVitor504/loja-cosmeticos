'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              )
            }
          }
          
          return {
            items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }]
          }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => item.product.id !== productId)
            }
          }
          
          return {
            items: state.items.map(item =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stock) }
                : item
            )
          }
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const price = item.product.discount_percent > 0
            ? item.product.price * (1 - item.product.discount_percent / 100)
            : item.product.price
          return total + price * item.quantity
        }, 0)
      },
      
      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'natura-cart'
    }
  )
)
