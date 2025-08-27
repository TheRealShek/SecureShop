import { memo } from 'react';
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
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  currentUserId?: string;
  userRole?: string;
  gridColumns?: 2 | 3 | 4;
  onQuickView?: (product: Product) => void;
}

export const ProductGrid = memo(function ProductGrid({
  products,
  onAddToCart,
  loading = false,
  emptyMessage = "No products found",
  maxProducts,
  onEdit,
  onDelete,
  currentUserId,
  userRole,
  gridColumns = 4,
  onQuickView
}: ProductGridProps) {
  
  // Show all products without limiting (since pagination handles the limiting)
  const displayProducts = maxProducts ? products.slice(0, maxProducts) : products;
  
  // Dynamic grid classes based on column count
  const getGridClasses = () => {
    const baseClasses = "grid gap-4 lg:gap-6";
    switch (gridColumns) {
      case 2:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2`;
      case 3:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case 4:
      default:
        return `${baseClasses} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`;
    }
  };
  
  if (loading) {
    return (
      <div className="py-4">
        <div className={getGridClasses()}>
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 animate-pulse overflow-hidden h-full flex flex-col">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex-1"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
      <div className="py-16 text-center">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Simple Grid Layout */}
      <div className={getGridClasses()}>
        {displayProducts.map((product) => {
          const isOwner = userRole === 'seller' && product.sellerId === currentUserId;
          return (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                inStock: true // Default stock status - you can make this dynamic
              }}
              onAddToCart={!isOwner ? onAddToCart : undefined}
              onEdit={isOwner ? onEdit : undefined}
              onDelete={isOwner ? onDelete : undefined}
              showSellerActions={isOwner}
              onQuickView={onQuickView}
            />
          );
        })}
      </div>
    </div>
  );
});
