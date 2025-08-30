import { Product, CartItem, Order, OrderWithDetails } from '../../types';
import { FALLBACK_IMAGE_URL } from '../config/constants';

/**
 * Data Transformation Utilities
 * 
 * Utilities for transforming data between different formats,
 * including backend API responses, Supabase data, and frontend interfaces.
 */

/**
 * Transform backend product data to frontend Product interface
 * 
 * @param item - Raw backend product data
 * @returns Product - Transformed product for frontend use
 */
export const transformBackendProduct = (item: any): Product => {
  console.log(' [DEBUG] Transforming backend product item:', item);
  
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    stock: item.stock || 0,
    image: item.image || FALLBACK_IMAGE_URL,
    sellerId: item.seller_id,
    rating: item.rating || 0,
    createdAt: item.created_at,
  };
};

/**
 * Transform Supabase product data to frontend Product interface
 * 
 * @param item - Raw Supabase product data
 * @returns Product - Transformed product for frontend use
 */
export const transformSupabaseProduct = (item: any): Product => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    stock: Number(item.stock) || 0,
    image: item.image_url || item.image || FALLBACK_IMAGE_URL,
    sellerId: item.seller_id || item.sellerId || '',
    rating: item.rating || 0,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  };
};

/**
 * Transform frontend product data to backend format for API requests
 * 
 * @param productData - Frontend product data
 * @returns Object - Backend-formatted product data
 */
export const transformProductToBackend = (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'rating'>) => {
  return {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image: productData.image,
  };
};

/**
 * Transform frontend product updates to backend format
 * 
 * @param updates - Partial product updates
 * @returns Object - Backend-formatted update data
 */
export const transformProductUpdatesToBackend = (updates: Partial<Product>) => {
  const backendData: any = {};
  if (updates.name !== undefined) backendData.name = updates.name;
  if (updates.description !== undefined) backendData.description = updates.description;
  if (updates.price !== undefined) backendData.price = updates.price;
  if (updates.image !== undefined) backendData.image = updates.image;
  return backendData;
};

/**
 * Transform frontend product updates to Supabase format
 * 
 * @param updates - Partial product updates
 * @returns Object - Supabase-formatted update data
 */
export const transformProductUpdatesToSupabase = (updates: Partial<Product>) => {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.image !== undefined) updateData.image_url = updates.image;
  return updateData;
};

/**
 * Transform Supabase cart item data to frontend CartItem interface
 * 
 * @param item - Raw Supabase cart item with product data
 * @returns CartItem - Transformed cart item for frontend use
 */
export const transformSupabaseCartItem = (item: any): CartItem => {
  return {
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    product: {
      id: item.products.id,
      name: item.products.name,
      description: item.products.description,
      price: item.products.price,
      image: item.products.image_url || FALLBACK_IMAGE_URL,
      sellerId: item.products.seller_id,
      createdAt: item.products.created_at,
    }
  };
};

/**
 * Transform Supabase order data to frontend Order interface
 * 
 * @param data - Raw Supabase order data
 * @returns Order - Transformed order for frontend use
 */
export const transformSupabaseOrder = (data: any): Order => {
  return {
    id: data.id,
    user_id: data.user_id,
    product_id: data.product_id,
    quantity: data.quantity,
    status: data.status,
    total_amount: data.total_amount,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Transform order item data to OrderWithDetails interface
 * 
 * @param item - Order item data
 * @param order - Order data
 * @param product - Product data
 * @param user - User data
 * @returns OrderWithDetails - Transformed detailed order
 */
export const transformToOrderWithDetails = (
  item: any,
  order: any,
  product: any,
  user: any
): OrderWithDetails => {
  const mappedUser = user
    ? { id: user.id as string, email: user.email as string, role: user.role as string }
    : { id: (order?.buyer_id ?? '') as string, email: '', role: '' };

  return {
    id: order?.id || item.order_id,
    user_id: order?.buyer_id || null,
    product_id: item.product_id,
    quantity: item.quantity,
    status: order?.status || 'pending',
    total_amount: order?.total_amount || 0,
    created_at: order?.created_at || '',
    updated_at: order?.updated_at || '',
    products: product ? {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image_url || FALLBACK_IMAGE_URL,
      sellerId: product.seller_id,
      createdAt: product.created_at,
    } : {} as any,
    users: mappedUser,
  };
};

/**
 * Apply pagination to an array of items
 * 
 * @param items - Array of items to paginate
 * @param limit - Number of items per page
 * @param offset - Starting index
 * @returns Object with paginated items and total count
 */
export const applyPagination = <T>(items: T[], limit: number, offset: number) => {
  return {
    items: items.slice(offset, offset + limit),
    totalCount: items.length,
  };
};

/**
 * Sort orders by creation date (most recent first)
 * 
 * @param orders - Array of orders to sort
 * @returns Sorted array of orders
 */
export const sortOrdersByDate = <T extends { created_at: string }>(orders: T[]): T[] => {
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
