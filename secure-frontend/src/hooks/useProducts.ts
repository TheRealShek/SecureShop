import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Product } from '../types';
import { ProductService } from '../services/api';
import { DEFAULT_PRODUCT_VALUES } from '../utils/typeGuards';

interface UseProductsResult extends Omit<UseQueryResult<Product[], Error>, 'data'> {
  products: Product[];
  isEmpty: boolean;
}

export function useProducts(): UseProductsResult {
  const query = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const products = query.data || DEFAULT_PRODUCT_VALUES.EMPTY_ARRAY;

  return {
    ...query,
    products,
    isEmpty: products.length === 0,
  };
}
