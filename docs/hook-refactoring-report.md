# Legacy Hook Refactoring Report

## Overview

This document summarizes the refactoring of legacy hooks in SecureShop to ensure they properly use React Query, respect the new session management architecture, and prevent duplicate requests during tab switching.

## Refactored Hooks

### 1. useSellerProducts.ts

**Previous Issues:**
- Used `useState` and `useEffect` for manual state management
- Direct Supabase calls without React Query caching
- No role-based access validation
- Potential for duplicate requests on tab switches
- Manual loading and error state management

**Refactoring Changes:**
- ✅ **React Query Integration**: Replaced manual state with `useQuery`
- ✅ **Optimized Caching**: Uses `getProductQueryOptions()` with 3-minute stale time
- ✅ **Role-Based Access**: Uses `createRoleBasedEnabled()` for proper access control
- ✅ **Tab Switch Prevention**: `refetchOnWindowFocus: false` prevents unnecessary reloads
- ✅ **AuthContext Integration**: Reads user data from `useAuth()` instead of direct storage
- ✅ **Mutation Optimization**: `useMutation` with optimistic updates and cache invalidation
- ✅ **Error Handling**: Improved error handling with retry logic that respects auth errors
- ✅ **TypeScript Safety**: Proper typing with explicit return types

**Key Features:**
```typescript
// Query with optimized caching
const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
  queryKey: QueryKeys.sellerProducts(effectiveSellerId),
  queryFn: async (): Promise<Product[]> => { /* ... */ },
  enabled: createRoleBasedEnabled(isAuthenticated, user?.role, ['seller', 'admin'], !!effectiveSellerId),
  ...getProductQueryOptions<Product[]>(),
});

// Mutation with cache updates
const deleteProductMutation = useMutation({
  ...getMutationOptions(),
  onSuccess: (_, productId) => {
    // Optimistic cache updates
    queryClient.setQueryData(QueryKeys.sellerProducts(effectiveSellerId), /* ... */);
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: QueryKeys.products() });
  }
});
```

### 2. useSellerOrders.ts

**Previous Issues:**
- Manual state management with `useState` and `useEffect`
- No React Query caching
- No role validation
- Complex data transformation without caching
- Potential for duplicate API calls

**Refactoring Changes:**
- ✅ **React Query Integration**: Full migration to `useQuery`
- ✅ **Order-Specific Caching**: Uses `getOrderQueryOptions()` with 2-minute stale time
- ✅ **Role-Based Security**: Ensures sellers can only access their own orders
- ✅ **Data Transformation**: Efficient transformation with caching
- ✅ **AuthContext Usage**: Proper auth state reading
- ✅ **Performance Optimization**: Prevents tab switch reloads

**Key Features:**
```typescript
const { data: orderItems = [], isLoading, error, refetch } = useQuery<SellerOrderItem[]>({
  queryKey: QueryKeys.sellerOrders(effectiveSellerId),
  queryFn: async (): Promise<SellerOrderItem[]> => {
    // Complex join query with transformation
    const { data, error } = await supabase.from('order_items').select(/* ... */);
    return transformedData;
  },
  enabled: createRoleBasedEnabled(isAuthenticated, user?.role, ['seller', 'admin'], !!effectiveSellerId),
  ...getOrderQueryOptions<SellerOrderItem[]>(),
});
```

## New Utilities Created

### 1. queryOptions.ts

**Purpose**: Provides consistent query configurations across all hooks

**Key Features:**
- **Typed Query Options**: Separate configurations for different data types
- **Cache Optimization**: Different stale times based on data volatility
- **Tab Switch Prevention**: `refetchOnWindowFocus: false` across all queries
- **Role-Based Helpers**: `createRoleBasedEnabled()` for access control
- **Consistent Query Keys**: `QueryKeys` object for cache key management
- **Mutation Options**: Standardized mutation configurations

**Data-Specific Configurations:**
```typescript
// User data - changes infrequently
getUserQueryOptions: 15min staleTime, 30min gcTime

// Product data - moderate changes
getProductQueryOptions: 3min staleTime, 10min gcTime

// Order data - more frequent changes
getOrderQueryOptions: 2min staleTime, 10min gcTime

// Cart data - frequent changes
getCartQueryOptions: 1min staleTime, 5min gcTime

// Real-time data - very frequent
getRealTimeQueryOptions: 30s staleTime, 2min gcTime, 1min refetch interval
```

### 2. sessionAuth.ts (API Integration)

**Purpose**: Provides API utilities that integrate with the new SessionManager

**Key Features:**
- **Token Management**: `getAuthToken()` uses SessionManager instead of localStorage
- **Authentication Headers**: `getAuthHeaders()` for API requests
- **Error Handling**: `handleAuthError()` for 401/403 responses
- **Axios Interceptors**: Ready-to-use request/response interceptors

### 3. hookAuditor.ts (Testing and Validation)

**Purpose**: Validates hook compliance with new architecture

**Key Features:**
- **Hook Auditing**: Checks React Query usage, auth integration, storage avoidance
- **Performance Testing**: Tab switch performance validation
- **Auth State Testing**: Tests hooks with different authentication scenarios
- **Compliance Reports**: Generates detailed audit reports

## Architecture Benefits

### 1. Performance Improvements

**Before:**
- Manual state management with potential race conditions
- No caching - every component mount triggered API calls
- Tab switching caused unnecessary reloads
- No optimistic updates

**After:**
- React Query automatic caching and deduplication
- Intelligent stale time prevents unnecessary requests
- Tab switching doesn't trigger reloads
- Optimistic updates for better UX
- Background refetching when needed

### 2. Security Enhancements

**Before:**
- No role-based query enablement
- Inconsistent access control
- Potential for unauthorized data access

**After:**
- `createRoleBasedEnabled()` ensures proper access control
- Sellers can only access their own data (unless admin)
- Queries automatically disabled for unauthorized users
- AuthContext integration prevents storage tampering

### 3. Developer Experience

**Before:**
- Manual loading/error state management
- Inconsistent patterns across hooks
- Complex refetch logic
- No cache invalidation strategy

**After:**
- Automatic loading/error states from React Query
- Consistent patterns via `queryOptions.ts`
- Simple `refetch()` calls
- Intelligent cache invalidation
- TypeScript safety throughout

### 4. Maintainability

**Before:**
- Duplicated state management logic
- Inconsistent error handling
- Hard to test
- No centralized configuration

**After:**
- DRY principles with shared utilities
- Consistent error handling patterns
- Easier testing with React Query Testing Library
- Centralized configuration in `queryOptions.ts`

## Implementation Guidelines

### 1. Hook Creation Pattern

```typescript
export function useCustomHook() {
  const { user, isAuthenticated } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.customData(user?.id),
    queryFn: async () => {
      // API call implementation
    },
    enabled: createRoleBasedEnabled(isAuthenticated, user?.role, ['allowed-roles']),
    ...getAppropriateQueryOptions(),
  });

  return { data, loading: isLoading, error, refetch };
}
```

### 2. Mutation Pattern

```typescript
const mutation = useMutation({
  ...getMutationOptions(),
  mutationFn: async (data) => {
    // API call
  },
  onSuccess: () => {
    // Cache invalidation
    queryClient.invalidateQueries({ queryKey: QueryKeys.relatedData() });
  }
});
```

### 3. Role-Based Access

```typescript
// Enable query only for specific roles
enabled: createRoleBasedEnabled(
  isAuthenticated,
  user?.role,
  ['seller', 'admin'],
  additionalCondition
)
```

## Migration Checklist

For any remaining legacy hooks:

- [ ] Replace `useState`/`useEffect` with `useQuery`/`useMutation`
- [ ] Use appropriate query options from `queryOptions.ts`
- [ ] Implement role-based access with `createRoleBasedEnabled()`
- [ ] Use `QueryKeys` for consistent cache keys
- [ ] Read auth state from `useAuth()` instead of localStorage
- [ ] Add proper TypeScript typing
- [ ] Implement cache invalidation strategy
- [ ] Test with `HookAuditor`

## Testing Strategy

### 1. Automated Testing

```typescript
// Test with different auth states
HookAuditor.testHookWithAuthStates('useCustomHook', hookFunction, [
  { authenticated: true, role: 'seller', expectsData: true },
  { authenticated: false, role: null, expectsData: false },
  { authenticated: true, role: 'buyer', expectsData: false }
]);

// Performance testing
HookAuditor.testTabSwitchPerformance('useCustomHook', hookFunction);
```

### 2. Manual Testing

- Test with different user roles
- Verify tab switching doesn't cause reloads
- Check cache behavior in React Query DevTools
- Validate error handling with network failures
- Test optimistic updates

## Future Considerations

### 1. Real-Time Updates

For hooks that need real-time data:
```typescript
...getRealTimeQueryOptions({
  refetchInterval: 30000, // 30 seconds
  refetchIntervalInBackground: true
})
```

### 2. Infinite Queries

For paginated data:
```typescript
useInfiniteQuery({
  queryKey: QueryKeys.paginatedData(),
  queryFn: ({ pageParam = 0 }) => fetchPage(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  ...getAppropriateQueryOptions()
})
```

### 3. Suspense Integration

For future React Suspense support:
```typescript
...getQueryOptions({
  suspense: true,
  useErrorBoundary: true
})
```

## Conclusion

The refactoring successfully addresses all major issues:

✅ **React Query Integration**: All legacy hooks now use React Query  
✅ **Session Management**: Proper AuthContext usage, no direct storage access  
✅ **Role-Based Access**: Secure, validated access control  
✅ **Tab Switch Optimization**: No unnecessary reloads on tab switching  
✅ **Performance**: Optimized caching strategies  
✅ **Developer Experience**: Consistent patterns and better error handling  
✅ **Type Safety**: Full TypeScript integration  
✅ **Testing**: Comprehensive testing utilities  

The new architecture provides a solid foundation for scalable, maintainable, and performant data fetching throughout the SecureShop application.
