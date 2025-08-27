import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks';
import { supabase } from '../services/supabase';
import { formatPrice } from '../utils/currency';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading, role } = useAuth();
  const { products, isLoading: productsLoading, error: productsError, refetch } = useProducts();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Check authentication and admin role on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (!authLoading && isAuthenticated && role && role !== 'admin') {
      // Non-admin users should not access this page
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, role, navigate]);

  // Filter products based on search term only (admin sees all products)
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return products.filter(
        product =>
          product.name.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.sellerId?.toLowerCase().includes(search)
      );
    }

    return products;
  }, [products, searchTerm]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingProductId(productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      // Refresh products list
      refetch();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Handle product edit
  const handleEditProduct = (productId: string) => {
    // Navigate to edit product page (you'll need to create this)
    navigate(`/admin/products/${productId}/edit`);
  };

  // Loading state
  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load products: {productsError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SecureShop Admin</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg">
                <UserCircleIcon className="h-8 w-8 text-slate-400" />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Administrator</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Dashboard Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h2>
          <p className="text-slate-600 text-lg">Manage all products across the platform</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, descriptions, or seller IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600 font-medium">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">
                {searchTerm 
                  ? `No products found matching "${searchTerm}"`
                  : "No products available"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="p-6 hover:bg-slate-50 transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start justify-between">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-5">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                              <span className="text-slate-400 text-xs font-medium">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                            {product.description || 'No description available'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                              {formatPrice(product.price)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                              Stock: {product.stock || 0}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                              Seller: {product.sellerId}
                            </span>
                            <span className="text-sm text-slate-500">
                              Created: {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 hover:text-indigo-800 transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 hover:text-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>
                          {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
