import { createContext, useContext, ReactNode } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from './AuthContext';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
  isRemovingFromCart: boolean;
  isClearingCart: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBuyer, loading: authLoading } = useAuth();
  
  // Only provide cart functionality for authenticated buyers
  const shouldProvideCart = isAuthenticated && isBuyer;
  
  const cartData = useCart();
  
  // If user is not authenticated or not a buyer, provide empty cart state
  const emptyCartState: CartContextType = {
    cartItems: [],
    isLoading: authLoading, // Show loading during auth check
    error: null,
    totalItems: 0,
    totalPrice: 0,
    addToCart: async () => {
      throw new Error('Cart functionality is only available for buyers');
    },
    updateCartItem: async () => {
      throw new Error('Cart functionality is only available for buyers');
    },
    removeCartItem: async () => {
      throw new Error('Cart functionality is only available for buyers');
    },
    clearCart: async () => {
      throw new Error('Cart functionality is only available for buyers');
    },
    isAddingToCart: false,
    isUpdatingCart: false,
    isRemovingFromCart: false,
    isClearingCart: false,
  };

  const contextValue = shouldProvideCart ? cartData : emptyCartState;

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
