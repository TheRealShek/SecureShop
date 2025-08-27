import { useState, memo } from 'react';
import { ShoppingCartIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
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

const ProductCard = memo(function ProductCard({ 
  product, 
  onAddToCart,
  onEdit,
  onDelete,
  showSellerActions = false,
  onQuickView,
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
      className="group relative bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden hover:border-slate-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-slate-300 rounded-full h-8 w-8"></div>
          </div>
        )}
        <img
          src={imageError ? DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE : imageUrl}
          alt={product.name}
          className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Stock Badge */}
        {product.inStock === false && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-full shadow-sm">
            Out of Stock
          </div>
        )}

        {/* Hover Actions */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex flex-col items-center gap-3">
            {/* View Details Button */}
            {!showSellerActions && onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                className="bg-white/95 backdrop-blur-sm text-slate-800 px-4 py-2.5 rounded-full font-medium text-sm hover:bg-white hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
                title="View product details"
              >
                <InformationCircleIcon className="h-4 w-4" />
                <span>View Details</span>
              </button>
            )}
            
            {/* Add to Cart Button */}
            {!showSellerActions && onAddToCart && product.inStock !== false && (
              <button
                onClick={handleAddToCart}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
        
        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.inStock !== false && (
            <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-full">
              In Stock
            </span>
          )}
        </div>
        
        {/* Rating - Only show for buyers (when not showing seller actions) */}
        {!showSellerActions && product.rating !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">
              {product.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
        )}
        
        {/* Seller Actions */}
        {showSellerActions && (
          <div className="flex gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(product.id)}
              className="flex-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export { ProductCard };
