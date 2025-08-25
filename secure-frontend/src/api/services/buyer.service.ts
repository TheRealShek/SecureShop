import { supabase } from '../../services/supabase';
import { CartItem, OrderWithDetails } from '../../types';

/**
 * Buyer Service
 * 
 * Handles buyer-specific operations including cart management and order fetching.
 * Uses Supabase with the following relationships:
 * - orders = parent record (id, buyer_id, status, created_at)
 * - order_items = detailed breakdown linked to orders.id (product_id, quantity, price_at_purchase)  
 * - cart_items = staging area before an order (user_id, product_id, quantity)
 * - products = product details (id, name, description, price, image_url, seller_id, stock, created_at)
 * - users = user information (id, email, role)
 */

/**
 * 1. Fetch a buyer's active cart (cart_items joined with products)
 * 
 * @returns Promise<CartItem[]> Array of cart items with product details
 */
const getBuyerCart = async (): Promise<CartItem[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        products!cart_items_product_id_fkey (
          id,
          name,
          description,
          price,
          image_url,
          seller_id,
          stock,
          created_at
        )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cart items: ${error.message}`);
    }

    // Transform database format to frontend CartItem interface
    return (data || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      product: {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        price: item.products.price,
        image: item.products.image_url,
        sellerId: item.products.seller_id,
        stock: item.products.stock,
        createdAt: item.products.created_at
      }
    }));
  } catch (error) {
    console.error('Error fetching buyer cart:', error);
    throw error;
  }
};

/**
 * 2. Fetch all orders for a buyer (orders joined with order_items)
 * 
 * @returns Promise<OrderWithDetails[]> Array of orders with order items and product details
 */
const getBuyerOrders = async (): Promise<OrderWithDetails[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        created_at,
        order_items!order_items_order_id_fkey (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products!order_items_product_id_fkey (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            created_at
          )
        )
      `)
      .eq('buyer_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`Failed to fetch buyer orders: ${ordersError.message}`);
    }

    // Transform database format to frontend OrderWithDetails interface
    return (ordersData || []).map((order: any) => {
      // For backward compatibility, we'll use the first order item's product details
      // In a real app, you might want to handle multiple products differently
      const firstOrderItem = order.order_items[0];
      
      // Calculate total amount from order items
      const totalAmount = order.order_items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.price_at_purchase), 0);
      
      return {
        id: order.id,
        user_id: order.buyer_id,
        product_id: firstOrderItem?.product_id || '',
        quantity: firstOrderItem?.quantity || 0,
        status: order.status as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
        total_amount: totalAmount,
        created_at: order.created_at,
        updated_at: order.created_at, // Use created_at since updated_at doesn't exist
        products: firstOrderItem ? {
          id: firstOrderItem.products.id,
          name: firstOrderItem.products.name,
          description: firstOrderItem.products.description,
          price: firstOrderItem.products.price,
          image: firstOrderItem.products.image_url,
          sellerId: firstOrderItem.products.seller_id,
          createdAt: firstOrderItem.products.created_at
        } : {
          id: '',
          name: 'Unknown Product',
          description: '',
          price: 0,
          image: '',
          sellerId: '',
          createdAt: ''
        },
        users: {
          id: order.buyer_id,
          email: userData.user.email || '',
          role: 'buyer'
        },
        // Add order items for full details
        orderItems: order.order_items.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price_at_purchase,
          total_price: item.quantity * item.price_at_purchase,
          created_at: order.created_at, // Use order created_at since order_items doesn't have created_at
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.products.price,
            image: item.products.image_url,
            sellerId: item.products.seller_id,
            createdAt: item.products.created_at
          }
        }))
      } as OrderWithDetails & { orderItems: any[] };
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    throw error;
  }
};

/**
 * 3. Fetch a single order with full details (orders → order_items → products → buyer)
 * 
 * @param orderId - The ID of the order to fetch
 * @returns Promise<OrderWithDetails | null> Order with complete details or null if not found
 */
const getBuyerOrderDetails = async (orderId: string): Promise<OrderWithDetails | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        created_at,
        order_items!order_items_order_id_fkey (
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          products!order_items_product_id_fkey (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            stock,
            created_at
          )
        )
      `)
      .eq('id', orderId)
      .eq('buyer_id', userData.user.id) // Ensure user can only access their own orders
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null; // Order not found
      }
      throw new Error(`Failed to fetch order details: ${orderError.message}`);
    }

    if (!orderData) {
      return null;
    }

    // Transform database format to frontend OrderWithDetails interface
    const order = orderData as any;

    const firstOrderItem = order.order_items[0];
    
    // Calculate total amount from order items
    const totalAmount = order.order_items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.price_at_purchase), 0);

    return {
      id: order.id,
      user_id: order.buyer_id,
      product_id: firstOrderItem?.product_id || '',
      quantity: firstOrderItem?.quantity || 0,
      status: order.status as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
      total_amount: totalAmount,
      created_at: order.created_at,
      updated_at: order.created_at, // Use created_at since updated_at doesn't exist
      products: firstOrderItem ? {
        id: firstOrderItem.products.id,
        name: firstOrderItem.products.name,
        description: firstOrderItem.products.description,
        price: firstOrderItem.products.price,
        image: firstOrderItem.products.image_url,
        sellerId: firstOrderItem.products.seller_id,
        createdAt: firstOrderItem.products.created_at
      } : {
        id: '',
        name: 'Unknown Product',
        description: '',
        price: 0,
        image: '',
        sellerId: '',
        createdAt: ''
      },
      users: {
        id: order.buyer_id,
        email: userData.user.email || '',
        role: 'buyer'
      },
      // Add detailed order items with seller information
      orderItems: order.order_items.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price_at_purchase,
        total_price: item.quantity * item.price_at_purchase,
        created_at: order.created_at, // Use order created_at since order_items doesn't have created_at
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          image: item.products.image_url,
          sellerId: item.products.seller_id,
          createdAt: item.products.created_at
        }
      }))
    } as OrderWithDetails & { 
      orderItems: any[];
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

/**
 * Get cart item count for a buyer
 * 
 * @returns Promise<number> Total number of items in cart
 */
const getBuyerCartCount = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userData.user.id);

    if (error) {
      throw new Error(`Failed to fetch cart count: ${error.message}`);
    }

    return (data || []).reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return 0;
  }
};

export const BuyerService = {
  getBuyerCart,
  getBuyerOrders,
  getBuyerOrderDetails,
  getBuyerCartCount
};
