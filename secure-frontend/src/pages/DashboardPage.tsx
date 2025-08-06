import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Banner } from '../components/Banner';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'electronics',
    rating: 4.5,
    inStock: true
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
    description: 'Track your fitness goals with this advanced smartwatch',
    category: 'electronics',
    rating: 4.3,
    inStock: true
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
    description: 'Comfortable and sustainable cotton t-shirt',
    category: 'clothing',
    rating: 4.7,
    inStock: true
  },
  {
    id: '4',
    name: 'Modern Coffee Maker',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center',
    description: 'Brew perfect coffee every morning',
    category: 'home',
    rating: 4.2,
    inStock: false
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center',
    description: 'Non-slip premium yoga mat for all your workouts',
    category: 'sports',
    rating: 4.6,
    inStock: true
  },
  {
    id: '6',
    name: 'JavaScript Programming Book',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop&crop=center',
    description: 'Learn modern JavaScript programming',
    category: 'books',
    rating: 4.8,
    inStock: true
  },
  {
    id: '7',
    name: 'Wireless Gaming Mouse',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop&crop=center',
    description: 'Precision gaming mouse with RGB lighting',
    category: 'electronics',
    rating: 4.4,
    inStock: true
  },
  {
    id: '8',
    name: 'Designer Sunglasses',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&crop=center',
    description: 'Stylish sunglasses with UV protection',
    category: 'clothing',
    rating: 4.1,
    inStock: true
  },
  {
    id: '9',
    name: 'Indoor Plant Set',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center',
    description: 'Beautiful indoor plants to brighten your home',
    category: 'home',
    rating: 4.5,
    inStock: true
  },
  {
    id: '10',
    name: 'Basketball',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&crop=center',
    description: 'Official size basketball for outdoor play',
    category: 'sports',
    rating: 4.3,
    inStock: true
  },
  {
    id: '11',
    name: 'Cookbook Collection',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&crop=center',
    description: 'Collection of world cuisine recipes',
    category: 'books',
    rating: 4.6,
    inStock: true
  },
  {
    id: '12',
    name: 'Denim Jacket',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&crop=center',
    description: 'Classic denim jacket for any season',
    category: 'clothing',
    rating: 4.4,
    inStock: true
  }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
    let filtered = MOCK_PRODUCTS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

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
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
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
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
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
          
          {favorites.size > 0 && (
            <p className="text-sm text-gray-500">
              {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
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
