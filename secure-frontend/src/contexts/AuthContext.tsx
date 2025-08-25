import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { 
  fetchUserRole, 
  clearRoleCache,
  type UserRole,
  type UserWithRole 
} from '../utils/roleUtils';

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

  // Helper function to fetch and set user role atomically
  const fetchAndSetUserWithRole = async (supabaseUser: any, accessToken: string): Promise<UserWithRole | null> => {
    try {
      // Always fetch fresh role from database - no caching
      console.log('🔄 Fetching fresh user role from Supabase...');
      const userRole = await fetchUserRole(supabaseUser.id);
      
      if (userRole) {
        const userWithRole: UserWithRole = {
          ...supabaseUser,
          role: userRole
        };
        
        // Set everything atomically (no localStorage caching for role)
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
    setUser(null);
    setRole(null);
    setToken(null);
    // Don't clear cache since we're not using it anymore
    localStorage.removeItem('token');
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
        
        // Force clear any stale cache on app start
        console.log('🚀 App starting, clearing any stale localStorage...');
        localStorage.removeItem('user_role_cache');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          clearAuthState();
        } else if (session) {
          console.log('📱 Found existing session, verifying validity...');
          // Verify the session is still valid by making a test request
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData) {
              // Session is invalid, clear it
              console.log('❌ Session invalid, clearing...');
              await supabase.auth.signOut();
              clearAuthState();
            } else {
              console.log('✅ Session valid, fetching user role...');
              // Session is valid, fetch user with role atomically
              await fetchAndSetUserWithRole(session.user, session.access_token);
            }
          } catch (verifyError) {
            console.error('Session verification failed:', verifyError);
            await supabase.auth.signOut();
            clearAuthState();
          }
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
      
      setLoading(true);
      setAuthReady(false);
      
      try {
        if (event === 'SIGNED_OUT') {
          // Ensure complete cleanup on sign out
          clearAuthState();
        } else if (session?.user) {
          await fetchAndSetUserWithRole(session.user, session.access_token);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthReady(false);
      
      // Clear any existing auth state first
      clearAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        console.log('🔐 Login successful, fetching user role for:', data.session.user.email);
        // Fetch user with role atomically
        const userWithRole = await fetchAndSetUserWithRole(data.session.user, data.session.access_token);
        console.log('👤 User role fetched after login:', userWithRole?.role);
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear local state and storage FIRST to prevent any timing issues
      localStorage.removeItem('token');
      localStorage.removeItem('user_role_cache'); // Clear any role cache
      setUser(null);
      setRole(null);
      setToken(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Force a complete session cleanup and navigation
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Clear all storage
          localStorage.clear();
          sessionStorage.clear();
          // Navigate to login
          window.location.href = '/login';
        }
      }, 100);
      
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if Supabase call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user_role_cache');
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
      // Force clear everything
      await supabase.auth.signOut();
      clearRoleCache();
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
