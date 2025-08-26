import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasRequiredRole, getRoleBasedRedirect, type UserRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole; // Keep for backward compatibility
}

export function ProtectedRoute({ children, allowedRoles, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, loadingRole, user, role } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication or role
  if (loading || loadingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Verifying access...' : 'Loading user permissions...'}
        </p>
      </div>
    );
  }

  // If not authenticated at all, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If still loading role, show loading (extra safety check)
  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading user permissions...</p>
      </div>
    );
  }

  // Check role-based access
  let hasAccess = true;
  let denialReason = '';

  if (allowedRoles && allowedRoles.length > 0) {
    // Use allowedRoles array (preferred method)
    hasAccess = allowedRoles.includes(role) || role === 'admin'; // Admin always has access
    if (!hasAccess) {
      denialReason = `This page requires one of the following roles: ${allowedRoles.join(', ')}. Your current role is: ${role}.`;
    }
  } else if (requiredRole) {
    // Use single requiredRole (backward compatibility)
    hasAccess = hasRequiredRole(role, requiredRole);
    if (!hasAccess) {
      denialReason = `This page requires ${requiredRole} role. Your current role is: ${role}.`;
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-3 text-gray-600">{denialReason}</p>
          
          <div className="mt-6 space-y-3">
            {role && (
              <Link
                to={getRoleBasedRedirect(role) || '/products'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Go to {role === 'admin' ? 'Dashboard' : role === 'seller' ? 'Products Management' : 'Products'}
              </Link>
            )}
            
            <div>
              <Link
                to="/profile"
                className="text-sm text-indigo-600 hover:text-indigo-500 underline"
              >
                View your profile
              </Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current user:</strong> {user.email}<br />
              <strong>Current role:</strong> {role}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
}
