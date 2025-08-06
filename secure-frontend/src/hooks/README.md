# Hooks Directory

This directory contains custom React hooks that encapsulate business logic and data fetching.

## Hooks

### useProductData
A custom hook for fetching product data using React Query.

**Parameters:**
- `id: string | undefined` - Product ID to fetch

**Returns:**
React Query result object with `data`, `isLoading`, `error`, etc.

**Usage:**
```tsx
const { data: product, isLoading, error } = useProductData(productId);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading product</div>;
return <div>{product.name}</div>;
```

### useAddToCart
A custom hook for adding items to the shopping cart.

**Returns:**
Mutation object with `mutate`, `isPending`, `error`, etc.

**Usage:**
```tsx
const addToCartMutation = useAddToCart();

const handleAddToCart = () => {
  addToCartMutation.mutate({ 
    productId: '123', 
    quantity: 2 
  });
};

return (
  <button 
    onClick={handleAddToCart}
    disabled={addToCartMutation.isPending}
  >
    {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
  </button>
);
```

## Design Principles

1. **Single Responsibility** - Each hook handles one specific concern
2. **Reusability** - Hooks can be used across different components
3. **Abstraction** - Complex logic is hidden behind simple interfaces
4. **Error Handling** - Hooks handle errors consistently
5. **Caching** - Data fetching hooks leverage React Query caching

## Benefits

- **Separation of Concerns**: Business logic is separate from UI components
- **Testability**: Hooks can be tested independently using `renderHook`
- **Reusability**: Same logic can be used in different components
- **Maintainability**: Changes to business logic only affect the hook
- **Type Safety**: Full TypeScript support with proper typing

## Testing Hooks

Custom hooks can be tested using React Testing Library's `renderHook`:

```tsx
import { renderHook } from '@testing-library/react';
import { useProductData } from './useProductData';

test('should fetch product data', () => {
  const { result } = renderHook(() => useProductData('123'));
  
  expect(result.current.isLoading).toBe(true);
  // Additional assertions...
});
```
