# Admin RLS Policies Setup Guide

## Current Issue
You correctly identified that admin users can see products but cannot update/delete them because:

1. **Admin can READ products** due to the broad policy: `"Authenticated users can read published products"`
2. **Admin CANNOT UPDATE/DELETE products** because the existing policies only allow sellers to modify their own products

## Why Admin Needs Specific Policies

### Before Admin Policies (Current State):
```sql
-- Products table policies:
✅ "Authenticated users can read published products" (allows admin to read)
✅ "Sellers can read own products" (doesn't apply to admin)
❌ "Sellers can update own products" (admin is not the seller)
❌ "Sellers can delete own products" (admin is not the seller)
```

### After Admin Policies (Fixed State):
```sql
-- Products table policies:
✅ "Authenticated users can read published products" (allows admin to read)
✅ "Sellers can read own products" (doesn't apply to admin)
✅ "Admin can read all products" (admin gets full read access)
✅ "Admin can update any product" (admin can now update)
✅ "Admin can delete any product" (admin can now delete)
❌ "Sellers can update own products" (still restricted to sellers)
❌ "Sellers can delete own products" (still restricted to sellers)
```

## How RLS Policies Work

### Policy Evaluation
- RLS policies use **OR logic** - if ANY policy grants access, the operation is allowed
- Admin policies are **additive** to existing policies
- Existing seller/buyer policies remain unchanged

### The Helper Function
```sql
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
```

This function:
- Checks if the current authenticated user (`auth.uid()`) has `role = 'admin'`
- Returns `true` for admin users, `false` for others
- Is used in all admin policies for consistent role checking

## Step-by-Step Setup

### 1. Apply the Policies
```sql
-- Copy the content from admin-policies.sql
-- Paste into Supabase SQL Editor
-- Execute the script
```

### 2. Verify Admin User Setup
Make sure your admin user exists:
```sql
-- Check if admin user exists
SELECT id, email, role 
FROM users 
WHERE role = 'admin';

-- If no admin user exists, create one (replace with actual admin email)
INSERT INTO users (email, role) 
VALUES ('admin@secureshop.com', 'admin');
```

### 3. Test the Helper Function
```sql
-- Test as admin user
SELECT auth.is_admin(); -- Should return true for admin

-- Test as non-admin user
-- (login as seller/buyer first)
SELECT auth.is_admin(); -- Should return false for non-admin
```

### 4. Verify Policies Are Active
```sql
-- Check all policies for products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;
```

## Expected Behavior After Setup

### Admin Users Can:
- ✅ Read ALL products (published, draft, archived)
- ✅ Update ANY product (regardless of seller)
- ✅ Delete ANY product (regardless of seller)
- ✅ Read all users, orders, cart items
- ✅ Manage any order status

### Seller Users Can Still:
- ✅ Read published products + their own products
- ✅ Update/delete only their own products
- ❌ Cannot access other sellers' products
- ❌ Cannot access admin-only features

### Buyer Users Can Still:
- ✅ Read published products only
- ✅ Manage their own cart and orders
- ❌ Cannot access seller/admin features

## Security Notes

1. **Principle of Least Privilege**: Admin policies grant broad access, so ensure only trusted users have admin role
2. **Audit Trail**: Consider adding logging for admin actions
3. **Role Verification**: The `auth.is_admin()` function ensures only users with `role = 'admin'` get admin access
4. **Existing Policies**: All existing buyer/seller restrictions remain in place

## Troubleshooting

### If Admin Still Cannot Update Products:
1. Verify admin user has `role = 'admin'` in users table
2. Check that policies were applied successfully
3. Ensure the admin user is properly authenticated
4. Test the `auth.is_admin()` function returns `true`

### If Regular Users Lost Access:
1. Policies are additive - existing policies should still work
2. Check if any existing policies were accidentally modified
3. Verify `auth.uid()` returns correct user IDs

## Policy List Summary

The following policies will be created:

**Products Table:**
- Admin can read all products
- Admin can update any product
- Admin can delete any product
- Admin can create products

**Users Table:**
- Admin can read all users
- Admin can update any user

**Orders Table:**
- Admin can read all orders
- Admin can update any order
- Admin can delete any order

**Order Items Table:**
- Admin can read all order items
- Admin can update any order item
- Admin can delete any order item

**Cart Items Table:**
- Admin can read all cart items
- Admin can update any cart items
- Admin can delete any cart items
