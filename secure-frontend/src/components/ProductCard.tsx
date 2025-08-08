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
  // onToggleFavorite?: (productId: string) => void;
  // isFavorite?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart
}: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out h-full flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-200">
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 rounded-full h-8 w-8"></div>
          </div>
        )}
        <img
          src={imageError ? DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE : imageUrl}
          alt={product.name}
          className={`h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {/* Stock Badge */}
        {product.inStock === false && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </div>
          
        </div>
        
        {/* Card Footer - Price and Add to Cart */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              product.inStock === false
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm hover:shadow-md'
            }`}
          >
            <ShoppingCartIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{product.inStock === false ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
