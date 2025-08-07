import { Cart } from '../components/cart';
import { CartErrorBoundary } from '../components/CartErrorBoundary';

export function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <CartErrorBoundary>
          <Cart />
        </CartErrorBoundary>
      </div>
    </div>
  );
}
