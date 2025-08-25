import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/typeGuards';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: string) => void;
}

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  if (!product) return null;

  const imageUrl = getProductImageUrl(product);
  const rating = 4; // Mock rating - you can make this dynamic

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative bg-gray-100">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-96 lg:h-[32rem] w-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="p-8 flex flex-col">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          {product.name}
                        </h2>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarSolidIcon 
                                key={i}
                                className={`h-5 w-5 ${
                                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({rating}.0)</span>
                          <span className="text-sm text-gray-500">• 127 reviews</span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {product.description || "This is a high-quality product that meets all your needs. Crafted with attention to detail and built to last."}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">Premium quality materials</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">Durable construction</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">Fast shipping available</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Add to Cart Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                          <span className="text-sm text-gray-500">
                            Free shipping on orders over ₹500
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onAddToCart?.(product.id);
                            onClose();
                          }}
                          className="w-full flex items-center justify-center space-x-3 bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                        >
                          <ShoppingCartIcon className="h-6 w-6" />
                          <span>Add to Cart</span>
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-3">
                          30-day return policy • Secure checkout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default QuickViewModal;
