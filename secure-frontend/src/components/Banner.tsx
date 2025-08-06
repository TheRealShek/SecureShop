import { ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface BannerProps {
  userName?: string;
  cartItemCount?: number;
  onCartClick?: () => void;
  promoMessage?: string;
}

export function Banner({
  userName = 'User',
  cartItemCount = 0,
  onCartClick,
  promoMessage = "Free shipping on orders over $50!"
}: BannerProps) {
  const displayName = userName.split('@')[0] || 'User';

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-8 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Welcome Message */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-2 text-indigo-100">
              Discover amazing products and great deals
            </p>
          </div>

          {/* Cart Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCartClick}
              className="relative flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6 text-white" />
              <span className="text-white font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Promo Message */}
        {promoMessage && (
          <div className="mt-6 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
            <SparklesIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />
            <p className="text-white font-medium">{promoMessage}</p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
        <div className="w-32 h-32 bg-white rounded-full"></div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 opacity-10">
        <div className="w-48 h-48 bg-white rounded-full"></div>
      </div>
    </div>
  );
}

export default Banner;
