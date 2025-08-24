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

  // Only buyers get cart context; other roles get children directly (no cart queries)
  if (!isAuthenticated || !isBuyer) {
    return <>{children}</>;
  }

  const cartData = useCart();
  return (
    <CartContext.Provider value={cartData}>
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
