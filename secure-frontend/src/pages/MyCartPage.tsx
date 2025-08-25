import { useBuyerCart } from '../hooks/useBuyerOrders';
import { formatPrice } from '../utils/currency';
import { 
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

export function MyCartPage() {
  const { cartItems, cartCount, totalPrice, isLoading, error, refetch } = useBuyerCart();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <TrashIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading cart</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShoppingCartIcon className="h-8 w-8 mr-3" />
          My Cart
        </h1>
        <p className="text-gray-600 mt-2">
          {cartCount === 0 ? 'Your cart is empty' : `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some products to your cart to get started.</p>
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {item.product.description}
                      </p>
                      <p className="text-lg font-medium text-gray-900 mt-2">
                        {formatPrice(item.product.price)}
                      </p>
                      {item.product.stock !== undefined && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product.stock} in stock
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="text-gray-900 font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                        disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <button className="text-sm text-red-600 hover:text-red-500 mt-2">
                        <TrashIcon className="h-4 w-4 inline mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-gray-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                * This is a demo. Checkout functionality is not implemented.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
