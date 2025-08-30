import { supabase } from '../../services/supabase';
import { fetchUserRole } from '../../utils/roleUtils';

/**
 * Authentication Utilities
 * 
 * Utilities for handling authentication, session management,
 * and user role determination across the application.
 */

/**
 * Get the current authenticated user's role from database (always fresh)
 * 
 * @returns Promise<string | null> The user's role or null if not authenticated
 */
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    console.log(' [DEBUG] Getting current user role...');
    
    // Get current user first
    const { data: userData } = await supabase.auth.getUser();
    console.log(' [DEBUG] User data from Supabase:', {
      user: userData.user ? {
        id: userData.user.id,
        email: userData.user.email,
        created_at: userData.user.created_at
      } : null
    });
    
    if (!userData.user) {
      console.log(' [DEBUG] No user found');
      return null;
    }
    
    // Get fresh role from database (no caching)
    const role = await fetchUserRole(userData.user.id);
    console.log(' [DEBUG] Fresh role for user:', {
      userId: userData.user.id,
      role: role
    });
    
    return role;
  } catch (error) {
    console.error(' [DEBUG] Error getting user role:', error);
    return null;
  }
};

/**
 * Check if the current user is authenticated
 * 
 * @returns Promise<boolean> True if user has a valid session
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get the current user's ID
 * 
 * @returns Promise<string | null> The user's ID or null if not authenticated
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Get the current user's session
 * 
 * @returns Promise<Session | null> The current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Check if user has a specific role
 * 
 * @param requiredRole - The role to check for
 * @returns Promise<boolean> True if user has the required role
 */
export const hasRole = async (requiredRole: string): Promise<boolean> => {
  const userRole = await getCurrentUserRole();
  return userRole === requiredRole;
};

/**
 * Logout user and clear session using unified cleanup
 */
export const logout = async (): Promise<void> => {
  // Import the unified cleanup function
  const { safeLogoutAndNavigate } = await import('../../utils/logoutCleanup');
  
  try {
    console.log(' API utils logout - using unified cleanup...');
    await safeLogoutAndNavigate();
  } catch (error) {
    console.error(' API utils logout failed, using fallback:', error);
    
    // Fallback to original logic if unified cleanup fails
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (fallbackError) {
      console.error(' Fallback logout failed:', fallbackError);
      // Force redirect even if everything fails
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
};
