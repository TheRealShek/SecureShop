-- Admin Policies for Products Table
-- Run these commands in your Supabase SQL Editor

-- 1. First, create the helper function to check if user is admin
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

-- 2. Admin can read ALL products (published, draft, archived)
CREATE POLICY "Admin can read all products" ON products
    FOR SELECT USING (auth.is_admin());

-- 3. Admin can update ANY product
CREATE POLICY "Admin can update any product" ON products
    FOR UPDATE USING (auth.is_admin());

-- 4. Admin can delete ANY product
CREATE POLICY "Admin can delete any product" ON products
    FOR DELETE USING (auth.is_admin());

-- 5. Admin can create products (optional - usually sellers do this)
CREATE POLICY "Admin can create products" ON products
    FOR INSERT WITH CHECK (auth.is_admin());

-- 6. Verify the policies were created successfully
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%Admin%'
ORDER BY policyname;
