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
    staleTime: 2 * 60 * 1000, // 2 minutes - checkout data can change quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });

  return {
    summary,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
