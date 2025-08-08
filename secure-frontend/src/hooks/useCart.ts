import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CartService } from '../services/api';
import { CartItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UseCartResult {
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

export function useCart(): UseCartResult {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  // Fetch cart items - only when user is authenticated
  const { data: cartItems = [], isLoading, error } = useQuery<CartItem[], Error>({
    queryKey: ['cart'],
    queryFn: CartService.getCartItems,
    enabled: isAuthenticated && !!user, // Only run when authenticated and user exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('not authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => CartService.addToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to add item to cart:', error);
    }
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => 
      CartService.updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to update cart item:', error);
    }
  });

  // Remove from cart mutation
  const removeCartMutation = useMutation({
    mutationFn: (productId: string) => CartService.removeCartItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to remove item from cart:', error);
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => CartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error);
    }
  });

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return {
    cartItems,
    isLoading,
    error: error as Error | null,
    totalItems,
    totalPrice,
    addToCart: async (productId: string) => {
      await addToCartMutation.mutateAsync(productId);
    },
    updateCartItem: async (productId: string, quantity: number) => {
      await updateCartMutation.mutateAsync({ productId, quantity });
    },
    removeCartItem: async (productId: string) => {
      await removeCartMutation.mutateAsync(productId);
    },
    clearCart: async () => {
      await clearCartMutation.mutateAsync();
    },
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
