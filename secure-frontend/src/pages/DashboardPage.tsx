import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts, useSortedProducts } from '../hooks';
import { Banner } from '../components/Banner';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSort } from '../components/ProductSort';
import { SortOption } from '../hooks/useSortedProducts';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest-first');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Filter products based on category and search term
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      // Note: You'll need to add category field to your Product type if needed
      // For now, we'll filter by name/description content
      filtered = filtered.filter(product => {
        const productContent = `${product.name} ${product.description}`.toLowerCase();
        return productContent.includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Apply sorting to filtered products
  const sortedProducts = useSortedProducts(filteredProducts, sortBy);

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

  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    setCartItems(prev => new Set([...prev, productId]));
    const product = products.find(p => p.id === productId);
    console.log(`Added ${product?.name} to cart!`);
    
    // Simple toast-like feedback
    if (product) {
      alert(`✅ ${product.name} added to cart!`);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  // Handle cart click
  const handleCartClick = () => {
    navigate('/cart');
  };

  // Loading state
  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Loading...' : 'Loading products...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state for products
  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Failed to Load Products</h2>
          <p className="mt-3 text-gray-600">
            We couldn't load the products. Please try refreshing the page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info and Logout */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">SecureShop</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
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
        {/* Banner */}
        <Banner
          userName={user.email || 'User'}
          cartItemCount={cartItems.size}
          onCartClick={handleCartClick}
          promoMessage="🎉 Special Holiday Sale - Up to 50% off selected items!"
        />

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Results Info and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {selectedCategory === 'all' ? 'All Products' : 
               selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {favorites.size > 0 && (
              <p className="text-sm text-gray-500">
                {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
              </p>
            )}
            <ProductSort 
              sortBy={sortBy} 
              onSortChange={setSortBy}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={sortedProducts}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          maxProducts={25}
          emptyMessage={
            searchTerm 
              ? `No products found matching "${searchTerm}". Try a different search term.`
              : selectedCategory !== 'all'
              ? `No products found in the ${selectedCategory} category.`
              : "No products available at the moment."
          }
        />
      </main>
    </div>
  );
}
