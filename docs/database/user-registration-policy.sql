-- Supabase RLS Policy for User Registration
-- This policy allows new users to insert their own profile during registration

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile during registration" ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Complete set of policies for users table:

-- 1. Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile (for registration)
-- (This is the new policy we're adding)
CREATE POLICY "Users can insert own profile during registration" ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Optional: Allow admins to read all user profiles (if needed)
-- CREATE POLICY "Admins can read all profiles" ON public.users
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- Verify policies are working
-- SELECT * FROM pg_policies WHERE tablename = 'users';
