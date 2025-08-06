import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SecurityUtils, type UserRole } from '../utils/security';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Verifying access...</p>
      </div>
    );
  }

  // Use security utility for comprehensive access validation
  const accessCheck = SecurityUtils.validateAccess(
    user,
    isAuthenticated,
    requiredRole,
    location.pathname
  );

  if (!accessCheck.allowed) {
    // If not authenticated at all, redirect to login
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but insufficient role, show access denied
    const userRole = SecurityUtils.getUserRole(user);
    
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">{accessCheck.reason}</p>
          
          {requiredRole && userRole && (
            <div className="mt-3 text-sm text-gray-500">
              <p>Required role: <span className="font-medium text-red-600">{requiredRole}</span></p>
              <p>Your role: <span className="font-medium text-gray-700">{userRole}</span></p>
            </div>
          )}
          
          <div className="mt-6 space-x-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
