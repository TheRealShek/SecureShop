import { supabase } from '../../services/supabase';
import { Product } from '../../types';
import { 
  transformSupabaseProduct,
  transformProductUpdatesToSupabase
} from '../utils';

/**
 * Seller Service
 * 
 * Handles seller-specific product operations including creating, updating,
 * and deleting products. Uses direct Supabase queries with seller-specific
 * filtering for security and performance.
 */

/**
 * Get all products for the current seller
 * Direct Supabase query filtered by seller_id
 * 
 * @returns Promise<Product[]> Array of products owned by the current seller
 */
const getSellerProducts = async (): Promise<Product[]> => {
  console.log('🏪 [DEBUG] SellerProductService.getSellerProducts() called - Direct Supabase');
  
  try {
    // Get current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ [DEBUG] No authenticated user found:', userError);
      throw new Error('User not authenticated');
    }
    
    const userId = userData.user.id;
    console.log('🔍 [DEBUG] Fetching products for seller ID:', userId);
    
    // Query products table directly where seller_id matches current user
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('❌ [DEBUG] Supabase query error:', productsError);
      throw new Error(`Failed to fetch seller products: ${productsError.message}`);
    }
    
    console.log('📦 [DEBUG] Raw Supabase products data:', productsData);
    
    // Transform Supabase data to match our Product interface
    const products: Product[] = (productsData || []).map((item, index) => {
      console.log(`🔄 [DEBUG] Transforming product ${index}:`, item);
      
      const mappedProduct = transformSupabaseProduct(item);
      
      console.log(`✅ [DEBUG] Mapped product ${index}:`, mappedProduct);
      return mappedProduct;
    });
    
    console.log('✅ [DEBUG] Final seller products result (Direct Supabase):', {
      count: products.length,
      sellerQuery: `seller_id = ${userId}`,
      products: products.map(p => ({ id: p.id, name: p.name, sellerId: p.sellerId, price: p.price }))
    });
    
    return products;
  } catch (error) {
    console.error('❌ [DEBUG] Error in SellerProductService.getSellerProducts (Direct Supabase):', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

/**
 * Create a new product for the current seller
 * Automatically assigns the current user as the seller
 * 
 * @param productData - Product data without ID, createdAt, and sellerId
 * @returns Promise<Product> The created product
 */
const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product> => {
  console.log('🏪 [DEBUG] Creating product via Supabase directly:', productData);
  
  try {
    // Get current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ [DEBUG] No authenticated user for product creation:', userError);
      throw new Error('User not authenticated');
    }
    
    const sellerId = userData.user.id;
    console.log('🔍 [DEBUG] Creating product for seller ID:', sellerId);
    
    // Insert into products table with seller_id
    const { data: insertedData, error: insertError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image,
        seller_id: sellerId,
        stock: 10 // Default stock - you can make this configurable
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ [DEBUG] Supabase insert error:', insertError);
      throw new Error(`Failed to create product: ${insertError.message}`);
    }
    
    console.log('✅ [DEBUG] Product created in Supabase:', insertedData);
    
    // Transform response to match frontend Product interface
    const product = transformSupabaseProduct(insertedData);
    
    console.log('✅ [DEBUG] Transformed created product:', product);
    return product;
  } catch (error) {
    console.error('❌ [DEBUG] Error creating product via Supabase:', error);
    throw error;
  }
};

/**
 * Update a product owned by the current seller
 * Security: Only updates if the product belongs to the current seller
 * 
 * @param id - Product ID
 * @param updates - Partial product updates
 * @returns Promise<Product> The updated product
 */
const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  console.log('🏪 [DEBUG] Updating product via Supabase:', { id, updates });
  
  try {
    // Get current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    const sellerId = userData.user.id;
    
    // Prepare update data - map frontend fields to database fields
    const updateData = transformProductUpdatesToSupabase(updates);
    
    console.log('🔄 [DEBUG] Supabase update data:', updateData);
    
    // Update the product, but only if it belongs to the current seller
    const { data: updatedData, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('seller_id', sellerId) // Security: only update if seller owns the product
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ [DEBUG] Supabase update error:', updateError);
      throw new Error(`Failed to update product: ${updateError.message}`);
    }
    
    if (!updatedData) {
      throw new Error('Product not found or you do not have permission to update it');
    }
    
    console.log('✅ [DEBUG] Product updated in Supabase:', updatedData);
    
    // Transform response to match frontend Product interface
    return transformSupabaseProduct(updatedData);
  } catch (error) {
    console.error('❌ [DEBUG] Error updating product via Supabase:', error);
    throw error;
  }
};

/**
 * Delete a product owned by the current seller
 * Security: Only deletes if the product belongs to the current seller
 * 
 * @param id - Product ID
 * @returns Promise<void>
 */
const deleteProduct = async (id: string): Promise<void> => {
  console.log('🏪 [DEBUG] Deleting product via Supabase:', id);
  
  try {
    // Get current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    const sellerId = userData.user.id;
    
    // Delete the product, but only if it belongs to the current seller
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', sellerId); // Security: only delete if seller owns the product
    
    if (deleteError) {
      console.error('❌ [DEBUG] Supabase delete error:', deleteError);
      throw new Error(`Failed to delete product: ${deleteError.message}`);
    }
    
    console.log('✅ [DEBUG] Product deleted from Supabase:', id);
  } catch (error) {
    console.error('❌ [DEBUG] Error deleting product via Supabase:', error);
    throw error;
  }
};

/**
 * SellerService - Main seller service object
 */
export const SellerService = {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
