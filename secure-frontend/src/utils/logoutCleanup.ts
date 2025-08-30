/**
 * Unified logout cleanup utility
 * This ensures consistent cleanup across all roles and prevents ghost sessions
 */

import { supabase } from '../services/supabase';
import { clearRoleCache } from './roleUtils';

/**
 * Complete session cleanup function that works across all roles
 * This function should be used for all logout operations
 */
export const performCompleteLogout = async (): Promise<void> => {
  try {
    console.log(' Starting complete logout cleanup...');

    // Step 1: Sign out from Supabase first
    try {
      console.log(' Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(' Supabase signout error:', error);
      } else {
        console.log(' Supabase signout successful');
      }
    } catch (supabaseError) {
      console.error(' Supabase signout failed:', supabaseError);
    }

    // Step 2: Clear all localStorage entries
    try {
      console.log(' Clearing localStorage...');
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear specific auth-related keys first
        const authKeys = [
          'token',
          'user_role_cache',
          'user_data',
          'sb-auth-token',
          'supabase.auth.token',
          'auth_token',
          'role'
        ];
        
        authKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Then clear everything to be safe
        localStorage.clear();
        console.log(' localStorage cleared');
      }
    } catch (localStorageError) {
      console.error(' localStorage clear failed:', localStorageError);
    }

    // Step 3: Clear all sessionStorage entries
    try {
      console.log(' Clearing sessionStorage...');
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
        console.log(' sessionStorage cleared');
      }
    } catch (sessionStorageError) {
      console.error(' sessionStorage clear failed:', sessionStorageError);
    }

    // Step 4: Clear role cache using utility function
    try {
      console.log(' Clearing role cache...');
      clearRoleCache();
      console.log(' Role cache cleared');
    } catch (roleCacheError) {
      console.error(' Role cache clear failed:', roleCacheError);
    }

    // Step 5: Clear IndexedDB databases (Supabase may use this)
    try {
      console.log(' Clearing IndexedDB...');
      if (typeof window !== 'undefined' && window.indexedDB) {
        const databases = [
          'supabase.auth.token',
          'keyval-store',
          'SupabaseStore'
        ];
        
        databases.forEach(dbName => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => console.log(` Cleared IndexedDB: ${dbName}`);
          deleteReq.onerror = () => console.warn(` Failed to clear IndexedDB: ${dbName}`);
        });
      }
    } catch (indexedDBError) {
      console.error(' IndexedDB clear failed:', indexedDBError);
    }

    // Step 6: Clear all cookies
    try {
      console.log(' Clearing cookies...');
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Clear for current domain
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          
          // Clear for parent domain if applicable
          const hostname = window.location.hostname;
          if (hostname.includes('.')) {
            const parentDomain = '.' + hostname.split('.').slice(-2).join('.');
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
          }
        });
        console.log(' Cookies cleared');
      }
    } catch (cookieError) {
      console.error(' Cookie clear failed:', cookieError);
    }

    console.log(' Complete logout cleanup finished');

  } catch (error) {
    console.error(' Critical error during logout cleanup:', error);
    throw error;
  }
};

/**
 * Safe logout that navigates to login page
 * This is the main function to be used by components
 */
export const safeLogoutAndNavigate = async (): Promise<void> => {
  try {
    await performCompleteLogout();
    
    // Navigate to login page after cleanup
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log(' Navigating to login page...');
        window.location.href = '/login';
      }
    }, 100);
    
  } catch (error) {
    console.error(' Safe logout failed:', error);
    
    // Even if cleanup fails, still try to navigate
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log(' Force navigating to login page after error...');
        window.location.href = '/login';
      }
    }, 100);
  }
};

/**
 * Force logout for emergency situations
 * This is more aggressive and includes page reload
 */
export const forceLogoutAndReload = async (): Promise<void> => {
  try {
    await performCompleteLogout();
    
    // Force a complete page reload to ensure clean slate
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log(' Force reloading page...');
        window.location.href = '/login';
        window.location.reload();
      }
    }, 100);
    
  } catch (error) {
    console.error(' Force logout failed:', error);
    
    // Ultimate fallback - just reload everything
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
        window.location.reload();
      }
    }, 100);
  }
};
