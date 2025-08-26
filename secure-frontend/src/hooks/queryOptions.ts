/**
 * Optimized Query Configurations for Different Data Types
 * Provides consistent query options across all hooks
 */

import { UseQueryOptions } from '@tanstack/react-query';

/**
 * Base query options that prevent tab switching reloads
 */
const baseQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: (failureCount: number, error: any) => {
    // Don't retry auth errors
    if (error?.message?.includes('auth') || 
        error?.message?.includes('permission') ||
        error?.message?.includes('unauthorized')) {
      return false;
    }
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;

/**
 * Query options for user-related data (profile, role, settings)
 * - Longer stale time since user data changes infrequently
 * - Longer cache time for persistent sessions
 */
export const getUserQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  ...additionalOptions,
});

/**
 * Query options for product data
 * - Medium stale time since products change occasionally
 * - Good cache time for browsing experience
 */
export const getProductQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 3 * 60 * 1000, // 3 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  ...additionalOptions,
});

/**
 * Query options for order data
 * - Shorter stale time since orders change more frequently
 * - Moderate cache time for order history browsing
 */
export const getOrderQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  ...additionalOptions,
});

/**
 * Query options for cart data
 * - Short stale time since cart changes frequently
 * - Shorter cache time for real-time updates
 */
export const getCartQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 1 * 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
  ...additionalOptions,
});

/**
 * Query options for real-time data (notifications, live updates)
 * - Very short stale time for freshness
 * - Short cache time to prevent stale data
 */
export const getRealTimeQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 2 * 60 * 1000, // 2 minutes
  refetchInterval: 60 * 1000, // Refetch every minute for real-time data
  ...additionalOptions,
});

/**
 * Query options for static/configuration data
 * - Very long stale time since this data rarely changes
 * - Long cache time for performance
 */
export const getStaticQueryOptions = <T = any>(additionalOptions?: Partial<UseQueryOptions<T>>): Partial<UseQueryOptions<T>> => ({
  ...baseQueryOptions,
  staleTime: 60 * 60 * 1000, // 1 hour
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
  ...additionalOptions,
});

/**
 * Role-based query enablement helper
 * Ensures queries only run when user has proper role and is authenticated
 */
export const createRoleBasedEnabled = (
  isAuthenticated: boolean,
  userRole: string | null | undefined,
  allowedRoles: string[],
  additionalConditions: boolean = true
): boolean => {
  return isAuthenticated && 
         !!userRole && 
         allowedRoles.includes(userRole) && 
         additionalConditions;
};

/**
 * Query key helpers for consistent cache keys
 */
export const QueryKeys = {
  // User-related
  user: (userId?: string) => ['user', userId],
  userRole: (userId?: string) => ['user-role', userId],
  userProfile: (userId?: string) => ['user-profile', userId],
  
  // Product-related
  products: () => ['products'],
  product: (productId?: string) => ['product', productId],
  sellerProducts: (sellerId?: string) => ['seller-products', sellerId],
  
  // Order-related
  orders: (userId?: string) => ['orders', userId],
  order: (orderId?: string) => ['order', orderId],
  sellerOrders: (sellerId?: string) => ['seller-orders', sellerId],
  buyerOrders: (buyerId?: string) => ['buyer-orders', buyerId],
  
  // Cart-related
  cart: (userId?: string) => ['cart', userId],
  cartCount: (userId?: string) => ['cart-count', userId],
  
  // Admin-related
  allUsers: () => ['admin', 'users'],
  allOrders: () => ['admin', 'orders'],
  allProducts: () => ['admin', 'products'],
  
  // Analytics
  analytics: (type: string, params?: Record<string, any>) => ['analytics', type, params],
} as const;

/**
 * Mutation options with consistent error handling
 */
export const getMutationOptions = () => ({
  retry: 1,
  retryDelay: 1000,
  onError: (error: any) => {
    console.error('Mutation failed:', error);
    
    // Handle auth errors globally
    if (error?.message?.includes('auth') || 
        error?.message?.includes('unauthorized') ||
        error?.response?.status === 401 ||
        error?.response?.status === 403) {
      console.warn('Authentication error in mutation, may need to refresh session');
    }
  }
});

/**
 * Helper to create optimized query options for specific hook types
 */
export const createHookQueryOptions = {
  user: getUserQueryOptions,
  product: getProductQueryOptions,
  order: getOrderQueryOptions,
  cart: getCartQueryOptions,
  realTime: getRealTimeQueryOptions,
  static: getStaticQueryOptions,
};
