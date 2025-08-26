/**
 * Custom options for optimized React Query usage
 * Provides consistent query options to prevent unnecessary reloads on tab switching
 */

/**
 * Default options for queries that prevent unnecessary reloads
 */
export const getOptimizedQueryOptions = (
  customOptions: Record<string, any> = {}
): Record<string, any> => ({
  // Disable refetch on window focus by default
  refetchOnWindowFocus: false,
  // Extend stale time for better performance
  staleTime: 5 * 60 * 1000, // 5 minutes
  // Extend garbage collection time
  gcTime: 10 * 60 * 1000, // 10 minutes
  // Disable refetch on reconnect to prevent disruption
  refetchOnReconnect: false,
  // Conservative retry strategy
  retry: 1,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  // Merge with any custom options
  ...customOptions,
});

/**
 * Query options for user data that changes infrequently
 */
export const getUserDataQueryOptions = (
  customOptions: Record<string, any> = {}
): Record<string, any> => ({
  ...getOptimizedQueryOptions(),
  // User data changes very infrequently, extend cache time
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  ...customOptions,
});

/**
 * Query options for product data that changes occasionally
 */
export const getProductDataQueryOptions = (
  customOptions: Record<string, any> = {}
): Record<string, any> => ({
  ...getOptimizedQueryOptions(),
  // Product data can change, but not too frequently
  staleTime: 3 * 60 * 1000, // 3 minutes
  gcTime: 15 * 60 * 1000, // 15 minutes
  ...customOptions,
});

/**
 * Query options for order data that should be relatively fresh
 */
export const getOrderDataQueryOptions = (
  customOptions: Record<string, any> = {}
): Record<string, any> => ({
  ...getOptimizedQueryOptions(),
  // Order data should be fresher as status can change
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  ...customOptions,
});

/**
 * Query options for critical real-time data (like cart)
 */
export const getRealTimeDataQueryOptions = (
  customOptions: Record<string, any> = {}
): Record<string, any> => ({
  ...getOptimizedQueryOptions(),
  // Critical data should be relatively fresh but still optimized
  staleTime: 1 * 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
  // Still disable window focus refetch to prevent disruption
  refetchOnWindowFocus: false,
  ...customOptions,
});
