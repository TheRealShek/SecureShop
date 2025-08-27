
import { memo } from 'react';
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

export const ProductSort = memo(function ProductSort({ sortBy, onSortChange, className = '' }: ProductSortProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <label htmlFor="sort-select" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
          Sort by:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md min-w-[160px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className="w-4 h-4 text-slate-500 transition-transform duration-200" 
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
    </div>
  );
});
