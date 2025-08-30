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
    console.log(' Fetching fresh user role for userId:', userId);
    
    // First, verify we have a valid auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error(' Auth user verification failed:', authError);
      return null;
    }
    
    console.log(' Auth user verified:', {
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

    console.log(' Database query completed');
    console.log(' Full user record from database:', data);
    console.log(' Query error:', error);

    // Handle specific error cases
    if (error) {
      console.error(' Error fetching user role:', error.message, error.details);
      
      // If user not found in users table, this is a problem
      if (error.code === 'PGRST116') {
        console.error(` User ${userId} (${authData.user.email}) not found in users table!`);
        console.log(' User exists in auth.users but not in public.users table');
        return null;
      }
      return null;
    }

    // Validate role value
    const validRoles: UserRole[] = ['admin', 'seller', 'buyer'];
    const userRole = data.role as UserRole;
    
    console.log(' Retrieved role from database:', userRole);
    console.log(' Role validation - Is valid:', validRoles.includes(userRole));
    console.log(' Complete user data:', {
      id: data.id,
      email: data.email,
      role: data.role,
      created_at: data.created_at
    });
    
    if (!validRoles.includes(userRole)) {
      console.error(` Invalid role "${data.role}" for user ${userId}, returning null`);
      return null;
    }

    console.log(` Successfully fetched role: ${userRole} for user ${userId} (${authData.user.email})`);
    return userRole;
  } catch (error) {
    console.error(' Failed to fetch user role:', error);
    return null;
  }
};

/**
 * Role-based redirect logic - returns null if role is not ready to prevent premature redirects
 */
export const getRoleBasedRedirect = (role: UserRole | null): string | null => {
  // Return null if role is not set - prevents premature redirects during loading
  if (!role) {
    return null;
  }
  
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'buyer':
      return '/products';
    default:
      return '/login'; // Fallback for unknown roles - go to dashboard instead of products
  }
};

/**
 * Check if user has required role for a route
 * UPDATED: Admin users are now restricted to /dashboard only
 */
export const hasRequiredRole = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  // SPECIAL CASE: Admin can only access /dashboard
  // This prevents admins from accessing buyer/seller routes
  if (userRole === 'admin') {
    return requiredRole === 'admin';
  }
  
  // For non-admin users: exact role match required
  return userRole === requiredRole;
};

/**
 * Get allowed roles for specific routes
 * UPDATED: Admin restricted to dashboard only
 */
export const getRoutePermissions = (): Record<string, UserRole[]> => {
  return {
    '/dashboard': ['admin'],
    '/admin/products': ['admin'], // Admin product management routes
    '/manage-products': ['seller'], // Removed admin - admin uses dashboard instead
    '/products': ['buyer', 'seller'], // Removed admin - admin uses dashboard instead
    '/cart': ['buyer'], // Removed admin - admin doesn't need cart
    '/orders': ['buyer'], // Admin doesn't need orders
    '/seller/dashboard': ['seller'],
    '/seller/products': ['seller'],
    '/seller/orders': ['seller'],
    '/profile': ['buyer', 'seller', 'admin'], // All authenticated users can access profile
  };
};

/**
 * Check if admin user should be redirected to dashboard
 * Returns true if admin is trying to access routes other than dashboard
 */
export const shouldRedirectAdminToDashboard = (userRole: UserRole | null, currentPath: string): boolean => {
  if (userRole !== 'admin') return false;
  
  // Allow admin to access dashboard, profile, and admin-specific routes
  const allowedAdminPaths = ['/dashboard', '/profile', '/admin/'];
  
  // Check if current path starts with any allowed path
  return !allowedAdminPaths.some(allowedPath => currentPath.startsWith(allowedPath));
};

/**
 * Get redirect path for role-based access control
 * For admins trying to access non-dashboard routes, redirect to dashboard
 */
export const getAccessControlRedirect = (userRole: UserRole | null, currentPath: string): string | null => {
  if (shouldRedirectAdminToDashboard(userRole, currentPath)) {
    return '/dashboard';
  }
  return null;
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
  console.log(' Refreshing user role (always fresh)...');
  return await fetchUserRole(userId);
};

/**
 * Validate if a role value is valid
 */
export const isValidRole = (role: any): role is UserRole => {
  return typeof role === 'string' && ['admin', 'seller', 'buyer'].includes(role);
};
