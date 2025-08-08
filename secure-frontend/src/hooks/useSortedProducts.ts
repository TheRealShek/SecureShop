import { useMemo } from 'react';
import { Product } from '../types';

export type SortOption = 
  | 'price-low-to-high'
  | 'price-high-to-low'
  | 'popularity'
  | 'newest-first';

export function useSortedProducts(products: Product[], sortBy: SortOption): Product[] {
  return useMemo(() => {
    if (!products || products.length === 0) {
      return products;
    }

    const sortedProducts = [...products];

    switch (sortBy) {
      case 'price-low-to-high':
        return sortedProducts.sort((a, b) => a.price - b.price);
        
      case 'price-high-to-low':
        return sortedProducts.sort((a, b) => b.price - a.price);
        
      case 'newest-first':
        return sortedProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
      case 'popularity':
        // Since we don't have popularity data yet, we'll sort by name alphabetically
        // This can be replaced with actual popularity logic when the data is available
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        
      default:
        return sortedProducts;
    }
  }, [products, sortBy]);
}
