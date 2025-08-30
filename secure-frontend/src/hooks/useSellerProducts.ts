import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProductQueryOptions, createRoleBasedEnabled, QueryKeys, getMutationOptions } from './queryOptions';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  seller_id: string;
  created_at: string;
}

interface UseSellerProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  deleteProduct: (productId: string) => Promise<void>;
  deleting: boolean;
}

/**
 * React Query-based hook for managing seller products
 * Ensures proper role validation and prevents duplicate requests
 */
export function useSellerProducts(sellerId?: string): UseSellerProductsReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Validate role-based access
  const effectiveSellerId = sellerId || user?.id;

  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<Product[]>({
    queryKey: QueryKeys.sellerProducts(effectiveSellerId),
    queryFn: async (): Promise<Product[]> => {
      if (!effectiveSellerId) {
        throw new Error('Seller ID is required');
      }

      console.log(' Fetching products for seller:', effectiveSellerId);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', effectiveSellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(' Failed to fetch seller products:', error);
        throw error;
      }

      console.log(' Seller products fetched:', data?.length || 0);
      return data || [];
    },
    enabled: createRoleBasedEnabled(isAuthenticated, user?.role, ['seller', 'admin'], !!effectiveSellerId),
    ...getProductQueryOptions<Product[]>(),
  });

  const deleteProductMutation = useMutation({
    ...getMutationOptions(),
    mutationFn: async (productId: string) => {
      if (!effectiveSellerId) {
        throw new Error('Seller ID is required');
      }

      console.log(' Deleting product:', productId);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', effectiveSellerId); // Extra security: ensure seller owns the product

      if (error) {
        console.error(' Failed to delete product:', error);
        throw error;
      }

      console.log(' Product deleted successfully:', productId);
    },
    onSuccess: (_, productId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        QueryKeys.sellerProducts(effectiveSellerId),
        (oldProducts: Product[] = []) => 
          oldProducts.filter(product => product.id !== productId)
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.products() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.sellerProducts(effectiveSellerId) });
    },
    onError: (error) => {
      console.error(' Product deletion failed:', error);
    }
  });

  return {
    products,
    loading,
    error: error as Error | null,
    refetch,
    deleteProduct: deleteProductMutation.mutateAsync,
    deleting: deleteProductMutation.isPending,
  };
}
