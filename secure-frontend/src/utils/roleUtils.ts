import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'seller' | 'buyer';

export interface UserWithRole extends SupabaseUser {
  role?: UserRole;
}

/**
 * Fetch user role from the users table in Supabase
 * Always fetches fresh data - no caching
 */
export const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    console.log('🔍 Fetching fresh user role for userId:', userId);
    
    // First, verify we have a valid auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Auth user verification failed:', authError);
      return null;
    }
    
    console.log('✅ Auth user verified:', {
      authUserId: authData.user.id,
      authUserEmail: authData.user.email,
      paramUserId: userId,
      idsMatch: userId === authData.user.id
    });

    // Always fetch fresh data from database
    const { data, error } = await supabase
      .from('users')
      .select('*')  // Select all columns to see the complete user record
      .eq('id', userId)
      .single(); // Use single() instead of maybeSingle() to ensure user exists

    console.log('🗄️ Database query completed');
    console.log('📊 Full user record from database:', data);
    console.log('⚠️ Query error:', error);

    // Handle specific error cases
    if (error) {
      console.error('❌ Error fetching user role:', error.message, error.details);
      
      // If user not found in users table, this is a problem
      if (error.code === 'PGRST116') {
        console.error(`❌ User ${userId} (${authData.user.email}) not found in users table!`);
        console.log('💡 User exists in auth.users but not in public.users table');
        return null;
      }
      return null;
    }

    // Validate role value
    const validRoles: UserRole[] = ['admin', 'seller', 'buyer'];
    const userRole = data.role as UserRole;
    
    console.log('🎭 Retrieved role from database:', userRole);
    console.log('✅ Role validation - Is valid:', validRoles.includes(userRole));
    console.log('📋 Complete user data:', {
      id: data.id,
      email: data.email,
      role: data.role,
      created_at: data.created_at
    });
    
    if (!validRoles.includes(userRole)) {
      console.error(`❌ Invalid role "${data.role}" for user ${userId}, returning null`);
      return null;
    }

    console.log(`🎉 Successfully fetched role: ${userRole} for user ${userId} (${authData.user.email})`);
    return userRole;
  } catch (error) {
    console.error('💥 Failed to fetch user role:', error);
    return null;
  }
};

/**
 * Role-based redirect logic
 */
export const getRoleBasedRedirect = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'buyer':
      return '/products';
    default:
      return '/products';
  }
};

/**
 * Check if user has required role for a route
 */
export const hasRequiredRole = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Otherwise, exact role match required
  return userRole === requiredRole;
};

/**
 * Get allowed roles for specific routes
 */
export const getRoutePermissions = (): Record<string, UserRole[]> => {
  return {
    '/dashboard': ['admin'],
    '/manage-products': ['seller', 'admin'],
    '/products': ['buyer', 'seller', 'admin'],
    '/cart': ['buyer', 'admin'],
    '/profile': ['buyer', 'seller', 'admin'], // All authenticated users
  };
};

/**
 * Safe localStorage wrapper to handle access restrictions
 */
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
  }
};

/**
 * Clear role cache - kept for backward compatibility but not used
 */
export const clearRoleCache = (): void => {
  // Remove any legacy cache
  safeLocalStorage.removeItem('user_role_cache');
  safeLocalStorage.removeItem('user_auth_cache');
};

/**
 * Refresh user role - always fetch fresh from database
 */
export const refreshUserRole = async (userId: string): Promise<UserRole | null> => {
  console.log('🔄 Refreshing user role (always fresh)...');
  return await fetchUserRole(userId);
};

/**
 * Validate if a role value is valid
 */
export const isValidRole = (role: any): role is UserRole => {
  return typeof role === 'string' && ['admin', 'seller', 'buyer'].includes(role);
};
