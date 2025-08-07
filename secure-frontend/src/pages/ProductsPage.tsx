import { Link } from 'react-router-dom';
import { useProducts } from '../hooks';
import { DEFAULT_PRODUCT_VALUES, getProductImageUrl } from '../utils/typeGuards';
import { formatPrice } from '../utils/currency';

export function ProductsPage() {
  const { products, isLoading, error } = useProducts();

  // Limit to 25 products for better performance
  const displayProducts = products.slice(0, 25);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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

          {/* Product count indicator */}
          {displayProducts.length < products.length && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                Showing {displayProducts.length} of {products.length} products
              </p>
            </div>
          )}

          {/* Responsive Product Grid */}
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {displayProducts.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No products available</h3>
                  <p className="text-gray-500">Check back later for new products</p>
                </div>
              ) : (
                displayProducts.map((product) => (
                  <div key={product.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Product Image Container */}
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <div className="min-h-[100px] flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                            <Link to={`/products/${product.id}`} className="hover:text-indigo-600 transition-colors">
                              <span aria-hidden="true" className="absolute inset-0" />
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Load more indicator */}
            {displayProducts.length < products.length && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  {products.length - displayProducts.length} more products available
                </p>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
