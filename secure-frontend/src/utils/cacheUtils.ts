/**
 * Cache utilities for managing session-based data persistence
 * Data persists across tab switches but clears on browser closure
 */

const CACHE_PREFIX = 'secureshop_cache_';
const AUTH_CACHE_KEY = `${CACHE_PREFIX}auth_state`;

/**
 * Safe sessionStorage access with fallback
 */
const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' && window.sessionStorage 
        ? sessionStorage.getItem(key) 
        : null;
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Only clear our cache items, not all sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(CACHE_PREFIX)) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
};

/**
 * Cache auth state for session duration
 */
export const cacheAuthState = (user: any, role: string | null, token: string | null): void => {
  try {
    const authState = {
      user,
      role,
      token,
      timestamp: Date.now()
    };
    safeSessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(authState));
  } catch (error) {
    console.warn('Failed to cache auth state:', error);
  }
};

/**
 * Retrieve cached auth state
 */
export const getCachedAuthState = (): { user: any; role: string | null; token: string | null } | null => {
  try {
    const cached = safeSessionStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;
    
    const authState = JSON.parse(cached);
    
    // Check if cache is too old (older than 4 hours)
    const MAX_AUTH_CACHE_AGE = 4 * 60 * 60 * 1000; // 4 hours
    if (Date.now() - authState.timestamp > MAX_AUTH_CACHE_AGE) {
      clearAuthCache();
      return null;
    }
    
    return {
      user: authState.user,
      role: authState.role,
      token: authState.token
    };
  } catch (error) {
    console.warn('Failed to retrieve cached auth state:', error);
    return null;
  }
};

/**
 * Clear auth cache
 */
export const clearAuthCache = (): void => {
  safeSessionStorage.removeItem(AUTH_CACHE_KEY);
};

/**
 * Clear all cache data
 */
export const clearAllCache = (): void => {
  safeSessionStorage.clear();
  
  // Also clear localStorage items that should reset on browser closure
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Remove specific cache items but keep user preferences if any
      localStorage.removeItem('user_role_cache');
      localStorage.removeItem('user_auth_cache');
    }
  } catch (error) {
    console.warn('Failed to clear localStorage cache items:', error);
  }
};

/**
 * Check if current tab/window is visible using Visibility API
 */
export const isTabVisible = (): boolean => {
  if (typeof document === 'undefined') return true;
  return !document.hidden;
};

/**
 * Add listener for visibility changes to prevent unnecessary operations
 */
export const addVisibilityChangeListener = (callback: (isVisible: boolean) => void): (() => void) => {
  if (typeof document === 'undefined') {
    return () => {}; // No-op cleanup function
  }
  
  const handleVisibilityChange = () => {
    callback(!document.hidden);
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Debounced function to prevent excessive operations during rapid tab switches
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
