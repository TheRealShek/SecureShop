import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function NotAuthorizedPage() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-3 text-gray-600">
          You don't have permission to access this page.
        </p>
        
        <div className="mt-8 space-y-4">
          <Link
            to={role ? getRoleBasedRedirect(role) : '/products'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Go to your dashboard
          </Link>
          
          <div>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              Browse products instead
            </Link>
          </div>
        </div>
        
        {user && role && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Logged in as:</strong> {user.email}<br />
              <strong>Role:</strong> {role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
