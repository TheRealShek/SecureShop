import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function RootRedirect() {
  const { isAuthenticated, loading, role, authReady } = useAuth();

  console.log('🏠 RootRedirect render:', { loading, authReady, isAuthenticated, role });

  // Show loading while checking authentication
  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, go to login
  if (!isAuthenticated) {
    console.log('🏠 RootRedirect: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role is still loading, show loading
  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading user permissions...</p>
      </div>
    );
  }

  // If authenticated and role is available, redirect based on role
  const redirectPath = getRoleBasedRedirect(role);
  console.log(`🏠 RootRedirect: Authenticated with role ${role}, redirecting to ${redirectPath}`);
  return <Navigate to={redirectPath} replace />;
}
 