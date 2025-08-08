import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
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
  const { totalItems } = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const navigation: NavigationItem[] = useMemo(() => {
    const baseNav = [
      { name: 'Products', href: '/products' },
    ];

    if (isAuthenticated && role) {
      // Add role-specific navigation items
      if (role === 'buyer' || role === 'admin') {
        baseNav.push({ name: 'Cart', href: '/cart' });
      }
      
      if (role === 'admin') {
        baseNav.push({ name: 'Dashboard', href: '/dashboard' });
      }
      
      if (role === 'seller' || role === 'admin') {
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
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-white shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                      SecureShop
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
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
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/cart"
                        className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                        {totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white">
                            {totalItems > 99 ? '99+' : totalItems}
                          </span>
                        )}
                      </Link>

                      <Menu as="div" className="relative ml-3">
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none">
                          <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
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
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/dashboard"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  disabled={isLoggingOut}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full px-4 py-2 text-left text-sm text-gray-700',
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
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu panel */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
                {!isAuthenticated && (
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block w-full border-l-4 border-transparent py-2 pl-3 pr-4 text-left text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Sign in
                  </Disclosure.Button>
                )}
              </div>
              {isAuthenticated && (
                <div className="border-t border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                      <div className="text-xs text-gray-500">{user?.role}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      to="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Dashboard
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={() => logout()}
                      className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
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
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
