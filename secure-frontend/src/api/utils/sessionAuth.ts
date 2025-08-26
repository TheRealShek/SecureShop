/**
 * API Authentication Utilities
 * Integrates with SessionManager for proper session handling
 */

import { SessionManager } from '../../utils/sessionManager';

/**
 * Get authentication token through proper session management
 * This should be used instead of directly accessing localStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // First check Supabase session (authoritative source)
    const session = await SessionManager.getSupabaseSession();
    if (session?.access_token) {
      return session.access_token;
    }

    // Fallback to persistent token if available
    const persistentToken = SessionManager.getPersistentToken();
    if (persistentToken) {
      return persistentToken;
    }

    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated through proper session management
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  const isValid = await SessionManager.validateSupabaseSession();
  return !!(token && isValid);
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Handle authentication errors in API responses
 * This should be called when API returns 401/403
 */
export const handleAuthError = async (): Promise<void> => {
  console.warn('Authentication error detected, performing cleanup...');
  
  try {
    await SessionManager.performCompleteLogout();
    
    // Redirect to login
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 100);
  } catch (error) {
    console.error('Failed to handle auth error:', error);
  }
};

/**
 * Axios request interceptor that uses proper session management
 */
export const createAuthRequestInterceptor = () => {
  return async (config: any) => {
    const headers = await getAuthHeaders();
    config.headers = { ...config.headers, ...headers };
    return config;
  };
};

/**
 * Axios response interceptor that handles auth errors
 */
export const createAuthResponseInterceptor = () => {
  return {
    fulfilled: (response: any) => response,
    rejected: async (error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await handleAuthError();
      }
      return Promise.reject(error);
    }
  };
};
