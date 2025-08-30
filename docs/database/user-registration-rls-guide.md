# Supabase RLS Policies for User Registration

## Overview
This document outlines the Row Level Security (RLS) policies needed for the SecureShop application to handle user registration and profile management.

## Current Policies (as mentioned)
1.  Users can read own profile
2.  Users can select their own row  
3.  Users can update own profile
4.  Users can update their own row

## New Policy Required for Registration
5. **Users can insert own profile during registration** - This allows new users to create their profile record during the registration process.

## Complete RLS Setup

### 1. Enable RLS on users table
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 2. Policy for Reading Own Profile
```sql
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT
USING (auth.uid() = id);
```

### 3. Policy for Updating Own Profile
```sql
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 4. **NEW Policy for Registration (Profile Creation)**
```sql
CREATE POLICY "Users can insert own profile during registration" ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);
```

## How Registration Works with This Policy

1. **User Registration Process**:
   ```typescript
   // Step 1: Create user in Supabase Auth
   const { data } = await supabase.auth.signUp({
     email, password,
     options: { data: { role: role } }
   });
   
   // Step 2: Insert profile in users table (THIS NEEDS THE NEW POLICY)
   await supabase.from('users').insert({
     id: data.user.id,  // This matches auth.uid()
     email: email,
     role: role
   });
   ```

2. **Security Validation**:
   - The `WITH CHECK (auth.uid() = id)` ensures users can only create profiles with their own authenticated user ID
   - Prevents users from creating profiles for other users
   - Maintains data integrity and security

## Additional Security Considerations

### Optional Admin Policies
If you need admin users to manage other profiles:

```sql
-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles" ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Prevent Profile Deletion
If you want to prevent users from deleting their profiles:

```sql
-- No DELETE policy = no one can delete profiles
-- Or, allow only admins to delete:
CREATE POLICY "Only admins can delete profiles" ON public.users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Testing the Policies

After applying the policies, test with:

```sql
-- View all policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test as a regular user (should only see own profile)
SELECT * FROM public.users WHERE id = auth.uid();

-- Test insertion (should work for own ID only)
INSERT INTO public.users (id, email, role) 
VALUES (auth.uid(), 'test@example.com', 'buyer');
```

## Implementation Notes

1. **Apply the INSERT policy** to allow registration to work
2. **Keep existing policies** for read/update functionality  
3. **Test thoroughly** with different user roles
4. **Monitor logs** for any policy violations
5. **Consider backup/recovery** procedures for policy changes

This setup ensures secure user registration while maintaining proper access controls for profile management.
