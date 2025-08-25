import { useState, useMemo } from 'react';
import { usePaginatedProducts, useSortedProducts } from '../hooks';
import { useCart } from '../hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSort } from '../components/ProductSort';
import { QuickViewModal } from '../components/QuickViewModal';
import { EditProductModal } from '../components/EditProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { SortOption } from '../hooks/useSortedProducts';
import { Product } from '../types';
import { SellerProductService } from '../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function ProductsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortOption>('newest-first');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Filter products based on search term only
  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [sortedProducts, searchTerm]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      SellerProductService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginated-products'] });
      setToast({ message: 'Product updated successfully!', type: 'success' });
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      setToast({ message: `Failed to update product: ${error.message}`, type: 'error' });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: SellerProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginated-products'] });
      setToast({ message: 'Product deleted successfully!', type: 'success' });
      setDeletingProduct(null);
    },
    onError: (error: Error) => {
      setToast({ message: `Failed to delete product: ${error.message}`, type: 'error' });
      setDeletingProduct(null);
    },
  });

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      setToast({ message: 'Product added to cart!', type: 'success' });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setToast({ message: 'Failed to add product to cart', type: 'error' });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setDeletingProduct({ id: productId, name: product.name });
    }
  };

  const handleSaveProduct = async (productId: string, updates: Partial<Product>) => {
    await updateProductMutation.mutateAsync({ id: productId, updates });
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProductMutation.mutate(deletingProduct.id);
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
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 max-w-sm w-full z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          
          {/* Simple Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Products
            </h1>
            <p className="text-gray-600">
              Discover quality products from trusted sellers
            </p>
          </div>

          {/* Simple Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>

          {/* Simple Controls */}
          <div className="mb-6 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} products
            </span>
            <ProductSort 
              sortBy={sortBy} 
              onSortChange={setSortBy}
            />
          </div>

          {/* Products Grid - Clean and Minimal */}
          <div>
            <ProductGrid
              products={filteredProducts}
              onAddToCart={isBuyer ? handleAddToCart : undefined}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              currentUserId={user?.id}
              userRole={user?.role}
              onToggleFavorite={undefined}
              favorites={new Set()}
              loading={false}
              emptyMessage={
                searchTerm 
                  ? "No products found. Try different search terms."
                  : "No products available"
              }
              gridColumns={4}
              onQuickView={setQuickViewProduct}
            />
            
            {/* Simple Load More */}
            {hasMore && filteredProducts.length > 0 && (
              <div className="text-center mt-8">
                <button 
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : `Load More (${remainingCount} remaining)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={isBuyer ? handleAddToCart : undefined}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProduct}
        isLoading={updateProductMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        productName={deletingProduct?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
        isDeleting={deleteProductMutation.isPending}
      />
    </div>
  );
}
