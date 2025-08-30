import axios, { AxiosInstance } from 'axios';
import { supabase } from '../../services/supabase';
import { API_URL, REQUEST_TIMEOUT } from './constants';

/**
 * Configured Axios instance with authentication and error handling
 * 
 * Features:
 * - Automatic JWT token injection from Supabase session
 * - Comprehensive request/response logging for debugging
 * - 401 error handling with automatic logout
 * - Centralized error handling and logging
 */

/** Main axios instance for API requests */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(async (config) => {
  console.log(' [DEBUG] Preparing request interceptor...');
  
  try {
    // Get fresh token from Supabase session instead of localStorage
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(' [DEBUG] Error getting session:', error);
    }
    
    const token = session?.access_token;
    
    console.log(' [DEBUG] Outgoing request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasSession: !!session,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      userEmail: session?.user?.email || 'No user',
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'No token'
      }
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(' [DEBUG] No valid Supabase session token found');
    }
    
    return config;
  } catch (error) {
    console.error(' [DEBUG] Request interceptor error:', error);
    return config;
  }
});

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log(' [DEBUG] Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataType: typeof response.data,
      dataPreview: Array.isArray(response.data) 
        ? `Array with ${response.data.length} items`
        : typeof response.data === 'object' 
          ? Object.keys(response.data || {}).slice(0, 5)
          : response.data
    });
    return response;
  },
  (error) => {
    console.error(' [DEBUG] Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log(' [DEBUG] 401 Unauthorized - clearing token and redirecting');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export default api;
