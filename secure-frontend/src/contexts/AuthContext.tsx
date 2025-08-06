import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: SupabaseUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's an active session on app start
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        } else if (session) {
          // Verify the session is still valid by making a test request
          try {
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
              // Session is invalid, clear it
              await supabase.auth.signOut();
              setUser(null);
              setToken(null);
              localStorage.removeItem('token');
            } else {
              // Session is valid
              setUser(session.user);
              setToken(session.access_token);
              localStorage.setItem('token', session.access_token);
            }
          } catch (verifyError) {
            console.error('Session verification failed:', verifyError);
            await supabase.auth.signOut();
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      } else {
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
        setUser(data.session.user);
        setToken(data.session.access_token);
        localStorage.setItem('token', data.session.access_token);
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      setUser(null);
      setToken(null);
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
      
      // Clear local state and localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if Supabase call fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async () => {
    try {
      // Force clear everything
      await supabase.auth.signOut();
      localStorage.clear(); // Clear all localStorage
      sessionStorage.clear(); // Clear all sessionStorage
      
      // Clear state
      setUser(null);
      setToken(null);
      setLoading(false);
      
      // Force reload to ensure clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error in force logout:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user, 
        user,
        token,
        login, 
        logout,
        loading,
        forceLogout
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
