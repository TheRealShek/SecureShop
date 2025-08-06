# React Data Fetching Best Practices

This document outlines the best practices implemented to prevent `map is not a function` errors and ensure robust data handling in React applications.

## Problem Analysis

The error `products?.map is not a function` typically occurs when:

1. **API returns unexpected data format**: The backend sends data in a different structure than expected
2. **Missing default values**: The component tries to map over `undefined` or `null`
3. **Race conditions**: Component renders before data is loaded
4. **Type safety issues**: TypeScript types don't match runtime data

## Implemented Solutions

### 1. Default Values in useQuery
```typescript
const { data: products = [], isLoading, error } = useQuery<Product[]>({
  queryKey: ['products'],
  queryFn: () => ProductService.getAll(),
});
```

**Best Practice**: Always provide default values for data that should be arrays.

### 2. Custom Hooks for Type Safety
```typescript
// hooks/useProducts.ts
export function useProducts(): UseProductsResult {
  const query = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const products = query.data || DEFAULT_PRODUCT_VALUES.EMPTY_ARRAY;

  return {
    ...query,
    products,
    isEmpty: products.length === 0,
  };
}
```

**Benefits**:
- Encapsulates data fetching logic
- Provides consistent default values
- Adds derived state (isEmpty)
- Better reusability

### 3. Type Guards for Runtime Validation
```typescript
// utils/typeGuards.ts
export function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

export function safeParseProducts(data: unknown): Product[] {
  if (isProductArray(data)) {
    return data;
  }
  
  console.error('Invalid products data received:', data);
  return [];
}
```

**Benefits**:
- Runtime type checking
- Graceful error handling
- Debugging assistance

### 4. Enhanced API Service
```typescript
export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/api/products');
      return safeParseProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
};
```

**Benefits**:
- Consistent error handling
- Data validation at the service layer
- Better debugging information

### 5. Defensive Rendering
```typescript
// Additional safety check
if (!Array.isArray(products)) {
  console.error('Products data is not an array:', products);
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="text-sm text-yellow-700">Invalid products data format</div>
    </div>
  );
}

// Empty state handling
{products.length === 0 ? (
  <div className="col-span-full text-center py-8">
    <p className="text-gray-500">No products available</p>
  </div>
) : (
  products.map((product) => (
    // Product rendering
  ))
)}
```

### 6. Image Error Handling
```typescript
<img
  src={product.image}
  alt={product.name}
  onError={(e) => {
    e.currentTarget.src = DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE;
  }}
/>
```

## General Best Practices

### 1. Always Use Default Values
- Provide default arrays `[]` for data that should be mapped
- Use optional chaining `?.` with fallbacks
- Consider using default parameters in function signatures

### 2. Implement Type Guards
- Validate data shape at runtime
- Use TypeScript's type predicates
- Log errors for debugging

### 3. Handle Loading and Error States
- Show loading indicators
- Display meaningful error messages
- Provide retry mechanisms

### 4. Use Custom Hooks
- Encapsulate data fetching logic
- Provide consistent interfaces
- Add derived state calculations

### 5. Implement Proper Error Boundaries
```typescript
// Consider adding an ErrorBoundary component
class ErrorBoundary extends React.Component {
  // Implementation
}
```

### 6. Add Retry Logic
```typescript
const query = useQuery({
  queryKey: ['products'],
  queryFn: ProductService.getAll,
  retry: 2,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 7. Cache Management
```typescript
const query = useQuery({
  queryKey: ['products'],
  queryFn: ProductService.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Testing Considerations

1. **Test with different data shapes**
2. **Test error scenarios**
3. **Test loading states**
4. **Test empty states**
5. **Mock API responses**

## Monitoring and Debugging

1. **Add console.error for invalid data**
2. **Use proper error tracking (Sentry, etc.)**
3. **Monitor API response formats**
4. **Add performance monitoring**

## File Structure
```
src/
├── hooks/
│   ├── useProducts.ts      # Custom data fetching hook
│   └── index.ts            # Hook exports
├── services/
│   └── api.ts              # API service with validation
├── utils/
│   └── typeGuards.ts       # Type validation utilities
└── pages/
    └── ProductsPage.tsx    # Component with defensive rendering
```

This architecture ensures that your React application is robust against data format inconsistencies and provides a better user experience.
