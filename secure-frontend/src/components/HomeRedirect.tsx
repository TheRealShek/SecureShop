import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function HomeRedirect() {
  const { isAuthenticated, loading, loadingRole, role } = useAuth();
  
  // Show loading while authentication or role is being determined
  if (loading || loadingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // If not authenticated, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated but no role yet, show loading
  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading user permissions...</p>
      </div>
    );
  }
  
  // Get role-based redirect - avoid loop by directly going to role route
  const redirectPath = getRoleBasedRedirect(role);
  return redirectPath ? (
    <Navigate to={redirectPath} replace />
  ) : (
    <Navigate to="/products" replace />
  );
}
