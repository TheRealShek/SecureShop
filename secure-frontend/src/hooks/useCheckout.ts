import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckoutService, CheckoutResult, CreateOrderData } from '../api/services/checkout.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for handling checkout operations
 */
export function useCheckout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: (orderData: CreateOrderData) => CheckoutService.checkout(orderData),
    onSuccess: (result: CheckoutResult) => {
      if (result.success) {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: ['buyer-cart', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['buyer-cart-count', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['buyer-orders', user?.id] });
        
        // Optionally invalidate product queries to update stock
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }
  });

  const processCheckout = async (orderData: CreateOrderData = {}) => {
    setIsProcessing(true);
    try {
      const result = await checkoutMutation.mutateAsync(orderData);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing: isProcessing || checkoutMutation.isPending,
    error: checkoutMutation.error,
    isSuccess: checkoutMutation.isSuccess,
    data: checkoutMutation.data,
    reset: checkoutMutation.reset
  };
}

/**
 * Hook for getting checkout summary
 */
export function useCheckoutSummary() {
  const { user, isAuthenticated } = useAuth();

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['checkout-summary', user?.id],
    queryFn: CheckoutService.getCheckoutSummary,
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    summary,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
