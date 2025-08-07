import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, HeartIcon, ShareIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useProductData } from '../hooks/useProductData';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { QuantitySelector } from '../components/QuantitySelector';
import { ReviewModal } from '../components/ReviewModal';
import { DEFAULT_PRODUCT_VALUES, getProductImageUrl } from '../utils/typeGuards';
import { formatPriceIndian } from '../utils/currency';
import { useToast } from '../components/Toast';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);

  const { data: product, isLoading, error } = useProductData(id);

  // Mock product gallery (you can extend this to support multiple images)
  const productImages = product ? [getProductImageUrl(product)] : [];
  const selectedImageIndex = 0; // For now, always show first image

  const handleAddToCart = async () => {
    if (!product || isAddingToCartLocal) return;
    
    setIsAddingToCartLocal(true);
    try {
      await addToCart(product.id);
      showToast(`${product.name} added to cart! Quantity: ${quantity}`, 'success');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setIsAddingToCartLocal(false);
    }
  };

  const isBuyer = user?.role === 'buyer';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="mt-3 text-gray-600">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  };

  const isOutOfStock = false; // You can implement stock checking here
  const canAddToCart = !isAddingToCartLocal && quantity > 0 && !isOutOfStock && isBuyer;

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Back to Products</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 w-full">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PRODUCT_VALUES.PLACEHOLDER_IMAGE;
                  }}
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Product Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {product.name}
                </h1>
              </div>
              
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarSolidIcon
                    key={rating}
                    className="h-5 w-5 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8 based on 124 reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline space-x-3">
                <p className="text-4xl font-bold text-gray-900">
                  {formatPriceIndian(product.price)}
                </p>
                {/* You can add original price for discounts */}
                {/* <p className="text-xl text-gray-500 line-through">₹2,999</p> */}
              </div>
              {/* <p className="text-sm text-green-600 font-medium">Save ₹500 (17% off)</p> */}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <div className="prose prose-sm text-gray-700">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`}></div>
                <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-8">
              <QuantitySelector
                initialQuantity={quantity}
                onChange={setQuantity}
                max={10}
                min={1}
                size="lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl transition-all duration-200 ${
                  canAddToCart
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingToCartLocal ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Adding to Cart...
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : !isBuyer ? (
                  'Sign in as Buyer to Add to Cart'
                ) : (
                  `Add ${quantity} to Cart`
                )}
              </button>

              <ReviewModal 
                productId={id!} 
                productName={product.name}
                trigger={
                  <button className="w-full flex items-center justify-center px-8 py-4 text-base font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 transform hover:-translate-y-0.5">
                    <StarIcon className="h-5 w-5 mr-2" />
                    Write a Review
                  </button>
                }
              />
            </div>

            {/* Additional Info */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-medium">{product.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">Electronics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
