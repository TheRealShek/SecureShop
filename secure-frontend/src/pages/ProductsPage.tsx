import { useState } from 'react';
import { usePaginatedProducts, useSortedProducts } from '../hooks';
import { useCart } from '../hooks';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSort } from '../components/ProductSort';
import { useAuth } from '../contexts/AuthContext';
import { SortOption } from '../hooks/useSortedProducts';

export function ProductsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState<SortOption>('newest-first');
  const { 
    products, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    loadMore, 
    remainingCount 
  } = usePaginatedProducts();
  
  // Apply sorting to the products
  const sortedProducts = useSortedProducts(products, sortBy);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const isBuyer = user?.role === 'buyer';

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">Failed to load products</div>
      </div>
    );
  }

  // Additional safety check to ensure products is an array
  if (!Array.isArray(products)) {
    console.error('Products data is not an array:', products);
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="text-sm text-yellow-700">Invalid products data format</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Products
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover our amazing collection of products
            </p>
          </div>

          {/* Product Controls - Sort and potentially filters */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">
                {Array.isArray(products) ? products.length : 0} products found
              </span>
            </div>
            <ProductSort 
              sortBy={sortBy} 
              onSortChange={setSortBy}
              className="flex-shrink-0"
            />
          </div>

          {/* Enhanced Product Grid with 4x4 layout */}
          <div className="bg-gray-50 rounded-2xl">
            <ProductGrid
              products={sortedProducts}
              onAddToCart={isBuyer ? handleAddToCart : undefined}
              onToggleFavorite={undefined} // Could be enhanced later
              favorites={new Set()} // Could be enhanced later
              loading={false} // We handle loading state above
              emptyMessage="Check back later for new products"
              // Remove maxProducts to show all loaded products
            />
            
            {/* Load more section */}
            {hasMore && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 text-center">
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    {remainingCount} more products available
                  </p>
                  <button 
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center px-8 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-3"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Products'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
