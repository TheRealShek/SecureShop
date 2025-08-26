/**
 * Utility functions for managing session and storage cleanup
 * Note: These utilities are now deprecated in favor of the unified logoutCleanup.ts
 * They remain for backward compatibility
 */

/**
 * @deprecated Use performCompleteLogout from logoutCleanup.ts instead
 * Completely clear all browser storage and force a clean session
 */
export const forceCleanSession = async (): Promise<void> => {
  try {
    console.log('⚠️ Warning: forceCleanSession is deprecated. Use performCompleteLogout from logoutCleanup.ts');
    
    // Import and use the new unified cleanup
    const { performCompleteLogout } = await import('./logoutCleanup');
    await performCompleteLogout();
    
  } catch (error) {
    console.error('❌ New cleanup failed, falling back to legacy method:', error);
    
    // Fallback to legacy cleanup
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
      
    } catch (fallbackError) {
      console.error('❌ Legacy cleanup also failed:', fallbackError);
    }
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
 * @deprecated Use safeLogoutAndNavigate from logoutCleanup.ts instead
 * Navigate to login with complete session cleanup
 */
export const forceNavigateToLogin = async (): Promise<void> => {
  try {
    console.log('⚠️ Warning: forceNavigateToLogin is deprecated. Use safeLogoutAndNavigate from logoutCleanup.ts');
    
    // Import and use the new unified cleanup
    const { safeLogoutAndNavigate } = await import('./logoutCleanup');
    await safeLogoutAndNavigate();
    
  } catch (error) {
    console.error('❌ New cleanup failed, falling back to legacy method:', error);
    
    // Fallback to legacy method
    await forceCleanSession();
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 100);
  }
};
