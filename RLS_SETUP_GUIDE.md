# RLS Policies Setup Guide for SecureShop

## Issue Summary
The seller dashboard was failing to load products and showing "infinite recursion detected in policy" errors because Row Level Security (RLS) policies were not properly configured in Supabase.

## Steps to Fix

### 1. Apply RLS Policies to Supabase Database

Go to your Supabase Dashboard → SQL Editor and run the following SQL script:

```sql
-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for products table
-- Allow all authenticated users to read published products (buyers, sellers, admins)
CREATE POLICY "Authenticated users can read published products" ON products
    FOR SELECT USING (status = 'published');

-- Sellers can read their own products (all statuses)
CREATE POLICY "Sellers can read own products" ON products
    FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can create products
CREATE POLICY "Sellers can create products" ON products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products" ON products
    FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for cart_items table
-- Users can manage their own cart items
CREATE POLICY "Users can read own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders table
-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update their own orders (limited scenarios)
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id);

-- RLS Policies for order_items table
-- Users can read order items for their own orders
CREATE POLICY "Users can read own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.buyer_id = auth.uid()
        )
    );

-- Sellers can read order items for their products
CREATE POLICY "Sellers can read order items for own products" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = order_items.product_id 
            AND products.seller_id = auth.uid()
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.buyer_id = auth.uid()
        )
    );
```

### 2. Database Schema Updates

Make sure your Supabase database tables have the correct structure:

#### Orders Table
The orders table should use `buyer_id` instead of `user_id`:
```sql
-- If your orders table uses user_id, rename it to buyer_id
ALTER TABLE orders RENAME COLUMN user_id TO buyer_id;
```

#### Products Table  
Make sure the products table uses `image_url` column:
```sql
-- If your products table uses image, rename it to image_url
ALTER TABLE products RENAME COLUMN image TO image_url;
```

### 3. What These Policies Allow

**For Buyers:**
- Can read all published products
- Can manage their own cart items
- Can read their own orders and order items

**For Sellers:**
- Can read all published products (when browsing as customers)
- Can read, create, update, and delete their own products (all statuses)
- Can read order items for products they sell
- Can manage their own cart items
- Can read their own orders

**For Admins:**
- Have the same permissions as sellers and buyers combined

### 4. Testing

After applying these policies:

1. Sellers should be able to view their own products in the seller dashboard
2. Buyers should be able to browse all published products
3. The "infinite recursion" errors should be resolved
4. Orders functionality should work properly

### 5. Files Updated

The following files have been updated in your codebase:
- `secure-backend/database/schema.sql` - Complete schema with RLS policies
- `secure-backend/database/apply_rls_policies.sql` - Standalone RLS policies file
- `secure-frontend/src/pages/SellerDashboardPage.tsx` - Re-enabled orders fetching

## Important Notes

1. **Apply the policies in Supabase first** before testing the application
2. Make sure your Supabase Auth is properly configured
3. Ensure users have the correct roles in the users table
4. Test with different user roles to verify access controls work correctly

## Troubleshooting

If you still see issues:
1. Check that the policies were applied successfully in Supabase
2. Verify that your users have the correct roles in the database
3. Check the browser console for any new errors
4. Ensure the `seller_id` in products matches the authenticated user's ID
