import { supabase } from '../../services/supabase';
import { CartItem } from '../../types';
import { transformSupabaseCartItem } from '../utils';

/**
 * Cart Service
 * 
 * Handles all cart-related operations including fetching cart items,
 * adding items to cart, updating quantities, and removing items.
 * Uses direct Supabase queries for optimal performance.
 */

/**
 * Get all cart items for the current user
 * 
 * @returns Promise<CartItem[]> Array of cart items with product details
 */
const getCartItems = async (): Promise<CartItem[]> => {
  try {
    // Check if user is authenticated first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session?.user) {
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
        products (
          id,
          name,
          description,
          price,
          image_url,
          seller_id,
          created_at
        )
      `)
      .eq('user_id', sessionData.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching cart items:', error);
      throw new Error(`Failed to fetch cart items: ${error.message}`);
    }

    // Transform to match CartItem interface
    return (data || []).map(transformSupabaseCartItem);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

/**
 * Add a product to the cart
 * If the item already exists, increment its quantity
 * 
 * @param productId - ID of the product to add
 * @returns Promise<CartItem> The added/updated cart item
 */
const addToCart = async (productId: string): Promise<CartItem> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', sessionData.session.user.id)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check existing cart item: ${checkError.message}`);
    }

    if (existingItem) {
      // Update existing item quantity
      return await updateCartItem(productId, existingItem.quantity + 1);
    } else {
      // Create new cart item
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: sessionData.session.user.id,
          product_id: productId,
          quantity: 1
        }])
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          products (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            created_at
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to add item to cart: ${error.message}`);
      }

      return transformSupabaseCartItem(data);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update the quantity of a cart item
 * 
 * @param productId - ID of the product to update
 * @param quantity - New quantity (must be >= 1)
 * @returns Promise<CartItem> The updated cart item
 */
const updateCartItem = async (productId: string, quantity: number): Promise<CartItem> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: quantity
      })
      .eq('user_id', sessionData.session.user.id)
      .eq('product_id', productId)
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        products (
          id,
          name,
          description,
          price,
          image_url,
          seller_id,
          created_at
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    return transformSupabaseCartItem(data);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove a product from the cart
 * 
 * @param productId - ID of the product to remove
 * @returns Promise<void>
 */
const removeCartItem = async (productId: string): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', sessionData.session.user.id)
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Failed to remove cart item: ${error.message}`);
    }
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

/**
 * Clear all items from the cart
 * 
 * @returns Promise<void>
 */
const clearCart = async (): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * CartService - Main cart service object
 */
export const CartService = {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
