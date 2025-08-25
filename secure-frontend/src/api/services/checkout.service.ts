import { supabase } from '../../services/supabase';
import { CartItem, OrderWithDetails } from '../../types';

/**
 * Checkout Service
 * 
 * Handles the complete purchase flow: converting cart items to orders,
 * creating order items, clearing cart, and managing the checkout process.
 */

interface CheckoutResult {
  success: boolean;
  order?: OrderWithDetails;
  error?: string;
}

interface CreateOrderData {
  shipping_address?: string;
  payment_method?: string;
}

/**
 * Convert cart items to a completed order
 * This is the main checkout function that handles the entire purchase flow
 * 
 * @param checkoutData - Additional order information (shipping, payment)
 * @returns Promise<CheckoutResult> Result of the checkout process
 */
const checkout = async (checkoutData: CreateOrderData = {}): Promise<CheckoutResult> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Step 1: Get current cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products!cart_items_product_id_fkey (
          id,
          name,
          description,
          price,
          seller_id,
          stock
        )
      `)
      .eq('user_id', userData.user.id);

    if (cartError) {
      throw new Error(`Failed to fetch cart items: ${cartError.message}`);
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Step 2: Validate stock availability
    for (const item of cartItems) {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      if (!product) {
        throw new Error(`Product not found for cart item ${item.id}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    // Step 3: Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return total + (product.price * item.quantity);
    }, 0);

    // Step 4: Create the order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: userData.user.id,
        total_amount: totalAmount,
        shipping_address: checkoutData.shipping_address || null,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // Step 5: Create order items
    const orderItemsToInsert = cartItems.map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity,
        seller_id: product.seller_id // This will be set by trigger if you applied the schema enhancement
      };
    });

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (orderItemsError) {
      // Rollback: Delete the order if order items creation fails
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw new Error(`Failed to create order items: ${orderItemsError.message}`);
    }

    // Step 6: Update product stock
    const stockUpdates = cartItems.map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return supabase
        .from('products')
        .update({ 
          stock: product.stock - item.quantity 
        })
        .eq('id', item.product_id);
    });

    const stockResults = await Promise.all(stockUpdates);
    const stockErrors = stockResults.filter(result => result.error);
    
    if (stockErrors.length > 0) {
      console.warn('Some stock updates failed:', stockErrors);
      // Note: In a production system, you might want to handle this more carefully
    }

    // Step 7: Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userData.user.id);

    if (clearCartError) {
      console.warn('Failed to clear cart after successful order:', clearCartError);
      // Don't fail the entire checkout for this
    }

    // Step 8: Fetch the complete order with details
    const { data: completeOrder, error: fetchOrderError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        total_amount,
        status,
        shipping_address,
        order_number,
        created_at,
        order_items!order_items_order_id_fkey (
          id,
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products!order_items_product_id_fkey (
            id,
            name,
            description,
            price,
            image_url,
            seller_id
          )
        )
      `)
      .eq('id', newOrder.id)
      .single();

    if (fetchOrderError) {
      console.warn('Order created but failed to fetch details:', fetchOrderError);
    }

    return {
      success: true,
      order: completeOrder ? transformToOrderWithDetails(completeOrder) : undefined
    };

  } catch (error) {
    console.error('Checkout failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get checkout summary (cart total, items, etc.)
 * 
 * @returns Promise<CheckoutSummary> Summary of items to be purchased
 */
interface CheckoutSummary {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  canCheckout: boolean;
  errors: string[];
}

const getCheckoutSummary = async (): Promise<CheckoutSummary> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
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
      .eq('user_id', userData.user.id);

    if (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    const items: CartItem[] = (cartItems || []).map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image_url,
          sellerId: product.seller_id,
          stock: product.stock,
          createdAt: product.created_at
        }
      };
    });

    const totalAmount = items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );

    const errors: string[] = [];
    let canCheckout = true;

    // Validate each item
    items.forEach(item => {
      if (item.product.stock && item.product.stock < item.quantity) {
        errors.push(`${item.product.name}: Only ${item.product.stock} available, but ${item.quantity} in cart`);
        canCheckout = false;
      }
    });

    if (items.length === 0) {
      errors.push('Cart is empty');
      canCheckout = false;
    }

    return {
      items,
      totalAmount,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      canCheckout,
      errors
    };

  } catch (error) {
    return {
      items: [],
      totalAmount: 0,
      itemCount: 0,
      canCheckout: false,
      errors: [error instanceof Error ? error.message : 'Failed to get checkout summary']
    };
  }
};

// Helper function to transform order data (you might need to implement this)
const transformToOrderWithDetails = (orderData: any): OrderWithDetails => {
  // Implementation depends on your OrderWithDetails interface
  // This is a basic transformation - adjust based on your exact interface
  return {
    id: orderData.id,
    user_id: orderData.buyer_id,
    product_id: orderData.order_items[0]?.product_id || '',
    quantity: orderData.order_items[0]?.quantity || 0,
    status: orderData.status,
    total_amount: orderData.total_amount,
    created_at: orderData.created_at,
    updated_at: orderData.created_at,
    products: orderData.order_items[0] ? {
      id: orderData.order_items[0].products.id,
      name: orderData.order_items[0].products.name,
      description: orderData.order_items[0].products.description,
      price: orderData.order_items[0].products.price,
      image: orderData.order_items[0].products.image_url,
      sellerId: orderData.order_items[0].products.seller_id,
      createdAt: orderData.created_at
    } : {} as any,
    users: {
      id: orderData.buyer_id,
      email: '', // You might want to include this in the query
      role: 'buyer'
    }
  };
};

export const CheckoutService = {
  checkout,
  getCheckoutSummary
};

export type { CheckoutResult, CheckoutSummary, CreateOrderData };
