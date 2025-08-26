import { supabase } from '../services/supabase';

/**
 * Debug utility to check current auth state and user data
 */
export const debugAuthState = async () => {
  console.log('🔍 === AUTH STATE DEBUG ===');
  
  try {
    // Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('📱 Current session:', {
      hasSession: !!session.session,
      user: session.session?.user ? {
        id: session.session.user.id,
        email: session.session.user.email,
        created_at: session.session.user.created_at
      } : null,
      error: sessionError
    });

    // Check current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', {
      hasUser: !!user.user,
      userId: user.user?.id,
      userEmail: user.user?.email,
      error: userError
    });

    // Check user in database
    if (user.user?.id) {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.user.id)
        .maybeSingle();
      
      console.log('🗄️ User in database:', {
        found: !!dbUser,
        data: dbUser,
        error: dbError
      });
    }

    // Check localStorage
    const localToken = localStorage.getItem('token');
    const roleCache = localStorage.getItem('user_role_cache');
    console.log('💾 Local storage:', {
      hasToken: !!localToken,
      roleCache: roleCache ? JSON.parse(roleCache) : null
    });

  } catch (error) {
    console.error('❌ Debug auth state failed:', error);
  }
  
  console.log('🔍 === END DEBUG ===');
};

/**
 * Force clear all auth data and redirect to login using unified cleanup
 */
export const debugForceLogout = async () => {
  console.log('🧹 Debug: Forcing complete logout with unified cleanup...');
  
  try {
    // Import and use the unified cleanup function
    const { forceLogoutAndReload } = await import('./logoutCleanup');
    await forceLogoutAndReload();
  } catch (error) {
    console.error('❌ Debug force logout failed, using fallback:', error);
    
    // Fallback to original logic
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      console.log('✅ Fallback logout successful');
      
      // Force navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
    } catch (fallbackError) {
      console.error('❌ Fallback force logout failed:', fallbackError);
    }
  }
};
