import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'seller' | 'buyer';

export interface UserWithRole extends SupabaseUser {
  role?: UserRole;
}

/**
 * Fetch user role from the users table in Supabase
 */
export const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    // Use maybeSingle() to handle cases where user might not exist in users table
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    // Handle specific error cases
    if (error) {
      console.error('Error fetching user role:', error.message, error.details);
      return null;
    }

    // If no user found in users table, return default role
    if (!data) {
      console.warn(`User ${userId} not found in users table, defaulting to buyer role`);
      return 'buyer';
    }

    // Validate role value
    const validRoles: UserRole[] = ['admin', 'seller', 'buyer'];
    const userRole = data.role as UserRole;
    
    if (!validRoles.includes(userRole)) {
      console.error(`Invalid role "${data.role}" for user ${userId}, defaulting to buyer`);
      return 'buyer';
    }

    return userRole;
  } catch (error) {
    console.error('Failed to fetch user role:', error);
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
      return '/manage-products';
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
 * Cache user role in localStorage with expiration
 */
export const cacheUserRole = (userId: string, role: UserRole): void => {
  const cacheData = {
    role,
    timestamp: Date.now(),
    userId
  };
  safeLocalStorage.setItem('user_role_cache', JSON.stringify(cacheData));
};

/**
 * Get cached user role if still valid (1 hour cache)
 */
export const getCachedUserRole = (userId: string): UserRole | null => {
  try {
    const cached = safeLocalStorage.getItem('user_role_cache');
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const oneHour = 60 * 60 * 1000;
    
    // Check if cache is expired or for different user
    if (
      Date.now() - cacheData.timestamp > oneHour ||
      cacheData.userId !== userId
    ) {
      safeLocalStorage.removeItem('user_role_cache');
      return null;
    }

    return cacheData.role;
  } catch (error) {
    console.error('Error reading role cache:', error);
    safeLocalStorage.removeItem('user_role_cache');
    return null;
  }
};

/**
 * Clear role cache
 */
export const clearRoleCache = (): void => {
  safeLocalStorage.removeItem('user_role_cache');
};

/**
 * Refresh user role - force fetch from database
 */
export const refreshUserRole = async (userId: string): Promise<UserRole | null> => {
  clearRoleCache();
  return await fetchUserRole(userId);
};

/**
 * Validate if a role value is valid
 */
export const isValidRole = (role: any): role is UserRole => {
  return typeof role === 'string' && ['admin', 'seller', 'buyer'].includes(role);
};
