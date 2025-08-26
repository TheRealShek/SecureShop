import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BuyerService } from '../api/services/buyer.service';
import { OrderWithDetails } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing buyer cart operations
 */
export function useBuyerCart() {
  const { user, isAuthenticated, isBuyer } = useAuth();

  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buyer-cart', user?.id],
    queryFn: BuyerService.getBuyerCart,
    enabled: isAuthenticated && isBuyer && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - cart doesn't change that often
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });

  const {
    data: cartCount = 0,
    refetch: refetchCount
  } = useQuery({
    queryKey: ['buyer-cart-count', user?.id],
    queryFn: BuyerService.getBuyerCartCount,
    enabled: isAuthenticated && isBuyer && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  return {
    cartItems,
    cartCount,
    totalPrice,
    isLoading,
    error: error as Error | null,
    refetch,
    refetchCount
  };
}

/**
 * Custom hook for managing buyer orders
 */
export function useBuyerOrders() {
  const { user, isAuthenticated, isBuyer } = useAuth();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buyer-orders', user?.id],
    queryFn: BuyerService.getBuyerOrders,
    enabled: isAuthenticated && isBuyer && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - orders don't change frequently
    gcTime: 20 * 60 * 1000, // 20 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    confirmed: orders.filter(order => order.status === 'confirmed').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };

  const totalSpent = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((total, order) => total + order.total_amount, 0);

  return {
    orders,
    orderStats,
    totalSpent,
    isLoading,
    error: error as Error | null,
    refetch
  };
}

/**
 * Custom hook for fetching a specific order's details
 */
export function useBuyerOrderDetails(orderId: string | null) {
  const { user, isAuthenticated, isBuyer } = useAuth();

  const {
    data: orderDetails,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buyer-order-details', orderId, user?.id],
    queryFn: () => orderId ? BuyerService.getBuyerOrderDetails(orderId) : null,
    enabled: isAuthenticated && isBuyer && !!user?.id && !!orderId,
    staleTime: 10 * 60 * 1000, // 10 minutes - order details are fairly static
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });

  return {
    orderDetails,
    isLoading,
    error: error as Error | null,
    refetch
  };
}

/**
 * Custom hook for filtering orders by status
 */
export function useFilteredOrders(orders: OrderWithDetails[], filter: string) {
  const filteredOrders = useMemo(() => {
    if (filter === 'all') {
      return orders;
    } else {
      return orders.filter(order => order.status === filter);
    }
  }, [orders, filter]);

  return filteredOrders;
}
