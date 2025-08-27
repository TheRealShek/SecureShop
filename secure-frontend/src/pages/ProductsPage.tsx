import { useState, useMemo, Suspense, lazy } from 'react';
import { usePaginatedProducts, useSortedProducts, useDebounce } from '../hooks';
import { useCart } from '../hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSort } from '../components/ProductSort';
// Lazy load modals for better performance
const QuickViewModal = lazy(() => import('../components/QuickViewModal').then(module => ({ default: module.QuickViewModal })));
const EditProductModal = lazy(() => import('../components/EditProductModal').then(module => ({ default: module.EditProductModal })));
const DeleteConfirmModal = lazy(() => import('../components/DeleteConfirmModal').then(module => ({ default: module.DeleteConfirmModal })));
import { useAuth } from '../contexts/AuthContext';
import { SortOption } from '../hooks/useSortedProducts';
import { Product } from '../types';
import { SellerProductService } from '../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Modal loading spinner
const ModalLoadingSpinner = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-8 shadow-xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-slate-700 text-sm">Loading...</p>
    </div>
  </div>
);

export function ProductsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortOption>('newest-first');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search term to reduce unnecessary filtering (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
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

  // Filter products based on debounced search term
  const filteredProducts = useMemo(() => {
    let filtered = sortedProducts;

    // Filter by search term (using debounced value)
    if (debouncedSearchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [sortedProducts, debouncedSearchTerm]); // Use debouncedSearchTerm in dependency

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
    <div className="min-h-screen bg-slate-50">
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed top-6 right-6 max-w-sm w-full z-50 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-up ${
          toast.type === 'success' 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' 
            : 'bg-red-50/95 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Products
          </h1>
          <p className="text-lg text-slate-600">
            Discover quality products from trusted sellers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">
                {filteredProducts.length} products
              </span>
              <ProductSort 
                sortBy={sortBy} 
                onSortChange={setSortBy}
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="animate-fade-in">
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
          
          {/* Load More Button */}
          {hasMore && filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <button 
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 transition-all duration-200 shadow-sm"
              >
                {isLoadingMore ? 'Loading...' : `Load More (${remainingCount} remaining)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <QuickViewModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={isBuyer ? handleAddToCart : undefined}
          />
        </Suspense>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <EditProductModal
            product={editingProduct}
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleSaveProduct}
            isLoading={updateProductMutation.isPending}
          />
        </Suspense>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <DeleteConfirmModal
            isOpen={!!deletingProduct}
            productName={deletingProduct?.name || ''}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingProduct(null)}
            isDeleting={deleteProductMutation.isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
