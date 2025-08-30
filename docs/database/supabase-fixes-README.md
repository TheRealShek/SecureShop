# Supabase Issues Fix Documentation

## Issues Fixed

### 1. Duplicate Foreign Key Constraints
**Problem**: Multiple foreign key constraints for the same column relationship caused Supabase embedding to fail with "Could not embed because more than one relationship was found".

**Solution**: 
- Removed all duplicate constraints
- Applied single, standardized constraint names
- Updated frontend service to use correct constraint names

### 2. RLS Policy Recursion  
**Problem**: Circular dependency between `orders` and `order_items` policies caused "infinite recursion detected" errors.

**Solution**: 
- Restructured RLS policies to use direct subqueries instead of cross-referencing
- Eliminated circular dependencies while maintaining security

### 3. React Infinite Loops
**Problem**: The existing hooks already used React Query correctly, preventing infinite loops.

**Status**:  No changes needed - React Query implementation was already correct.

## Implementation Steps

### Step 1: Apply Database Schema Fixes

Run the following SQL scripts in your Supabase SQL Editor:

1. **Fix Foreign Key Constraints**:
   ```bash
   # Run: secure-backend/database/fix_duplicate_foreign_keys.sql
   ```

2. **Fix RLS Policies**:
   ```bash  
   # Run: secure-backend/database/fix_rls_recursion.sql
   ```

### Step 2: Frontend Changes Applied

The `buyer.service.ts` has been updated to use the correct constraint names:

- `cart_items!cart_items_product_id_fkey` (for cart products)
- `order_items!order_items_order_id_fkey` (for order items)  
- `products!order_items_product_id_fkey` (for order item products)

### Step 3: Verify Changes

After applying the database fixes, test the following operations:

#### Cart Operations
```typescript
// Should work without embedding errors
const cartItems = await BuyerService.getBuyerCart();
const cartCount = await BuyerService.getBuyerCartCount();
```

#### Order Operations  
```typescript
// Should work without RLS recursion
const orders = await BuyerService.getBuyerOrders();
const orderDetails = await BuyerService.getBuyerOrderDetails(orderId);
```

## Database Schema After Fix

### Final Foreign Key Structure
```sql
-- cart_items
cart_items_user_id_fkey: user_id → users.id
cart_items_product_id_fkey: product_id → products.id

-- orders  
orders_buyer_id_fkey: buyer_id → users.id

-- order_items
order_items_order_id_fkey: order_id → orders.id  
order_items_product_id_fkey: product_id → products.id

-- products
products_seller_id_fkey: seller_id → users.id
```

### RLS Policy Structure (No Recursion)
```sql
-- order_items policies use direct subqueries
-- Buyers: Check orders.buyer_id = auth.uid() directly
-- Sellers: Check products.seller_id = auth.uid() directly  
-- No cross-policy dependencies
```

## Impact on Seller Functionality

 **No impact on seller operations** - Seller service uses direct queries without relational embedding, so foreign key constraint changes don't affect seller functionality.

## Testing Checklist

- [ ] Cart items load with product details
- [ ] Order history displays correctly  
- [ ] Order details show all items
- [ ] No "embedding" errors in browser console
- [ ] No "recursion" errors in Supabase logs
- [ ] Seller dashboard still works normally
- [ ] Product management unchanged for sellers

## Notes

- React Query implementation was already correct and prevented infinite loops
- All existing frontend code remains functional
- Database changes are backward compatible
- Performance should improve due to cleaner constraint structure
