/**
 * Enhanced Session Manager for SecureShop
 * 
 * This utility creates a clear separation between:
 * - Supabase auth session (handled by Supabase SDK)
 * - sessionStorage for temporary app cache (cleared on browser close)
 * - localStorage for persistent login tokens (only when explicitly required)
 */

import { supabase } from '../services/supabase';
import type { UserRole } from './roleUtils';

/**
 * Configuration for persistent login
 */
interface PersistentLoginConfig {
  rememberMe: boolean;
  duration?: number; // in milliseconds, default 30 days
}

/**
 * Session cache item with expiration
 */
interface CacheItem {
  value: any;
  timestamp: number;
  expires?: number;
}

/**
 * Enhanced session manager with clear storage separation
 */
export class SessionManager {
  // Keys for different storage types
  private static readonly PERSISTENT_TOKEN_KEY = 'secureshop_persistent_token';
  private static readonly SESSION_CACHE_PREFIX = 'secureshop_cache_';
  private static readonly ROLE_CACHE_KEY = 'user_role_cache';
  private static readonly USER_DATA_KEY = 'user_data_cache';
  
  // Default cache durations
  private static readonly DEFAULT_PERSISTENT_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly DEFAULT_SESSION_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  /**
   * Supabase Session Management
   * Let Supabase handle the actual authentication session
   */
  static async getSupabaseSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to get Supabase session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Error getting Supabase session:', error);
      return null;
    }
  }

  static async validateSupabaseSession(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return !error && !!user;
    } catch (error) {
      console.error('Error validating Supabase session:', error);
      return false;
    }
  }

  /**
   * Session Storage (Temporary Cache - cleared on browser close)
   */
  static setSessionCache(key: string, value: any, expiresIn?: number): void {
    try {
      const cacheItem: CacheItem = {
        value,
        timestamp: Date.now(),
        expires: expiresIn ? Date.now() + expiresIn : undefined
      };
      
      const cacheKey = `${this.SESSION_CACHE_PREFIX}${key}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      
      console.log(`📦 Session cache set: ${key}`);
    } catch (error) {
      console.warn(`Failed to set session cache for ${key}:`, error);
    }
  }

  static getSessionCache<T = any>(key: string): T | null {
    try {
      const cacheKey = `${this.SESSION_CACHE_PREFIX}${key}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      
      // Check expiration
      if (cacheItem.expires && Date.now() > cacheItem.expires) {
        sessionStorage.removeItem(cacheKey);
        console.log(`📦 Session cache expired: ${key}`);
        return null;
      }

      console.log(`📦 Session cache hit: ${key}`);
      return cacheItem.value;
    } catch (error) {
      console.warn(`Failed to get session cache for ${key}:`, error);
      return null;
    }
  }

  static removeSessionCache(key: string): void {
    try {
      const cacheKey = `${this.SESSION_CACHE_PREFIX}${key}`;
      sessionStorage.removeItem(cacheKey);
      console.log(`📦 Session cache removed: ${key}`);
    } catch (error) {
      console.warn(`Failed to remove session cache for ${key}:`, error);
    }
  }

  static clearAllSessionCache(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.SESSION_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('📦 All session cache cleared');
    } catch (error) {
      console.warn('Failed to clear session cache:', error);
    }
  }

  /**
   * Local Storage (Persistent tokens - only when explicitly required)
   */
  static setPersistentToken(token: string, config: PersistentLoginConfig): void {
    if (!config.rememberMe) {
      console.log('🔐 Remember me disabled, not storing persistent token');
      return;
    }

    try {
      const duration = config.duration || this.DEFAULT_PERSISTENT_DURATION;
      const cacheItem: CacheItem = {
        value: token,
        timestamp: Date.now(),
        expires: Date.now() + duration
      };

      localStorage.setItem(this.PERSISTENT_TOKEN_KEY, JSON.stringify(cacheItem));
      console.log('🔐 Persistent token stored');
    } catch (error) {
      console.warn('Failed to store persistent token:', error);
    }
  }

  static getPersistentToken(): string | null {
    try {
      const cached = localStorage.getItem(this.PERSISTENT_TOKEN_KEY);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      
      // Check expiration
      if (cacheItem.expires && Date.now() > cacheItem.expires) {
        localStorage.removeItem(this.PERSISTENT_TOKEN_KEY);
        console.log('🔐 Persistent token expired');
        return null;
      }

      console.log('🔐 Persistent token retrieved');
      return cacheItem.value;
    } catch (error) {
      console.warn('Failed to get persistent token:', error);
      return null;
    }
  }

  static removePersistentToken(): void {
    try {
      localStorage.removeItem(this.PERSISTENT_TOKEN_KEY);
      console.log('🔐 Persistent token removed');
    } catch (error) {
      console.warn('Failed to remove persistent token:', error);
    }
  }

  /**
   * Role and User Data Caching
   */
  static cacheUserRole(userId: string, role: UserRole): void {
    const cacheData = {
      userId,
      role,
      timestamp: Date.now()
    };
    
    this.setSessionCache(this.ROLE_CACHE_KEY, cacheData, this.DEFAULT_SESSION_CACHE_DURATION);
  }

  static getCachedUserRole(userId: string): UserRole | null {
    const cached = this.getSessionCache<{ userId: string; role: UserRole; timestamp: number }>(this.ROLE_CACHE_KEY);
    
    if (!cached || cached.userId !== userId) {
      return null;
    }

    return cached.role;
  }

  static cacheUserData(user: any): void {
    this.setSessionCache(this.USER_DATA_KEY, user, this.DEFAULT_SESSION_CACHE_DURATION);
  }

  static getCachedUserData(): any | null {
    return this.getSessionCache(this.USER_DATA_KEY);
  }

  /**
   * Complete cleanup for logout
   */
  static async performCompleteLogout(): Promise<void> {
    try {
      console.log('🧹 Starting complete session cleanup...');

      // 1. Sign out from Supabase (this clears the Supabase session)
      try {
        console.log('📱 Signing out from Supabase...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('⚠️ Supabase signout error:', error);
        } else {
          console.log('✅ Supabase session cleared');
        }
      } catch (supabaseError) {
        console.error('❌ Supabase signout failed:', supabaseError);
      }

      // 2. Clear all session storage (temporary cache)
      try {
        console.log('📦 Clearing sessionStorage...');
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.clear();
          console.log('✅ sessionStorage cleared');
        }
      } catch (sessionStorageError) {
        console.error('❌ sessionStorage clear failed:', sessionStorageError);
      }

      // 3. Clear persistent tokens from localStorage
      try {
        console.log('🔐 Clearing persistent tokens...');
        this.removePersistentToken();
        
        // Clear any other auth-related localStorage items
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
        
        console.log('✅ Persistent tokens cleared');
      } catch (localStorageError) {
        console.error('❌ localStorage clear failed:', localStorageError);
      }

      // 4. Clear cookies
      try {
        console.log('🍪 Clearing cookies...');
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
          console.log('✅ Cookies cleared');
        }
      } catch (cookieError) {
        console.error('❌ Cookie clear failed:', cookieError);
      }

      // 5. Clear IndexedDB databases
      try {
        console.log('🗃️ Clearing IndexedDB...');
        if (typeof window !== 'undefined' && window.indexedDB) {
          const databases = [
            'supabase.auth.token',
            'keyval-store',
            'SupabaseStore'
          ];
          
          databases.forEach(dbName => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = () => console.log(`✅ Cleared IndexedDB: ${dbName}`);
            deleteReq.onerror = () => console.warn(`⚠️ Failed to clear IndexedDB: ${dbName}`);
          });
        }
      } catch (indexedDBError) {
        console.error('❌ IndexedDB clear failed:', indexedDBError);
      }

      console.log('🎉 Complete session cleanup finished');

    } catch (error) {
      console.error('❌ Critical error during session cleanup:', error);
      throw error;
    }
  }

  /**
   * Get current authentication state
   */
  static async getCurrentAuthState(): Promise<{
    hasSupabaseSession: boolean;
    hasPersistentToken: boolean;
    hasSessionCache: boolean;
    session: any;
  }> {
    const session = await this.getSupabaseSession();
    const persistentToken = this.getPersistentToken();
    const userCache = this.getCachedUserData();

    return {
      hasSupabaseSession: !!session,
      hasPersistentToken: !!persistentToken,
      hasSessionCache: !!userCache,
      session
    };
  }

  /**
   * Debug utility to log current storage state
   */
  static logStorageState(): void {
    console.group('📊 Current Storage State');
    
    try {
      // Check Supabase session
      this.getSupabaseSession().then(session => {
        console.log('Supabase Session:', !!session);
      });

      // Check persistent tokens
      const persistentToken = this.getPersistentToken();
      console.log('Persistent Token:', !!persistentToken);

      // Check session cache
      const userCache = this.getCachedUserData();
      const roleCache = this.getSessionCache(this.ROLE_CACHE_KEY);
      console.log('Session Cache - User:', !!userCache);
      console.log('Session Cache - Role:', !!roleCache);

      // Count localStorage items
      const localStorageCount = localStorage.length;
      console.log('localStorage items:', localStorageCount);

      // Count sessionStorage items
      const sessionStorageCount = sessionStorage.length;
      console.log('sessionStorage items:', sessionStorageCount);

    } catch (error) {
      console.error('Error logging storage state:', error);
    }
    
    console.groupEnd();
  }
}
