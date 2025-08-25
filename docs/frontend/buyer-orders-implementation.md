# Buyer Order System Documentation

## Overview

This document describes the implementation of a complete buyer order system using Supabase with proper database relationships. The system replaces all demo data with real data-fetching logic.

## Database Relationships

The system uses the following Supabase table relationships:

### Core Tables

1. **orders** - Parent record containing order metadata
   - `id` (UUID) - Primary key
   - `buyer_id` (UUID) - References auth.users(id)
   - `status` (VARCHAR) - Order status (pending, confirmed, shipped, delivered, cancelled)
   - `total_amount` (DECIMAL) - Total order amount
   - `shipping_address` (TEXT) - Optional shipping address
   - `created_at` (TIMESTAMP) - Order creation time
   - `updated_at` (TIMESTAMP) - Last update time

2. **order_items** - Detailed breakdown linked to orders.id
   - `id` (UUID) - Primary key
   - `order_id` (UUID) - References orders(id)
   - `product_id` (UUID) - References products(id)
   - `quantity` (INTEGER) - Number of items ordered
   - `unit_price` (DECIMAL) - Price per unit at time of purchase
   - `total_price` (DECIMAL) - Total price for this line item
   - `created_at` (TIMESTAMP) - Item creation time

3. **cart_items** - Staging area before an order
   - `id` (UUID) - Primary key
   - `user_id` (UUID) - References auth.users(id)
   - `product_id` (UUID) - References products(id)
   - `quantity` (INTEGER) - Number of items in cart
   - `created_at` (TIMESTAMP) - Item added to cart time
   - `updated_at` (TIMESTAMP) - Last update time

## Data-Fetching Functions

### 1. BuyerService.getBuyerCart()

Fetches a buyer's active cart with joined product details.

**Query:** 
```sql
SELECT 
  cart_items.*,
  products (id, name, description, price, image_url, seller_id, stock, status, created_at)
FROM cart_items 
WHERE user_id = $authenticated_user_id
ORDER BY created_at DESC
```

**Returns:** `CartItem[]` with full product details

### 2. BuyerService.getBuyerOrders()

Fetches all orders for a buyer with order items and product details.

**Query:**
```sql
SELECT 
  orders.*,
  order_items (
    id, order_id, product_id, quantity, unit_price, total_price, created_at,
    products (id, name, description, price, image_url, seller_id, created_at)
  ),
  users:buyer_id (id, email)
FROM orders 
WHERE buyer_id = $authenticated_user_id
ORDER BY created_at DESC
```

**Returns:** `OrderWithDetails[]` with nested order items and product details

### 3. BuyerService.getBuyerOrderDetails(orderId)

Fetches a single order with complete details including seller information.

**Query:**
```sql
SELECT 
  orders.*,
  order_items (
    id, order_id, product_id, quantity, unit_price, total_price, created_at,
    products (
      id, name, description, price, image_url, seller_id, stock, status, created_at,
      users:seller_id (id, email)
    )
  ),
  users:buyer_id (id, email)
FROM orders 
WHERE id = $order_id AND buyer_id = $authenticated_user_id
```

**Returns:** `OrderWithDetails | null` with complete order and seller details

## Custom Hooks

### useBuyerOrders()

Main hook for buyer order management:
- Fetches orders with automatic caching
- Provides order statistics (total, pending, shipped, etc.)
- Calculates total spent
- Handles loading and error states

### useBuyerCart()

Hook for cart management:
- Fetches cart items with product details
- Provides cart count and total price
- Handles loading and error states
- Auto-refreshes on mutations

### useBuyerOrderDetails(orderId)

Hook for individual order details:
- Fetches single order with complete details
- Includes seller information
- Optimized for order detail pages

### useFilteredOrders(orders, filter)

Utility hook for filtering orders by status:
- Filters orders by status (all, pending, shipped, etc.)
- Reactive to filter changes
- Optimized performance

## Pages

### OrdersPage

**Location:** `src/pages/OrdersPage.tsx`

Main orders listing page for buyers:
- Shows all orders with status filters
- Displays order summaries with product images
- Provides navigation to order details
- Real-time order statistics
- **Removed:** All mock/demo data
- **Added:** Real Supabase data fetching with error handling

### OrderDetailsPage

**Location:** `src/pages/OrderDetailsPage.tsx`

Detailed view for individual orders:
- Complete order information
- Order timeline with status updates
- Product details with seller information
- Shipping address display
- Multiple order items support

### MyCartPage (Optional)

**Location:** `src/pages/MyCartPage.tsx`

Simple cart page using new buyer service:
- Real-time cart data
- Product details with stock information
- Quantity management interface
- Order summary with pricing

## API Services

### BuyerService

**Location:** `src/api/services/buyer.service.ts`

Centralized service for buyer operations:
- Type-safe database queries
- Proper error handling
- Consistent data transformation
- Authentication checks
- Caching-friendly design

## Data Transformation

All database responses are transformed to match frontend interfaces:

```typescript
// Database format (Supabase)
interface DbCartItemWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    // ... other fields
  };
}

// Frontend format
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}
```

## Security Features

1. **Row Level Security (RLS):** All queries respect Supabase RLS policies
2. **Authentication Checks:** User authentication verified before queries
3. **Owner Filtering:** Users can only access their own orders and cart
4. **Type Safety:** Full TypeScript coverage prevents runtime errors

## Performance Optimizations

1. **Query Optimization:** Efficient joins to minimize database roundtrips
2. **Caching:** React Query integration for automatic caching
3. **Pagination Ready:** Structure supports future pagination implementation
4. **Lazy Loading:** Order details loaded only when needed

## Migration Notes

### Removed Demo Data

1. **OrdersPage:** Removed `mockOrders` array and simulation logic
2. **Cart Component:** Removed demo checkout message
3. **Static Imports:** Removed unused demo data imports

### Added Real Functionality

1. **Error Handling:** Comprehensive error states and retry mechanisms
2. **Loading States:** Proper loading indicators and skeleton screens
3. **Type Safety:** Full TypeScript interfaces for all data structures
4. **Authentication:** Proper user authentication and authorization

## Future Enhancements

1. **Order Creation:** Add checkout flow to create orders from cart
2. **Order Status Updates:** Real-time order status notifications
3. **Pagination:** Add pagination for large order lists
4. **Search/Filter:** Advanced order search and filtering options
5. **Export:** Order history export functionality

## Usage Examples

### Basic Order Fetching

```typescript
function MyOrdersComponent() {
  const { orders, orderStats, isLoading, error } = useBuyerOrders();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h2>Total Orders: {orderStats.total}</h2>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### Cart Management

```typescript
function MyCartComponent() {
  const { cartItems, totalPrice, cartCount } = useBuyerCart();
  
  return (
    <div>
      <h2>Cart ({cartCount} items)</h2>
      <p>Total: {formatPrice(totalPrice)}</p>
      {cartItems.map(item => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Order Details

```typescript
function OrderDetailsComponent({ orderId }: { orderId: string }) {
  const { orderDetails, isLoading } = useBuyerOrderDetails(orderId);
  
  if (isLoading) return <LoadingSpinner />;
  if (!orderDetails) return <NotFound />;
  
  return (
    <div>
      <h1>Order #{orderDetails.id}</h1>
      <OrderTimeline order={orderDetails} />
      <OrderItems items={orderDetails.orderItems} />
    </div>
  );
}
```
