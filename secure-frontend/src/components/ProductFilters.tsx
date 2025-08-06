import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface ProductFiltersProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
}

export function ProductFilters({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  onSearchChange,
  searchTerm = ''
}: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Products', count: 24 },
    { id: 'electronics', name: 'Electronics', count: 8 },
    { id: 'clothing', name: 'Clothing', count: 6 },
    { id: 'home', name: 'Home & Garden', count: 5 },
    { id: 'sports', name: 'Sports', count: 3 },
    { id: 'books', name: 'Books', count: 2 }
  ];

  const categoriesToUse = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search products..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {/* Desktop Category Tabs */}
          <div className="hidden lg:flex items-center space-x-1">
            {categoriesToUse.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange?.(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {category.name}
                {category.count && (
                  <span className="ml-1 text-xs text-gray-500">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Category Dropdown */}
      {isFilterOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {categoriesToUse.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange?.(category.id);
                  setIsFilterOpen(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name}
                {category.count && (
                  <span className="ml-1 text-xs text-gray-500">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;
