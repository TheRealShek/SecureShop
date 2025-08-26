import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleUtils';

export function AuthenticatedHome() {
  const { isAuthenticated, loading, user, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not loaded yet, show loading
  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading user permissions...</p>
      </div>
    );
  }

  // If user came from somewhere specific, go back there, otherwise use role-based redirect
  const from = location.state?.from?.pathname || getRoleBasedRedirect(role);
  if (location.pathname === '/' && from !== '/') {
    return <Navigate to={from} replace />;
  }

  // Show a welcome page or dashboard for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Welcome to SecureShop
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Hello {user?.email}! What would you like to do today?
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/products"
              className="group relative rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-2.83L8.25 4.5h7.5l1.5 2.02a3.001 3.001 0 003.75 2.83m0 6.65a.75.75 0 01-.75.75H21a.75.75 0 01-.75-.75v-7.5z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                  Browse Products
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Explore our collection of products and find what you need.
                </p>
              </div>
            </a>

            <a
              href="/cart"
              className="group relative rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                  View Cart
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check your cart and proceed to checkout.
                </p>
              </div>
            </a>

            <a
              href="/dashboard"
              className="group relative rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
                  Dashboard
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View your account details and order history.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
