/**
 * Utility functions for managing session and storage cleanup
 */

/**
 * Completely clear all browser storage and force a clean session
 */
export const forceCleanSession = (): void => {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    
    // Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }
    
    // Clear any IndexedDB databases (Supabase might use this)
    if (typeof window !== 'undefined' && window.indexedDB) {
      // This will clear Supabase's internal storage
      try {
        const databases = ['supabase.auth.token'];
        databases.forEach(dbName => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => console.log(`Cleared ${dbName}`);
          deleteReq.onerror = () => console.warn(`Failed to clear ${dbName}`);
        });
      } catch (idbError) {
        console.warn('IndexedDB clear failed:', idbError);
      }
    }
    
    // Clear any cookies (though Supabase typically uses localStorage)
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
    
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Force refresh the current page after a delay
 */
export const forcePageRefresh = (delay = 100): void => {
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, delay);
};

/**
 * Navigate to login with complete session cleanup
 */
export const forceNavigateToLogin = (): void => {
  forceCleanSession();
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, 100);
};
