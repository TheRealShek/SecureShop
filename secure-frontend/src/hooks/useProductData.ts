import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/api';
import { Product } from '../types';

export function useProductData(id: string | undefined) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes - individual product data doesn't change often
    gcTime: 45 * 60 * 1000, // 45 minutes
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: false, // Don't refetch when component remounts
  });
}
