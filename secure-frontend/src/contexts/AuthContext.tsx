import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { 
  fetchUserRole, 
  cacheUserRole, 
  getCachedUserRole, 
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
      // Try to get cached role first
      let userRole = getCachedUserRole(supabaseUser.id);
      
      if (!userRole) {
        // Fetch from database if not cached
        userRole = await fetchUserRole(supabaseUser.id);
        if (userRole) {
          cacheUserRole(supabaseUser.id, userRole);
        }
      }

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
    clearRoleCache();
    localStorage.removeItem('token');
  };

  // Refresh role function
  const refreshRole = async (): Promise<void> => {
    if (user?.id) {
      clearRoleCache();
      const newRole = await fetchUserRole(user.id);
      if (newRole) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        setRole(newRole);
        cacheUserRole(user.id, newRole);
      }
    }
  };

  // Periodic role check (optional - every 5 minutes)
  useEffect(() => {
    if (!user?.id || !authReady) return;

    const roleCheckInterval = setInterval(async () => {
      try {
        const currentRole = await fetchUserRole(user.id);
        if (currentRole && currentRole !== role) {
          console.log('Role changed detected, updating...', { old: role, new: currentRole });
          const updatedUser = { ...user, role: currentRole };
          setUser(updatedUser);
          setRole(currentRole);
          cacheUserRole(user.id, currentRole);
        }
      } catch (error) {
        console.error('Role check failed:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(roleCheckInterval);
  }, [user?.id, role, authReady]);

  useEffect(() => {
    // Check if there's an active session on app start
    const checkSession = async () => {
      try {
        setLoading(true);
        setAuthReady(false);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          clearAuthState();
        } else if (session) {
          // Verify the session is still valid by making a test request
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData) {
              // Session is invalid, clear it
              await supabase.auth.signOut();
              clearAuthState();
            } else {
              // Session is valid, fetch user with role atomically
              await fetchAndSetUserWithRole(session.user, session.access_token);
            }
          } catch (verifyError) {
            console.error('Session verification failed:', verifyError);
            await supabase.auth.signOut();
            clearAuthState();
          }
        } else {
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
        if (session?.user) {
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        // Fetch user with role atomically
        await fetchAndSetUserWithRole(data.session.user, data.session.access_token);
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
      
      // Sign out from Supabase (this clears the session)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear local state and storage
      setUser(null);
      setRole(null);
      setToken(null);
      clearRoleCache();
      localStorage.removeItem('token');
      
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if Supabase call fails
      setUser(null);
      setRole(null);
      setToken(null);
      clearRoleCache();
      localStorage.removeItem('token');
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
