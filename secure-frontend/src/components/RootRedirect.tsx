import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function RootRedirect() {
  const { isAuthenticated, loading, loadingRole, role } = useAuth();

  // Show loading while checking authentication or fetching role
  if (loading || loadingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Checking authentication...' : 'Loading user permissions...'}
        </p>
      </div>
    );
  }

  // If not authenticated, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get role-based redirect path - will be null if role not ready
  const redirectPath = getRoleBasedRedirect(role);
  
  // If no redirect path available (role not ready), show loading
  if (!redirectPath) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading user permissions...</p>
      </div>
    );
  }

  // Only redirect when we have a valid path (role is ready)
  return <Navigate to={redirectPath} replace />;
}
 