import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  id: number
  title: string
  thumbnailUrl: string | null
  authorName: string
  price: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
}

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; id: number }
  | { type: 'CLEAR' }

interface CartState {
  items: CartItem[]
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.some(
        i => i.id === action.item.id && i.licenseType === action.item.licenseType,
      )
      return exists ? state : { items: [...state.items, action.item] }
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.id !== action.id) }
    case 'CLEAR':
      return { items: [] }
  }
}

const STORAGE_KEY = 'assetmaster_cart'

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CartState
  } catch {}
  return { items: [] }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value: CartContextValue = {
    items:       state.items,
    itemCount:   state.items.length,
    total:       state.items.reduce((sum, i) => sum + i.price, 0),
    addItem:     (item) => dispatch({ type: 'ADD',    item }),
    removeItem:  (id)   => dispatch({ type: 'REMOVE', id }),
    clearCart:   ()     => dispatch({ type: 'CLEAR' }),
    isInCart:    (id)   => state.items.some(i => i.id === id),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
