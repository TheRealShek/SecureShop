import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductData } from '../hooks/useProductData';
import { useAddToCart } from '../hooks/useAddToCart';
import { QuantitySelector } from '../components/QuantitySelector';
import { ReviewModal } from '../components/ReviewModal';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useProductData(id);
  const addToCartMutation = useAddToCart();

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">Failed to load product</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (id) {
      addToCartMutation.mutate({ productId: id, quantity });
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        {/* Image gallery */}
        <div className="lg:max-w-lg lg:self-end">
          <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">${product.price}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <p className="space-y-6 text-base text-gray-700">{product.description}</p>
          </div>

          <div className="mt-10">
            <QuantitySelector
              initialQuantity={quantity}
              onChange={setQuantity}
              max={99}
            />

            <div className="mt-8 space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {addToCartMutation.isPending ? 'Adding...' : 'Add to cart'}
              </button>

              <ReviewModal 
                productId={id!} 
                productName={product.name}
                trigger={
                  <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Write a Review
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
