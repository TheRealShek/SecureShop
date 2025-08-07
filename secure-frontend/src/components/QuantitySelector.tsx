import { useState } from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QuantitySelectorProps {
  initialQuantity?: number;
  onChange?: (quantity: number) => void;
  max?: number;
  min?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantitySelector({ 
  initialQuantity = 1, 
  onChange, 
  max = 99, 
  min = 1,
  label = 'Quantity',
  size = 'md'
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

  const sizeClasses = {
    sm: {
      button: 'p-1.5 text-xs',
      input: 'w-12 h-8 text-sm',
      icon: 'h-3 w-3'
    },
    md: {
      button: 'p-2 text-sm',
      input: 'w-16 h-10 text-base',
      icon: 'h-4 w-4'
    },
    lg: {
      button: 'p-3 text-base',
      input: 'w-20 h-12 text-lg',
      icon: 'h-5 w-5'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center justify-center border border-gray-300 rounded-lg divide-x divide-gray-300 bg-white shadow-sm">
        <button
          onClick={handleDecrease}
          disabled={quantity <= min}
          type="button"
          className={`${classes.button} flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors rounded-l-lg`}
        >
          <MinusIcon className={classes.icon} />
        </button>
        
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          className={`${classes.input} text-center border-0 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-transparent font-medium text-gray-900`}
        />
        
        <button
          onClick={handleIncrease}
          disabled={quantity >= max}
          type="button"
          className={`${classes.button} flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors rounded-r-lg`}
        >
          <PlusIcon className={classes.icon} />
        </button>
      </div>
      {quantity >= max && (
        <p className="text-xs text-amber-600">Maximum quantity reached</p>
      )}
    </div>
  );
}

export { QuantitySelector as default };
