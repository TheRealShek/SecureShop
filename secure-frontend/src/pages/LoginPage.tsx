import { FormEvent, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon} from '@heroicons/react/24/outline';
import { getRoleBasedRedirect } from '../utils/roleUtils';
import type { UserRole } from '../utils/roleUtils';

export function LoginPage() {
  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login specific state
  const [rememberMe, setRememberMe] = useState(false);
  
  // Registration specific state
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const { login, register, isAuthenticated, loading, loadingRole, role, authReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // UNIFIED NAVIGATION LOGIC - Only component responsible for post-login redirect
  useEffect(() => {
    console.log('🔄 LoginPage useEffect triggered:', { 
      loading, 
      loadingRole,
      authReady, 
      isAuthenticated, 
      role 
    });
    
    // Wait for auth to be ready and user to be authenticated
    if (!authReady || loading || !isAuthenticated) {
      return; // Still loading or not authenticated
    }

    // Wait for role to be fully loaded
    if (loadingRole || !role) {
      return; // Role still loading
    }

    // Get the redirect path - will be null if role not ready
    const redirectPath = getRoleBasedRedirect(role);
    if (!redirectPath) {
      return; // Role not ready for redirect
    }

    console.log(`📍 LoginPage navigation: ${role} -> ${redirectPath}`);
    
    // SIMPLIFIED: Always redirect to role-based home after login
    // This prevents redirect loops and ensures users land on appropriate pages
    console.log('🏠 Redirecting to role-based home:', redirectPath);
    navigate(redirectPath, { replace: true });
  }, [authReady, loading, loadingRole, isAuthenticated, role, navigate, location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegisterMode) {
        // Registration validation
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        
        await register(email, password, selectedRole);
        // Navigation will be handled by the useEffect above
      } else {
        // Login
        await login(email, password, rememberMe);
        // Navigation will be handled by the useEffect above
      }
    } catch (err: any) {
      if (isRegisterMode) {
        setError(err.message || 'Failed to create account. Please try again.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
      console.error(isRegisterMode ? 'Registration error:' : 'Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRememberMe(false);
    setSelectedRole('buyer');
  };

  // Show loading state while checking authentication or loading role
  if (loading || loadingRole || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {loadingRole ? 'Loading user permissions...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
            {isRegisterMode ? 'Create Account' : 'Welcome back'}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {isRegisterMode 
              ? 'Join SecureShop as a buyer or seller' 
              : 'Sign in to your SecureShop account'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-slate-200 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake shadow-sm">
                <div className="flex">
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 bg-slate-50 focus:bg-white shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 bg-slate-50 focus:bg-white shadow-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Confirm Password Field - Only for Registration */}
            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Role Selection - Only for Registration */}
            {isRegisterMode && (
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="buyer">Buyer - Shop for products</option>
                  <option value="seller">Seller - Sell your products</option>
                </select>
              </div>
            )}

            {/* Remember Me Checkbox - Only for Login */}
            {!isRegisterMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Keep me signed in
                  </label>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">
                    (Stores login for 30 days)
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || isLoading}
                className="group relative w-full flex justify-center py-3.5 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  <LockClosedIcon className="h-5 w-5 text-indigo-300 group-hover:text-white transition-colors duration-200" />
                </span>
                {isLoading 
                  ? (isRegisterMode ? 'Creating account...' : 'Signing in...') 
                  : (isRegisterMode ? 'Create Account' : 'Sign in')
                }
              </button>
            </div>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-indigo-50"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">
            SecureShop - Your trusted e-commerce platform
          </p>
        </div>
      </div>
    </div>
  );
}
