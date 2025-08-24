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
  const { isAuthenticated, isBuyer } = useAuth();
  
  // Always call useCart hook - hooks must be called in the same order every render
  const cartData = useCart();

  // Only provide cart context to buyers; other roles get a disabled context
  const contextValue = isAuthenticated && isBuyer ? cartData : {
    cartItems: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    totalPrice: 0,
    addToCart: async () => { throw new Error('Cart not available for this user role'); },
    updateCartItem: async () => { throw new Error('Cart not available for this user role'); },
    removeCartItem: async () => { throw new Error('Cart not available for this user role'); },
    clearCart: async () => { throw new Error('Cart not available for this user role'); },
    isAddingToCart: false,
    isUpdatingCart: false,
    isRemovingFromCart: false,
    isClearingCart: false,
  };

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
