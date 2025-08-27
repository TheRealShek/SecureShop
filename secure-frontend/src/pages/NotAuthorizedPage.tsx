import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function NotAuthorizedPage() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-lg text-slate-600 mb-8">
          You don't have permission to access this page.
        </p>
        
        <div className="space-y-4">
          {role ? (
            <Link
              to={getRoleBasedRedirect(role) || '/products'}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105"
            >
              Go to your dashboard
            </Link>
          ) : (
            <div className="inline-flex items-center px-8 py-3 text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading your dashboard...
            </div>
          )}
          
          <div>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-700 underline font-medium transition-colors duration-200"
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
