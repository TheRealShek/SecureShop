-- Admin RLS Policies for SecureShop
-- These policies grant admin users full access to manage products and orders
-- Run these in your Supabase SQL editor

-- First, we need a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN POLICIES FOR PRODUCTS TABLE
-- ============================================

-- Admin can read ALL products (published, draft, archived)
CREATE POLICY "Admin can read all products" ON products
    FOR SELECT USING (auth.is_admin());

-- Admin can update ANY product
CREATE POLICY "Admin can update any product" ON products
    FOR UPDATE USING (auth.is_admin());

-- Admin can delete ANY product
CREATE POLICY "Admin can delete any product" ON products
    FOR DELETE USING (auth.is_admin());

-- Admin can create products (though typically sellers do this)
CREATE POLICY "Admin can create products" ON products
    FOR INSERT WITH CHECK (auth.is_admin());

-- ============================================
-- ADMIN POLICIES FOR USERS TABLE
-- ============================================

-- Admin can read all user profiles
CREATE POLICY "Admin can read all users" ON users
    FOR SELECT USING (auth.is_admin());

-- Admin can update any user profile
CREATE POLICY "Admin can update any user" ON users
    FOR UPDATE USING (auth.is_admin());

-- ============================================
-- ADMIN POLICIES FOR ORDERS TABLE
-- ============================================

-- Admin can read all orders
CREATE POLICY "Admin can read all orders" ON orders
    FOR SELECT USING (auth.is_admin());

-- Admin can update any order (status changes, etc.)
CREATE POLICY "Admin can update any order" ON orders
    FOR UPDATE USING (auth.is_admin());

-- Admin can delete any order (for cancellations, etc.)
CREATE POLICY "Admin can delete any order" ON orders
    FOR DELETE USING (auth.is_admin());

-- ============================================
-- ADMIN POLICIES FOR ORDER_ITEMS TABLE
-- ============================================

-- Admin can read all order items
CREATE POLICY "Admin can read all order items" ON order_items
    FOR SELECT USING (auth.is_admin());

-- Admin can update any order item
CREATE POLICY "Admin can update any order item" ON order_items
    FOR UPDATE USING (auth.is_admin());

-- Admin can delete any order item
CREATE POLICY "Admin can delete any order item" ON order_items
    FOR DELETE USING (auth.is_admin());

-- ============================================
-- ADMIN POLICIES FOR CART_ITEMS TABLE
-- ============================================

-- Admin can read all cart items (for moderation purposes)
CREATE POLICY "Admin can read all cart items" ON cart_items
    FOR SELECT USING (auth.is_admin());

-- Admin can update any cart item (for customer support)
CREATE POLICY "Admin can update any cart items" ON cart_items
    FOR UPDATE USING (auth.is_admin());

-- Admin can delete any cart item (for moderation)
CREATE POLICY "Admin can delete any cart items" ON cart_items
    FOR DELETE USING (auth.is_admin());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test the helper function (run this to verify it works)
-- SELECT auth.is_admin();

-- Check all policies for products table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'products';

-- ============================================
-- NOTES
-- ============================================

-- 1. These policies give admin users full CRUD access to all tables
-- 2. The auth.is_admin() function checks if the current authenticated user has role = 'admin'
-- 3. These policies work alongside existing seller and buyer policies
-- 4. Admin policies have higher precedence due to their permissive nature
-- 5. Make sure your admin users have role = 'admin' in the users table

-- ============================================
-- HOW TO APPLY THESE POLICIES
-- ============================================

-- 1. Copy and paste this entire file into your Supabase SQL Editor
-- 2. Execute it (it will create the function and all policies)
-- 3. Verify admin functionality is working in your application
-- 4. Test that non-admin users still have proper restrictions
