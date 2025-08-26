import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { 
  fetchUserRole, 
  type UserRole,
  type UserWithRole 
} from '../utils/roleUtils';
import { SessionManager } from '../utils/sessionManager';
import { useTabVisibility } from '../utils/tabVisibility';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserWithRole | null;
  role: UserRole | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
  const [authReady, setAuthReady] = useState(false);
  
  // Tab visibility tracking for optimized session handling
  const { shouldSkipOperation } = useTabVisibility();

  // Atomic function to clear all auth state completely
  const clearAuthState = () => {
    console.log('🧹 Clearing all auth state...');
    setUser(null);
    setRole(null);
    setToken(null);
    
    // Clear session cache through SessionManager
    SessionManager.removeSessionCache('user_data_cache');
    SessionManager.removeSessionCache('user_role_cache');
    console.log('✅ Auth state cleared');
  };

  // Atomic function to set authenticated state with validation
  const setAuthenticatedState = async (supabaseUser: any, accessToken: string): Promise<UserWithRole | null> => {
    try {
      console.log('🔄 Setting authenticated state for:', supabaseUser.email);
      
      // First, clear any existing state to prevent conflicts
      clearAuthState();
      
      // Fetch fresh role from database
      console.log('� Fetching user role from database...');
      const userRole = await fetchUserRole(supabaseUser.id);
      
      if (!userRole) {
        console.error('❌ No role found for user:', supabaseUser.id);
        throw new Error('User role not found');
      }

      // Create user with role
      const userWithRole: UserWithRole = {
        ...supabaseUser,
        role: userRole
      };

      // Set all state atomically - this ensures token and role are always tied together
      setUser(userWithRole);
      setRole(userRole);
      setToken(accessToken);
      
      // Cache user data and role in session storage (temporary cache)
      SessionManager.cacheUserData(userWithRole);
      SessionManager.cacheUserRole(supabaseUser.id, userRole);
      
      console.log(`✅ Authenticated state set successfully:`, {
        userId: supabaseUser.id,
        email: supabaseUser.email,
        role: userRole,
        hasToken: !!accessToken
      });
      
      return userWithRole;
      
    } catch (error) {
      console.error('❌ Failed to set authenticated state:', error);
      // If anything fails, ensure state is cleared
      clearAuthState();
      throw error;
    }
  };

  // Optimized session validation - only validate if we don't have valid local state
  const validateSessionAndRole = async (forceValidation = false): Promise<boolean> => {
    try {
      // If we already have valid token, user, and role, skip validation unless forced
      if (!forceValidation && token && user && role && user.role === role) {
        console.log('✅ Using cached auth state, skipping validation');
        return true;
      }

      console.log('🔍 Validating session and role...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        console.log('❌ No valid session found');
        return false;
      }

      // Only verify user exists if we don't have local user data
      if (!user || user.id !== session.user.id) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          console.log('❌ User validation failed');
          return false;
        }
      }

      // Only fetch role if we don't have it or it's for a different user
      if (!role || !user || user.id !== session.user.id) {
        const userRole = await fetchUserRole(session.user.id);
        if (!userRole) {
          console.log('❌ Role validation failed');
          return false;
        }
      }

      console.log('✅ Session and role validated successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return false;
    }
  };

  // Optimized refresh role function - validates session only when needed
  const refreshRole = async (forceRefresh = false): Promise<void> => {
    if (!user?.id) {
      console.log('❌ No user found for role refresh');
      return;
    }

    try {
      console.log('🔄 Refreshing user role...');
      
      // Only validate session if we don't have valid local state or it's forced
      const isValid = await validateSessionAndRole(forceRefresh);
      if (!isValid) {
        console.log('❌ Session invalid during role refresh, clearing state');
        clearAuthState();
        return;
      }

      // Only fetch new role if forced or we suspect it might have changed
      if (forceRefresh || !role) {
        const newRole = await fetchUserRole(user.id);
        if (newRole && newRole !== role) {
          console.log(`🔄 Role changed from ${role} to ${newRole}`);
          const updatedUser = { ...user, role: newRole };
          setUser(updatedUser);
          setRole(newRole);
          console.log(`✅ Role refreshed: ${newRole}`);
        } else if (!newRole) {
          console.log('❌ No role found during refresh, clearing state');
          clearAuthState();
        } else {
          console.log('✅ Role unchanged, no update needed');
        }
      } else {
        console.log('✅ Role refresh skipped - using cached role');
      }
    } catch (error) {
      console.error('❌ Role refresh failed:', error);
      clearAuthState();
    }
  };

  // Optimized initial session check - avoids unnecessary validations
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        setLoading(true);
        setAuthReady(false);
        
        console.log('🚀 Checking initial session...');
        
        // Check for cached user data in session storage
        const cachedUser = SessionManager.getCachedUserData();
        
        // Clear any stale cache data
        SessionManager.clearAllSessionCache();
        
        const session = await SessionManager.getSupabaseSession();
        
        if (!session?.user) {
          console.log('📭 No existing session found');
          clearAuthState();
        } else {
          console.log('📱 Found existing session');
          
          // Check if we have valid cached data to speed up restoration
          if (cachedUser && cachedUser.id === session.user.id) {
            console.log('🎯 User data matches cache, attempting quick restore...');
            try {
              await setAuthenticatedState(session.user, session.access_token);
              console.log('✅ Quick session restore successful');
            } catch (quickRestoreError) {
              console.log('⚠️ Quick restore failed, doing full validation...');
              // Fall back to full validation
              const isValid = await validateSessionAndRole(true);
              if (isValid) {
                await setAuthenticatedState(session.user, session.access_token);
                console.log('✅ Full session validation and restore successful');
              } else {
                console.log('❌ Session validation failed, signing out');
                await supabase.auth.signOut();
                clearAuthState();
              }
            }
          } else {
            console.log('🔍 No cached data match, doing full validation...');
            // No cached data or user mismatch - do full validation
            const isValid = await validateSessionAndRole(true);
            if (isValid) {
              await setAuthenticatedState(session.user, session.access_token);
              console.log('✅ Initial session validated and restored');
            } else {
              console.log('❌ Session validation failed, signing out');
              await supabase.auth.signOut();
              clearAuthState();
            }
          }
        }
      } catch (error) {
        console.error('❌ Initial session check failed:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    };

    checkInitialSession();

    // Optimized auth state change handler - prevents unnecessary reloads
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, !!session);
      
      // Skip operations if this was triggered by a recent tab visibility change
      if (shouldSkipOperation(2000)) {
        console.log('⏭️ Skipping auth change - recent tab visibility change');
        return;
      }
      
      // Don't process changes during initial load or certain background events
      if (!authReady && event !== 'SIGNED_OUT') {
        console.log('⏭️ Skipping auth change during initial load');
        return;
      }

      // Skip TOKEN_REFRESHED events if we already have valid auth state
      if (event === 'TOKEN_REFRESHED' && token && user && role && session?.access_token === token) {
        console.log('⏭️ Skipping token refresh - state already current');
        return;
      }
      
      setLoading(true);
      setAuthReady(false);
      
      try {
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          clearAuthState();
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('👋 User signed in, setting authenticated state');
          await setAuthenticatedState(session.user, session.access_token);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, updating auth state');
          // For token refresh, only update if the token actually changed
          if (session.access_token !== token) {
            await setAuthenticatedState(session.user, session.access_token);
          } else {
            console.log('⏭️ Token unchanged, skipping update');
          }
        } else if (!session) {
          console.log('❌ No session in auth change, clearing state');
          clearAuthState();
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
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

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setAuthReady(false);
      
      console.log('🔐 Starting login process for:', email);
      
      // Clear any existing auth state first to prevent conflicts
      clearAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
      }
      
      if (!data.session?.user) {
        throw new Error('No session returned from login');
      }

      console.log('✅ Login successful, setting authenticated state...');
      
      // Set authenticated state with role validation
      const userWithRole = await setAuthenticatedState(data.session.user, data.session.access_token);
      
      if (!userWithRole) {
        throw new Error('Failed to set authenticated state - user role validation failed');
      }

      // Store persistent token if remember me is enabled
      if (rememberMe) {
        SessionManager.setPersistentToken(data.session.access_token, { 
          rememberMe: true,
          duration: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }
      
      console.log('🎉 Login completed successfully:', {
        email: userWithRole.email,
        role: userWithRole.role,
        userId: userWithRole.id,
        rememberMe
      });
      
    } catch (error) {
      console.error('❌ Login process failed:', error);
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
      console.log('🚪 Starting unified logout process...');
      
      // Clear context state first to prevent any UI inconsistencies
      setUser(null);
      setRole(null);
      setToken(null);
      
      // Use the SessionManager cleanup function
      await SessionManager.performCompleteLogout();
      
      console.log('✅ Unified logout completed successfully');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Fallback cleanup if unified logout fails
      try {
        setUser(null);
        setRole(null);
        setToken(null);
        localStorage.clear();
        sessionStorage.clear();
      } catch (fallbackError) {
        console.error('❌ Fallback cleanup failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      
      // Always navigate to login, even if there were errors
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 100);
    }
  };

  const forceLogout = async () => {
    try {
      console.log('🔥 Starting force logout...');
      
      // Clear context state immediately
      setUser(null);
      setRole(null);
      setToken(null);
      setLoading(false);
      
      // Use SessionManager for force logout
      await SessionManager.performCompleteLogout();
      
      // Force page reload for complete cleanup
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
          window.location.reload();
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Force logout failed:', error);
      
      // Ultimate fallback
      try {
        setUser(null);
        setRole(null);
        setToken(null);
        setLoading(false);
        
        localStorage.clear();
        sessionStorage.clear();
        
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
            window.location.reload();
          }
        }, 100);
      } catch (ultimateError) {
        console.error('❌ Ultimate fallback failed:', ultimateError);
      }
    }
  };

  // Computed role checks with additional validation
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';

  // Enhanced authentication check - ensures token, user, and role are all present and consistent
  const isAuthenticated = !!(
    user && 
    role && 
    token && 
    user.role === role && // Ensure user.role matches the role state
    authReady // Only consider authenticated when auth is fully ready
  );

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated,
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
