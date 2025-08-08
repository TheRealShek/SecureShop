import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: Set<string>;
  loading?: boolean;
  emptyMessage?: string;
  maxProducts?: number;
}

export function ProductGrid({
  products,
  onAddToCart,
  loading = false,
  emptyMessage = "No products found",
  maxProducts
}: ProductGridProps) {
  
  // Show all products without limiting (since pagination handles the limiting)
  const displayProducts = maxProducts ? products.slice(0, maxProducts) : products;
  
  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(16)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse overflow-hidden h-full flex flex-col">
              <div className="aspect-square bg-gray-300"></div>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="flex-1"></div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  </div>
                  <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <div className="mx-auto h-32 w-32 text-gray-400 mb-8">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Responsive Grid Layout - 4x4 grid (16 items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              inStock: true // Default stock status - you can make this dynamic
            }}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
