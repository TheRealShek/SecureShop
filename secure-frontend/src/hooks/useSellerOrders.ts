import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getOrderQueryOptions, createRoleBasedEnabled, QueryKeys } from './queryOptions';

interface SellerOrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  order_id: string;
  product_id: string;
  // Joined from products
  product: {
    name: string;
    image_url: string;
    seller_id: string;
  };
  // Joined from orders
  order: {
    created_at: string;
    status: string;
    buyer_id: string;
  };
}

interface UseSellerOrdersReturn {
  orderItems: SellerOrderItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query-based hook for managing seller orders
 * Ensures proper role validation and prevents duplicate requests
 */
export function useSellerOrders(sellerId?: string): UseSellerOrdersReturn {
  const { user, isAuthenticated } = useAuth();

  // Validate role-based access
  const effectiveSellerId = sellerId || user?.id;

  const {
    data: orderItems = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<SellerOrderItem[]>({
    queryKey: QueryKeys.sellerOrders(effectiveSellerId),
    queryFn: async (): Promise<SellerOrderItem[]> => {
      if (!effectiveSellerId) {
        throw new Error('Seller ID is required');
      }

      console.log('🔍 Fetching orders for seller:', effectiveSellerId);

      // Start from order_items and join with products and orders
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price_at_purchase,
          order_id,
          product_id,
          products:product_id (
            name,
            image_url,
            seller_id
          ),
          orders:order_id (
            created_at,
            status,
            buyer_id
          )
        `)
        .eq('products.seller_id', effectiveSellerId)
        .order('orders(created_at)', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch seller orders:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: SellerOrderItem[] = (data || []).map(item => ({
        id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        order_id: item.order_id,
        product_id: item.product_id,
        product: Array.isArray(item.products) ? item.products[0] : item.products,
        order: Array.isArray(item.orders) ? item.orders[0] : item.orders,
      }));

      console.log('✅ Seller orders fetched:', transformedData.length);
      return transformedData;
    },
    enabled: createRoleBasedEnabled(isAuthenticated, user?.role, ['seller', 'admin'], !!effectiveSellerId),
    ...getOrderQueryOptions<SellerOrderItem[]>(),
  });

  return {
    orderItems,
    loading,
    error: error as Error | null,
    refetch,
  };
}
