import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks';
import { supabase } from '../services/supabase';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">SecureShop Admin</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage all products across the platform</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, descriptions, or seller IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => navigate('/admin/products/add')}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        {/* Products List - Single Column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm 
                  ? `No products found matching "${searchTerm}"`
                  : "No products available"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium text-green-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <span>
                              Stock: {product.stock || 0}
                            </span>
                            <span>
                              Seller ID: {product.sellerId}
                            </span>
                            <span>
                              Created: {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
