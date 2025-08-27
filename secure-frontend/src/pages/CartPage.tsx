import { Cart } from '../components/cart';
import { CartErrorBoundary } from '../components/CartErrorBoundary';

export function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Shopping Cart</h1>
          <p className="text-lg text-slate-600 mb-8">Review and manage your selected items</p>
        </div>
        <CartErrorBoundary>
          <div className="animate-slide-up">
            <Cart />
          </div>
        </CartErrorBoundary>
      </div>
    </div>
  );
}
