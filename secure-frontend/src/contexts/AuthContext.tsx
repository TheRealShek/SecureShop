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

  // Helper function to fetch and set user role
  const fetchAndSetRole = async (userId: string): Promise<UserRole | null> => {
    // Try to get cached role first
    let userRole = getCachedUserRole(userId);
    
    if (!userRole) {
      // Fetch from database if not cached
      userRole = await fetchUserRole(userId);
      if (userRole) {
        cacheUserRole(userId, userRole);
      }
    }
    
    setRole(userRole);
    return userRole;
  };

  // Refresh role function
  const refreshRole = async (): Promise<void> => {
    if (user?.id) {
      clearRoleCache();
      const newRole = await fetchAndSetRole(user.id);
      if (newRole && user) {
        setUser(prev => prev ? { ...prev, role: newRole } : null);
      }
    }
  };

  // Periodic role check (optional - every 5 minutes)
  useEffect(() => {
    const isAuthenticated = !!user;
    if (!user?.id || !isAuthenticated) return;

    const roleCheckInterval = setInterval(async () => {
      try {
        const currentRole = await fetchUserRole(user.id);
        if (currentRole && currentRole !== role) {
          console.log('Role changed detected, updating...', { old: role, new: currentRole });
          setRole(currentRole);
          setUser(prev => prev ? { ...prev, role: currentRole } : null);
          cacheUserRole(user.id, currentRole);
        }
      } catch (error) {
        console.error('Role check failed:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(roleCheckInterval);
  }, [user?.id, role]);

  useEffect(() => {
    // Check if there's an active session on app start
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setRole(null);
          setToken(null);
          clearRoleCache();
          localStorage.removeItem('token');
        } else if (session) {
          // Verify the session is still valid by making a test request
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData) {
              // Session is invalid, clear it
              await supabase.auth.signOut();
              setUser(null);
              setRole(null);
              setToken(null);
              clearRoleCache();
              localStorage.removeItem('token');
            } else {
              // Session is valid, set user and fetch role
              const userWithRole: UserWithRole = {
                ...session.user,
                role: undefined // Will be set after fetching
              };
              setUser(userWithRole);
              setToken(session.access_token);
              localStorage.setItem('token', session.access_token);
              
              // Fetch and set role
              const fetchedRole = await fetchAndSetRole(session.user.id);
              if (fetchedRole) {
                setUser(prev => prev ? { ...prev, role: fetchedRole } : null);
              }
            }
          } catch (verifyError) {
            console.error('Session verification failed:', verifyError);
            await supabase.auth.signOut();
            setUser(null);
            setRole(null);
            setToken(null);
            clearRoleCache();
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
          setRole(null);
          setToken(null);
          clearRoleCache();
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        setRole(null);
        setToken(null);
        clearRoleCache();
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userWithRole: UserWithRole = {
          ...session.user,
          role: undefined
        };
        setUser(userWithRole);
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        
        // Fetch and set role
        const fetchedRole = await fetchAndSetRole(session.user.id);
        if (fetchedRole) {
          setUser(prev => prev ? { ...prev, role: fetchedRole } : null);
        }
      } else {
        setUser(null);
        setRole(null);
        setToken(null);
        clearRoleCache();
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        const userWithRole: UserWithRole = {
          ...data.session.user,
          role: undefined
        };
        setUser(userWithRole);
        setToken(data.session.access_token);
        localStorage.setItem('token', data.session.access_token);
        
        // Fetch and set role after successful login
        const fetchedRole = await fetchAndSetRole(data.session.user.id);
        if (fetchedRole) {
          setUser(prev => prev ? { ...prev, role: fetchedRole } : null);
        }
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      setUser(null);
      setRole(null);
      setToken(null);
      clearRoleCache();
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
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
        isAuthenticated: !!user, 
        user,
        role,
        token,
        login, 
        logout,
        loading,
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
