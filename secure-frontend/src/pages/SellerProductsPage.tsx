import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerProductService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function SellerProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Sort products based on selected option
  const sortedProducts = () => {
    const productsCopy = [...products];
    
    switch (sortBy) {
      case 'name-asc':
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'stock-asc':
        return productsCopy.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      case 'stock-desc':
        return productsCopy.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      case 'newest':
      default:
        return productsCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  // Fetch seller's products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: SellerProductService.getSellerProducts,
    enabled: !!user?.id,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: SellerProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setToast({ message: 'Product deleted successfully!', type: 'success' });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      setToast({ message: `Failed to delete product: ${error.message}`, type: 'error' });
      setDeleteConfirm(null);
    },
  });

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">Failed to load products</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your product catalog • {products.length} product{products.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none space-y-3 sm:space-y-0 sm:space-x-3 flex flex-col sm:flex-row sm:items-center">
            {/* Sort Dropdown */}
            {products.length > 0 && (
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-0 bg-transparent text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 cursor-pointer min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="stock-asc">Stock (Low to High)</option>
                  <option value="stock-desc">Stock (High to Low)</option>
                </select>
              </div>
            )}
            
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/seller/products/add"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Ready to start selling? Add your first product and begin building your store.
          </p>
          <Link
            to="/seller/products/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts().map((product) => (
            <div key={product.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${(product.stock || 0) === 0 ? 'bg-red-100 text-red-700' : (product.stock || 0) <= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {product.stock || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock: <span className={`font-medium ${(product.stock || 0) === 0 ? 'text-red-600' : (product.stock || 0) <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock || 0} units
                    </span>
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/seller/products/${product.id}/edit`}
                    className="flex-1 bg-indigo-600 text-white text-center py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="flex-1 bg-red-600 text-white py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                  >
                     Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete this product? This action cannot be undone and will remove the product from your store permanently.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                disabled={deleteProductMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {deleteProductMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  ' Delete Product'
                )}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteProductMutation.isPending}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
