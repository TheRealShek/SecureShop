import { supabase } from '../../services/supabase';
import { Product } from '../../types';
import { api } from '../config/axios';
import { 
  getCurrentUserRole,
  transformBackendProduct,
  transformSupabaseProduct,
  transformProductToBackend,
  transformProductUpdatesToBackend,
  applyPagination
} from '../utils';

/**
 * Product Service
 * 
 * Handles all product-related API operations including fetching, creating,
 * updating, and deleting products. Supports both backend API and direct
 * Supabase queries based on user role.
 */

/**
 * Get all products with role-based filtering
 * For sellers: Uses backend API for role-filtered products
 * For buyers: Uses direct Supabase for better performance
 * 
 * @returns Promise<Product[]> Array of products
 */
const getAll = async (): Promise<Product[]> => {
  console.log(' [DEBUG] ProductService.getAll() called');
  
  const userRole = await getCurrentUserRole();
  console.log(' [DEBUG] User role determined:', userRole);
  
  // For sellers, use backend API to get role-filtered products
  if (userRole === 'seller') {
    console.log(' [DEBUG] User is a seller, using backend API');
    
    try {
      // Check if auth token exists
      const token = localStorage.getItem('token');
      console.log(' [DEBUG] Auth token status:', {
        exists: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      
      console.log(' [DEBUG] Making request to /api/products...');
      const response = await api.get('/api/products');
      
      console.log(' [DEBUG] Backend response:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
        rawData: response.data
      });
      
      // Transform backend data to match frontend Product interface
      const products: Product[] = (response.data || []).map(transformBackendProduct);
      
      console.log(' [DEBUG] Successfully transformed products:', {
        count: products.length,
        products: products.map(p => ({ id: p.id, name: p.name, sellerId: p.sellerId }))
      });
      
      return products;
    } catch (error) {
      console.error(' [DEBUG] Error fetching seller products from backend:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        responseData: (error as any)?.response?.data
      });
      throw error;
    }
  }
  
  // For buyers and other roles, use direct Supabase for better performance
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Transform Supabase data to match our Product interface
    const products: Product[] = (data || []).map(transformSupabaseProduct);

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get paginated products with role-based filtering
 * 
 * @param limit - Number of products per page
 * @param offset - Starting index for pagination
 * @returns Promise<{products: Product[], totalCount: number}> Paginated products
 */
const getPaginated = async (limit: number, offset: number): Promise<{ products: Product[]; totalCount: number }> => {
  const userRole = await getCurrentUserRole();
  
  // For sellers, use backend API to get role-filtered products
  if (userRole === 'seller') {
    try {
      const response = await api.get('/api/products');
      
      // Transform backend data to match frontend Product interface
      const allProducts: Product[] = (response.data || []).map(transformBackendProduct);
      
      // Apply pagination
      const { items: products, totalCount } = applyPagination(allProducts, limit, offset);
      
      return { products, totalCount };
    } catch (error) {
      console.error('Error fetching paginated seller products from backend:', error);
      throw error;
    }
  }
  
  // For buyers, use direct Supabase with pagination for better performance
  try {
    // First, get the total count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Supabase error counting products:', countError);
      throw new Error(`Failed to count products: ${countError.message}`);
    }

    // Then fetch the paginated products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Transform Supabase data to match our Product interface
    const products: Product[] = (data || []).map(transformSupabaseProduct);

    return {
      products,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * 
 * @param id - Product ID
 * @returns Promise<Product> The requested product
 */
const getById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/api/products/${id}`);
    
    // Transform backend data to match frontend Product interface
    return transformBackendProduct(response.data);
  } catch (error) {
    console.error('Error fetching product by ID from backend:', error);
    throw error;
  }
};

/**
 * Create a new product
 * 
 * @param productData - Product data without ID, createdAt, and sellerId
 * @returns Promise<Product> The created product
 */
const create = async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'rating'>): Promise<Product> => {
  try {
    // Transform frontend data to backend format
    const backendData = transformProductToBackend(productData);
    
    const response = await api.post('/api/products', backendData);
    
    // Transform backend response to frontend format
    return transformBackendProduct(response.data);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * 
 * @param id - Product ID
 * @param updates - Partial product updates
 * @returns Promise<Product> The updated product
 */
const update = async (id: string, updates: Partial<Product>): Promise<Product> => {
  try {
    // Transform frontend data to backend format
    const backendData = transformProductUpdatesToBackend(updates);

    const response = await api.put(`/api/products/${id}`, backendData);
    
    // Transform backend response to frontend format
    return transformBackendProduct(response.data);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 * 
 * @param id - Product ID
 * @returns Promise<void>
 */
const remove = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * ProductService - Main product service object
 */
export const ProductService = {
  getAll,
  getPaginated,
  getById,
  create,
  update,
  delete: remove, // Using 'remove' internally since 'delete' is a reserved word
};
