import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
                                    'block px-4 py-2 text-sm hover:bg-slate-50 rounded-lg mx-2 transition-colors duration-200'
import { Fragment, useMemo, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Layout() {
  const { isAuthenticated, user, logout, role } = useAuth();
  // Only use cart for non-admin users
  const { totalItems } = role === 'admin' ? { totalItems: 0 } : useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const navigation: NavigationItem[] = useMemo(() => {
    const baseNav = [
      { name: 'Products', href: '/products' },
    ];

    if (isAuthenticated && role) {
      // For buyers, add cart and orders
      if (role === 'buyer') {
        baseNav.push({ name: 'Orders', href: '/orders' });
        return baseNav;
      }
      
      // For admin - NO cart functionality, only dashboard
      if (role === 'admin') {
        // Admin gets redirected to dashboard if they try to access other routes
        // No cart or products navigation for admin
        return [{ name: 'Dashboard', href: '/dashboard' }];
      }
      
      if (role === 'seller') {
        baseNav.push(
          { name: 'Seller Dashboard', href: '/seller/dashboard' },
          { name: 'My Products', href: '/seller/products' },
          { name: 'Orders', href: '/seller/orders' }
        );
      }
    }

    return baseNav;
  }, [isAuthenticated, role]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log(' Starting logout from Layout...');
      await logout();
      
      // Navigation is handled by the AuthContext logout function
      console.log(' Logout completed from Layout');
    } catch (error) {
      console.error(' Logout failed in Layout:', error);
      
      // Fallback navigation if logout fails
      setTimeout(() => {
        navigate('/login');
      }, 100);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Disclosure as="nav" className="bg-white shadow-sm border-b border-slate-200">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/products" className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors duration-200">
                      SecureShop
                    </Link>
                  </div>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    )}
                  </Disclosure.Button>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
                  {isAuthenticated ? (
                    <>
                      {/* Cart - Only show for buyers (NOT for admin) */}
                      {role === 'buyer' && (
                        <Link
                          to="/cart"
                          className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                        >
                          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                          {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white shadow-sm">
                              {totalItems > 99 ? '99+' : totalItems}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* User Menu */}
                      <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                          <UserCircleIcon className="h-6 w-6 text-slate-600" aria-hidden="true" />
                          <span className="text-sm font-medium text-slate-700 hidden md:block">
                            {user?.email?.split('@')[0]}
                          </span>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-slate-200 focus:outline-none">
                            {/* Only show Dashboard for non-buyers */}
                            {role !== 'buyer' && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/dashboard"
                                    className={classNames(
                                      active ? 'bg-slate-50 text-slate-900' : 'text-slate-700',
                                      'block px-4 py-2 text-sm hover:bg-slate-50 rounded-lg mx-2 transition-colors duration-200'
                                    )}
                                  >
                                    Dashboard
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  disabled={isLoggingOut}
                                  className={classNames(
                                    active ? 'bg-slate-50 text-slate-900' : 'text-slate-700',
                                    'block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 rounded-lg mx-2 transition-colors duration-200',
                                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                  )}
                                >
                                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu panel */}
            <Disclosure.Panel className="sm:hidden border-t border-slate-200 bg-white">
              <div className="space-y-1 pb-3 pt-2 px-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block py-2 px-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors duration-200"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
                {!isAuthenticated && (
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block w-full py-2 px-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors duration-200"
                  >
                    Sign in
                  </Disclosure.Button>
                )}
              </div>
              {isAuthenticated && (
                <div className="border-t border-slate-200 pb-3 pt-4 bg-slate-50">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-8 w-8 text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-700">{user?.email}</div>
                      <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {/* Only show Dashboard for non-buyers */}
                    {role !== 'buyer' && (
                      <Disclosure.Button
                        as={Link}
                        to="/dashboard"
                        className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors duration-200"
                      >
                        Dashboard
                      </Disclosure.Button>
                    )}
                    <Disclosure.Button
                      as="button"
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 text-left text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors duration-200"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
