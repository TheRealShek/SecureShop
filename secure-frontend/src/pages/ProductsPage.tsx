import { useState } from 'react';
import { usePaginatedProducts, useSortedProducts } from '../hooks';
import { useCart } from '../hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSort } from '../components/ProductSort';
import { EditProductModal } from '../components/EditProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { SortOption } from '../hooks/useSortedProducts';
import { Product } from '../types';
import { SellerProductService } from '../services/api';

export function ProductsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortOption>('newest-first');
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);
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
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              currentUserId={user?.id}
              userRole={user?.role}
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
