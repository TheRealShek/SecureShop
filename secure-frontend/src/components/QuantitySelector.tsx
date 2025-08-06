import { useState } from 'react';

interface QuantitySelectorProps {
  initialQuantity?: number;
  onChange?: (quantity: number) => void;
  max?: number;
  min?: number;
}

export function QuantitySelector({ 
  initialQuantity = 1, 
  onChange, 
  max = 99, 
  min = 1 
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    const newQuantity = Math.max(min, quantity - 1);
    setQuantity(newQuantity);
    onChange?.(newQuantity);
  };

  const handleIncrease = () => {
    const newQuantity = Math.min(max, quantity + 1);
    setQuantity(newQuantity);
    onChange?.(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const newQuantity = Math.max(min, Math.min(max, value));
    setQuantity(newQuantity);
    onChange?.(newQuantity);
  };

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleDecrease}
          disabled={quantity <= min}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-16 text-center text-gray-900 border-none focus:ring-0"
        />
        <button
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}

export { QuantitySelector as default };
