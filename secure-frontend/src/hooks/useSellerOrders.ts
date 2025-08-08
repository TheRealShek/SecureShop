import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSellerOrders(sellerId: string): UseSellerOrdersReturn {
  const [orderItems, setOrderItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError(null);

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
        .eq('products.seller_id', sellerId)
        .order('orders(created_at)', { ascending: false });

      if (error) {
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

      setOrderItems(transformedData);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchSellerOrders();
    }
  }, [sellerId]);

  return {
    orderItems,
    loading,
    error,
    refetch: fetchSellerOrders,
  };
}
