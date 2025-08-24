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
    console.log('🔍 fetchUserRole called with userId:', userId);
    
    // First, verify we have a valid auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Auth user verification failed:', authError);
      return null;
    }
    
    console.log('✅ Auth user verified. Auth user ID:', authData.user.id);
    console.log('🔗 Comparing IDs - Param userId:', userId, 'Auth userId:', authData.user.id);
    console.log('📏 ID match:', userId === authData.user.id);

    // Use maybeSingle() to handle cases where user might not exist in users table
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    console.log('🗄️ Database query completed');
    console.log('📊 Query result data:', data);
    console.log('⚠️ Query error:', error);

    // Handle specific error cases
    if (error) {
      console.error('❌ Error fetching user role:', error.message, error.details);
      return null;
    }

    // If no user found in users table, return default role
    if (!data) {
      console.warn(`⚠️ User ${userId} not found in users table, defaulting to buyer role`);
      console.log('💡 Consider running this SQL query in Supabase to check:');
      console.log(`   SELECT role FROM users WHERE id = '${userId}';`);
      return 'buyer';
    }

    // Validate role value
    const validRoles: UserRole[] = ['admin', 'seller', 'buyer'];
    const userRole = data.role as UserRole;
    
    console.log('🎭 Retrieved role from database:', userRole);
    console.log('✅ Role validation - Is valid:', validRoles.includes(userRole));
    
    if (!validRoles.includes(userRole)) {
      console.error(`❌ Invalid role "${data.role}" for user ${userId}, defaulting to buyer`);
      return 'buyer';
    }

    console.log(`🎉 Successfully fetched role: ${userRole} for user ${userId}`);
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
  console.log('💾 [DEBUG] getCachedUserRole called with userId:', userId);
  
  try {
    const cached = safeLocalStorage.getItem('user_role_cache');
    console.log('💾 [DEBUG] Raw cache data:', cached);
    
    if (!cached) {
      console.log('💾 [DEBUG] No cache found');
      return null;
    }

    const cacheData = JSON.parse(cached);
    console.log('💾 [DEBUG] Parsed cache data:', cacheData);
    
    const oneHour = 60 * 60 * 1000;
    const currentTime = Date.now();
    const cacheAge = currentTime - cacheData.timestamp;
    
    console.log('💾 [DEBUG] Cache validation:', {
      currentTime,
      cacheTimestamp: cacheData.timestamp,
      cacheAge,
      oneHour,
      isExpired: cacheAge > oneHour,
      userIdMatch: cacheData.userId === userId,
      requestedUserId: userId,
      cachedUserId: cacheData.userId
    });
    
    // Check if cache is expired or for different user
    if (
      cacheAge > oneHour ||
      cacheData.userId !== userId
    ) {
      console.log('💾 [DEBUG] Cache invalid, removing:', {
        reason: cacheAge > oneHour ? 'expired' : 'different user'
      });
      safeLocalStorage.removeItem('user_role_cache');
      return null;
    }

    console.log('✅ [DEBUG] Valid cache found, returning role:', cacheData.role);
    return cacheData.role;
  } catch (error) {
    console.error('❌ [DEBUG] Error reading role cache:', error);
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
