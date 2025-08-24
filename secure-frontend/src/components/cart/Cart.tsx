import { useState } from 'react';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartContext } from '../../contexts/CartContext';
import { useToast } from '../Toast';
import { formatPrice } from '../../utils/currency';
import { getProductImageUrl } from '../../utils/typeGuards';

// Fallback image URL that works reliably
const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTQwSDIyNVYxNzBIMTc1VjE0MFpNMTUwIDEwMEgzMDBDMzEzLjgwNyAxMDAgMzI1IDExMS4xOTMgMzI1IDEyNVYyNzVDMzI1IDI4OC44MDcgMzEzLjgwNyAzMDAgMzAwIDMwMEgxMDBDODYuMTkzIDMwMCA3NSAyODguODA3IDc1IDI3NVYxMjVDNzUgMTExLjE5MyA4Ni4xOTMgMTAwIDEwMCAxMDBIMTUwWk0xMDAgMTI1VjI3NUgzMDBWMTI1SDEwMFpNMTI1IDE3MkwxNzUgMjI1TDIyNSAxNzVMMjc1IDIyNVYyNTBIMTI1VjE3MloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';

export function Cart() {
  const {
    cartItems,
    isLoading,
    error,
    totalItems,
    totalPrice,
    updateCartItem,
    removeCartItem,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart
  } = useCartContext();
  
  const { showToast } = useToast();
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setProcessingItems(prev => new Set([...prev, productId]));
    try {
      await updateCartItem(productId, newQuantity);
      showToast('Cart updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update cart item', 'error');
      console.error('Error updating cart:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    setProcessingItems(prev => new Set([...prev, productId]));
    try {
      await removeCartItem(productId);
      showToast(`${productName} removed from cart`, 'success');
    } catch (error) {
      showToast('Failed to remove item from cart', 'error');
      console.error('Error removing item:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    try {
      await clearCart();
      showToast('Order placed successfully! Cart cleared.', 'success');
    } catch (error) {
      showToast('Failed to process checkout', 'error');
      console.error('Error during checkout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.message.includes('not authenticated');
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {isAuthError ? 'Authentication Required' : 'Cart Error'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {isAuthError 
              ? 'Please sign in as a buyer to access your cart.'
              : 'Failed to load cart. Please try refreshing the page.'
            }
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-gray-600">Start shopping to add items to your cart!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h2>
      </div>

      {/* Cart Items */}
      <div className="p-6">
        <div className="space-y-6">
          {cartItems.map((item) => {
            const isProcessing = processingItems.has(item.productId);
            
            return (
              <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20">
                  <img
                    src={getProductImageUrl(item.product)}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE_URL;
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isProcessing || isUpdatingCart}
                    className="p-1 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MinusIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <span className="w-12 text-center font-medium text-gray-900">
                    {isProcessing ? '...' : item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={isProcessing || isUpdatingCart}
                    className="p-1 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.productId, item.product.name)}
                  disabled={isProcessing || isRemovingFromCart}
                  className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Remove from cart"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={isClearingCart || cartItems.length === 0}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearingCart ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Checkout • ${formatPrice(totalPrice)}`
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            * This is a demo checkout. Cart will be cleared upon checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
