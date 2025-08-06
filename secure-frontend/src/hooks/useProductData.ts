import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/api';
import { Product } from '../types';

export function useProductData(id: string | undefined) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id!),
    enabled: !!id,
  });
}
