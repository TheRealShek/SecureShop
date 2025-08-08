

import { SortOption } from '../hooks/useSortedProducts';

interface ProductSortProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  className?: string;
}

const sortOptions = [
  { value: 'price-low-to-high' as const, label: 'Price: Low to High' },
  { value: 'price-high-to-low' as const, label: 'Price: High to Low' },
  { value: 'popularity' as const, label: 'Popularity' },
  { value: 'newest-first' as const, label: 'Newest First' },
];

export function ProductSort({ sortBy, onSortChange, className = '' }: ProductSortProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
