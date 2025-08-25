import { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';
import { DEFAULT_PRODUCT_VALUES, getProductImageUrl } from '../utils/typeGuards';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product & {
    category?: string;
    rating?: number;
    inStock?: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showSellerActions?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ 
  product, 
  onAddToCart,
  onEdit,
  onDelete,
  showSellerActions = false,
}: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get the appropriate image URL with fallbacks
  const imageUrl = getProductImageUrl(product);

  const handleAddToCart = () => {
    if (product.inStock !== false) {
      onAddToCart?.(product.id);
      // Show success feedback
      console.log(`Added ${product.name} to cart`);
    }
  };



  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  return (
    <div 
      className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image - Simplified */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 rounded-full h-6 w-6"></div>
          </div>
        )}
        <img
          src={imageError ? DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE : imageUrl}
          alt={product.name}
          className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Stock Badge - Only when out of stock */}
        {product.inStock === false && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
            Out of Stock
          </div>
        )}

        {/* Simple Hover Actions */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {!showSellerActions && onAddToCart && product.inStock !== false && (
            <button
              onClick={handleAddToCart}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Product Info - Simplified */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
        </div>
        
        {/* Price and Stock - Clean Layout */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.inStock !== false && (
            <span className="text-xs text-green-600 font-medium">
              In Stock
            </span>
          )}
        </div>
        
        {/* Seller Actions - Simplified */}
        {showSellerActions && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(product.id)}
              className="flex-1 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
