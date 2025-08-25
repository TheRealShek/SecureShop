import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import { CreateOrderData } from '../api/services/checkout.service';

interface CheckoutButtonProps {
  disabled?: boolean;
  className?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function CheckoutButton({ 
  disabled = false, 
  className = '', 
  onSuccess,
  onError 
}: CheckoutButtonProps) {
  const { processCheckout, isProcessing } = useCheckout();
  const navigate = useNavigate();
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const handleCheckout = async () => {
    setShowShippingForm(true);
  };

  const handleConfirmCheckout = async () => {
    const orderData: CreateOrderData = {
      shipping_address: shippingAddress.trim() || undefined
    };

    const result = await processCheckout(orderData);
    
    if (result.success && result.order) {
      onSuccess?.(result.order.id);
      setShowShippingForm(false);
      setShippingAddress('');
      // Navigate to orders page after successful checkout
      navigate('/orders');
    } else {
      onError?.(result.error || 'Checkout failed');
    }
  };

  if (showShippingForm) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold">Shipping Information</h3>
        <div>
          <label htmlFor="shipping" className="block text-sm font-medium text-gray-700 mb-1">
            Shipping Address
          </label>
          <textarea
            id="shipping"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirmCheckout}
            disabled={isProcessing}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Confirm Order'}
          </button>
          <button
            onClick={() => setShowShippingForm(false)}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isProcessing}
      className={`w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isProcessing ? 'Processing...' : 'Checkout'}
    </button>
  );
}

export default CheckoutButton;
