import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { 
  fetchUserRole, 
  clearRoleCache,
  type UserRole,
  type UserWithRole 
} from '../utils/roleUtils';
import { 
  clearAllCache, 
  addVisibilityChangeListener
} from '../utils/cacheUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserWithRole | null;
  role: UserRole | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  authReady: boolean; // New flag to indicate auth is fully loaded
  forceLogout: () => Promise<void>;
  refreshRole: () => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // New state
  const queryClient = useQueryClient(); // Add query client

  // Helper function to fetch and set user role atomically
  const fetchAndSetUserWithRole = async (supabaseUser: any, accessToken: string): Promise<UserWithRole | null> => {
    try {
      // Fetch fresh role from database
      console.log('🔄 Fetching user role from Supabase...');
      const userRole = await fetchUserRole(supabaseUser.id);
      
      if (userRole) {
        const userWithRole: UserWithRole = {
          ...supabaseUser,
          role: userRole
        };
        
        // Set everything atomically
        setUser(userWithRole);
        setRole(userRole);
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        
        console.log(`✅ User role set: ${userRole} for ${supabaseUser.email}`);
        return userWithRole;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Clear all auth state atomically
  const clearAuthState = () => {
    console.log('🧹 Clearing auth state and React Query cache...');
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Clear React Query cache to prevent data from previous user session
    queryClient.clear();
    console.log('✅ React Query cache cleared');
  };

  // Refresh role function - always fetch fresh from database
  const refreshRole = async (): Promise<void> => {
    if (user?.id) {
      console.log('🔄 Refreshing user role from database...');
      const newRole = await fetchUserRole(user.id);
      if (newRole) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        setRole(newRole);
        console.log(`✅ Role refreshed: ${newRole}`);
      }
    }
  };

  // Remove periodic role check since we always fetch fresh data
  // useEffect(() => {
  //   // Removed: No longer needed since we don't cache roles
  // }, [user?.id, role, authReady]);

  useEffect(() => {
    // Check if there's an active session on app start
    const checkSession = async () => {
      try {
        setLoading(true);
        setAuthReady(false);
        
        console.log('🚀 App starting, checking session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          clearAuthState();
        } else if (session) {
          console.log('📱 Found existing session, setting up user...');
          // Session is valid, fetch user with role atomically
          await fetchAndSetUserWithRole(session.user, session.access_token);
        } else {
          console.log('📭 No existing session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Session check failed:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      
      // Don't process SIGNED_IN events if we're already processing auth
      if (event === 'SIGNED_IN' && loading) {
        console.log('⏸️ Skipping SIGNED_IN - already processing auth');
        return;
      }
      
      setLoading(true);
      setAuthReady(false); // Reset auth ready state
      
      try {
        if (event === 'SIGNED_OUT') {
          // Ensure complete cleanup on sign out
          console.log('🚪 Processing SIGNED_OUT event');
          clearAuthState();
        } else if (session?.user) {
          // Process all auth changes that have a valid session
          console.log('🔄 Processing auth change with session for user:', session.user.email);
          await fetchAndSetUserWithRole(session.user, session.access_token);
          console.log('✅ Auth state fully processed');
        } else {
          console.log('🧹 No session, clearing auth state');
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setAuthReady(true);
        console.log('🏁 Auth state change processing complete');
      }
    });

    // Add visibility change listener to handle tab switches
    const removeVisibilityListener = addVisibilityChangeListener((isVisible) => {
      if (isVisible && user && authReady) {
        // Only refresh if we've been away for more than 5 minutes
        // For now, we'll skip this automatic refresh to avoid unnecessary calls
        console.log('🔄 Tab became visible, auth state is current');
      }
    });

    return () => {
      subscription.unsubscribe();
      removeVisibilityListener();
    };
  }, []); // Keep empty dependency array to run only once

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('🔐 Starting login process...');
      
      // Clear any existing state and cache first
      console.log('🧹 Clearing previous session data...');
      clearAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        console.log('✅ Login successful for:', data.session.user.email);
        console.log('🔄 Login: session obtained, auth state change listener will handle the rest');
        // The auth state change listener will handle setting the user data
        // Don't set loading to false here - let the auth state change handler do it
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      clearAuthState();
      setLoading(false); // Only set loading to false on error
      throw error;
    }
    // Note: Don't set loading to false here on success - let auth state change handler do it
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      console.log('🚪 Starting logout process...');
      
      // Clear local state and storage FIRST to prevent any timing issues
      localStorage.removeItem('token');
      clearAllCache(); // Clear all session cache
      queryClient.clear(); // Clear React Query cache immediately
      console.log('🧹 Cleared local storage and React Query cache');
      
      setUser(null);
      setRole(null);
      setToken(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('✅ Supabase signout successful');
      }
      
      // Force a complete session cleanup and navigation
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Clear all storage again to be extra sure
          localStorage.clear();
          sessionStorage.clear();
          console.log('🧹 Final cleanup completed');
          // Navigate to login
          window.location.href = '/login';
        }
      }, 100);
      
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if Supabase call fails
      localStorage.removeItem('token');
      clearAllCache();
      queryClient.clear(); // Clear React Query cache on error too
      setUser(null);
      setRole(null);
      setToken(null);
      
      // Force navigation on error too
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async () => {
    try {
      console.log('🚨 Force logout initiated...');
      
      // Force clear everything
      await supabase.auth.signOut();
      clearRoleCache();
      clearAllCache(); // Clear all session cache
      queryClient.clear(); // Clear React Query cache
      localStorage.clear();
      
      // Also try to clear sessionStorage safely
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.clear();
        }
      } catch (sessionError) {
        console.warn('sessionStorage clear failed:', sessionError);
      }
      
      // Clear state
      setUser(null);
      setRole(null);
      setToken(null);
      setLoading(false);
      
      console.log('✅ Force logout completed');
      
      // Force reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error in force logout:', error);
    }
  };

  // Computed role checks
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user && !!role, // Only true when both user and role are loaded
        user,
        role,
        token,
        login, 
        logout,
        loading,
        authReady,
        forceLogout,
        refreshRole,
        isAdmin,
        isSeller,
        isBuyer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
