import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // If authenticated, go to dashboard; otherwise go to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
