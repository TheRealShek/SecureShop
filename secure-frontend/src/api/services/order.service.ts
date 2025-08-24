import { supabase } from '../../services/supabase';
import { Order, OrderWithDetails } from '../../types';
import { 
  transformSupabaseOrder,
  transformToOrderWithDetails,
  sortOrdersByDate
} from '../utils';

/**
 * Order Service
 * 
 * Handles order management operations including fetching seller orders
 * and updating order status. Uses direct Supabase queries for
 * complex joins and filtering.
 */

/**
 * Get all orders for the current seller's products
 * Fetches orders that contain products owned by the current seller
 * 
 * @returns Promise<OrderWithDetails[]> Array of orders with product and user details
 */
const getSellerOrders = async (): Promise<OrderWithDetails[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Step 1: Get seller's product IDs
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', userData.user.id);

    if (productsError) {
      throw new Error(`Failed to fetch seller products: ${productsError.message}`);
    }

    const productIds = productsData?.map(p => p.id) || [];
    
    if (productIds.length === 0) {
      return [];
    }

    // Step 2: Get order_items for seller's products
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('product_id', productIds);

    if (orderItemsError) {
      throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
    }

    if (!orderItemsData || orderItemsData.length === 0) {
      return [];
    }

    const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];

    // Step 3: Get orders with buyer details
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        total_amount,
        created_at,
        updated_at,
        users:buyer_id (
          id,
          email,
          role
        )
      `)
      .in('id', orderIds);

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    // Step 4: Get product details
    const { data: productDetailsData, error: productDetailsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productDetailsError) {
      throw new Error(`Failed to fetch product details: ${productDetailsError.message}`);
    }

    // Create lookup maps
    const ordersMap = new Map(ordersData?.map(order => [order.id, order]) || []);
    const productsMap = new Map(productDetailsData?.map(product => [product.id, product]) || []);

    // Map to OrderWithDetails format
    const orders: OrderWithDetails[] = orderItemsData.map((item: any) => {
      const order = ordersMap.get(item.order_id);
      const product = productsMap.get(item.product_id);
      const user = order ? (Array.isArray(order.users) ? order.users[0] : order.users) : null;
      
      return transformToOrderWithDetails(item, order, product, user);
    });

    // Sort by order creation date descending (most recent first)
    return sortOrdersByDate(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

/**
 * Update the status of an order
 * 
 * @param orderId - Order ID
 * @param status - New order status
 * @returns Promise<Order> The updated order
 */
const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return transformSupabaseOrder(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * OrderService - Main order service object
 */
export const OrderService = {
  getSellerOrders,
  updateOrderStatus,
};
