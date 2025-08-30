# API Services Modularization

This document explains the refactoring of the monolithic `api.ts` file into a well-structured, modular architecture.

## 📁 New Directory Structure

```
src/
├── api/
│   ├── config/
│   │   ├── axios.ts          # Axios instance + interceptors
│   │   ├── constants.ts      # API_URL, FALLBACK_IMAGE_URL, etc.
│   │   └── index.ts         # Export all config
│   ├── services/
│   │   ├── product.service.ts      # ProductService
│   │   ├── cart.service.ts         # CartService
│   │   ├── user.service.ts         # UserService
│   │   ├── seller.service.ts       # SellerService (formerly SellerProductService)
│   │   ├── order.service.ts        # OrderService
│   │   └── index.ts               # Export all services
│   ├── utils/
│   │   ├── auth.utils.ts          # getCurrentUserRole, session utils
│   │   ├── transform.utils.ts     # Data transformation helpers
│   │   └── index.ts              # Export all utils
│   └── index.ts                  # Main API barrel export
└── services/
    └── api.ts                    # DEPRECATED - Can be removed after migration
```

##  Migration Guide

### Backward Compatibility

** Good News:** No changes needed to existing imports! All existing imports will continue to work exactly as before.

```typescript
// These imports continue to work unchanged:
import { ProductService, CartService, UserService } from '../services/api';
import { SellerProductService, OrderService } from '../services/api';
```

### Modern Import Patterns (Recommended)

For new code, you can use the new modular structure:

```typescript
// Import from the new API module
import { ProductService, CartService } from '../api';

// Import specific utilities
import { getCurrentUserRole } from '../api/utils';

// Import configuration
import { api, API_URL } from '../api/config';
```

### Service Method Signatures

All service method signatures remain **exactly the same**:

```typescript
// ProductService methods (unchanged)
ProductService.getAll(): Promise<Product[]>
ProductService.getPaginated(limit: number, offset: number): Promise<{products: Product[], totalCount: number}>
ProductService.getById(id: string): Promise<Product>
ProductService.create(data: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product>
ProductService.update(id: string, updates: Partial<Product>): Promise<Product>
ProductService.delete(id: string): Promise<void>

// CartService methods (unchanged)
CartService.getCartItems(): Promise<CartItem[]>
CartService.addToCart(productId: string): Promise<CartItem>
CartService.updateCartItem(productId: string, quantity: number): Promise<CartItem>
CartService.removeCartItem(productId: string): Promise<void>
CartService.clearCart(): Promise<void>

// SellerProductService methods (unchanged)
SellerProductService.getSellerProducts(): Promise<Product[]>
SellerProductService.createProduct(data: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product>
SellerProductService.updateProduct(id: string, updates: Partial<Product>): Promise<Product>
SellerProductService.deleteProduct(id: string): Promise<void>

// OrderService methods (unchanged)
OrderService.getSellerOrders(): Promise<OrderWithDetails[]>
OrderService.updateOrderStatus(orderId: string, status: Order['status']): Promise<Order>

// UserService methods (unchanged)
UserService.getProfile(): Promise<User>
UserService.updateProfile(data: Partial<User>): Promise<User>
```

## 🏗️ Architecture Benefits

### 1. **Separation of Concerns**
- **Configuration**: Centralized in `config/` folder
- **Business Logic**: Each service focuses on one domain
- **Utilities**: Shared helpers in `utils/` folder

### 2. **Type Safety**
- All TypeScript types preserved
- Improved import intellisense
- Better error detection

### 3. **Maintainability**
- Smaller, focused files
- Easier to test individual services
- Clear dependency graph

### 4. **Performance**
- Tree-shaking friendly
- Import only what you need
- Reduced bundle size potential

##  Technical Implementation Details

### Configuration (`config/`)

#### `axios.ts`
- Configured axios instance with interceptors
- Automatic JWT token injection from Supabase
- Comprehensive request/response logging
- 401 error handling with automatic logout

#### `constants.ts`
- API_URL configuration
- FALLBACK_IMAGE_URL for missing images
- Pagination defaults
- Cache durations

### Services (`services/`)

#### `product.service.ts`
- Role-based data fetching (backend API for sellers, Supabase for buyers)
- CRUD operations for products
- Pagination support
- Data transformation between backend/frontend formats

#### `cart.service.ts`
- Supabase-based cart operations
- Session management
- Quantity updates with validation
- Product details embedded

#### `seller.service.ts`
- Direct Supabase queries with seller filtering
- Security: Only operates on seller's own products
- Product lifecycle management for sellers

#### `order.service.ts`
- Complex joins for order data with products and users
- Seller-specific order filtering
- Order status management

#### `user.service.ts`
- User profile operations
- Backend API integration

### Utilities (`utils/`)

#### `auth.utils.ts`
- `getCurrentUserRole()`: Role determination from cache
- `isAuthenticated()`: Session validation
- `getCurrentUserId()`: User ID extraction
- `hasRole()`: Role checking
- `logout()`: Session cleanup

#### `transform.utils.ts`
- Data transformation between formats
- Backend ↔ Frontend mapping
- Supabase ↔ Frontend mapping
- Pagination helpers
- Sorting utilities

## 🐛 Debug Logging

All existing debug logging is preserved:
- Request/response logging in axios interceptors
- Service-specific debug logs
- Error tracking with detailed context
- Session state logging

##  Security Features

### Authentication
- Automatic token refresh from Supabase session
- Session validation in all protected operations
- Logout handling for expired sessions

### Authorization
- Role-based filtering in ProductService
- Seller-only operations in SellerService
- User-scoped cart operations
- Order access control

##  Error Handling

### Consistent Error Flow
- All services use consistent error format
- Detailed error logging preserved
- Graceful fallbacks where appropriate
- Network error handling

### User-Friendly Messages
- Descriptive error messages
- Session-related error handling
- Network connectivity issues

## 🧪 Testing Strategy

### Unit Tests
Each service can now be tested in isolation:

```typescript
// Example test structure
describe('ProductService', () => {
  describe('getAll', () => {
    it('should return products for buyers via Supabase', async () => {
      // Test implementation
    });
    
    it('should return products for sellers via backend API', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests
- Service interaction testing
- End-to-end API flows
- Authentication integration

##  Performance Optimizations

### Bundle Size
- Tree-shaking friendly exports
- Import only needed services
- Reduced circular dependencies

### Runtime Performance
- Direct Supabase queries where appropriate
- Cached user role lookups
- Efficient data transformations

### Development Experience
- Better IntelliSense support
- Faster compilation
- Clearer error messages

## 📈 Future Enhancements

### Easy Extensions
- Add new services in `services/` folder
- Extend utilities in `utils/` folder
- Add configuration in `config/` folder

### Monitoring
- Add service-level metrics
- Request/response time tracking
- Error rate monitoring

### Caching
- Service-level caching strategies
- Background data refresh
- Optimistic updates

##  Rollback Plan

If needed, the old `services/api.ts` file is preserved and can be restored by:

1. Updating imports back to `'../services/api'`
2. Removing the new `src/api/` directory
3. All functionality will work exactly as before

##  Next Steps

1.  **Completed**: Modular structure created
2.  **Completed**: Backward compatibility maintained
3.  **Optional**: Gradually migrate imports to new patterns
4.  **Optional**: Add unit tests for individual services
5.  **Optional**: Remove old `api.ts` file after migration
6.  **Optional**: Add service-level caching
7.  **Optional**: Add monitoring and metrics

## 🤝 Contributing

When adding new features:

1. **New Services**: Add to `src/api/services/`
2. **Utilities**: Add to `src/api/utils/`
3. **Configuration**: Add to `src/api/config/`
4. **Export**: Update respective `index.ts` files
5. **Documentation**: Update this README

The modular structure makes it easy to understand where new code should go and maintains a clean separation of concerns.
