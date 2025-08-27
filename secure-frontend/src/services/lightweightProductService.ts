import { supabase } from './supabase';
import { LightweightProduct, ProductExtendedFields, Product } from '../types';

const CACHE_KEY = 'secureshop_lightweight_products';
const CACHE_EXPIRY_KEY = 'secureshop_lightweight_products_expiry';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

/**
 * Lightweight Product Service for fast initial loading
 * Implements progressive loading strategy for buyer-side performance
 */
export class LightweightProductService {
  /**
   * Get cached lightweight products from localStorage
   */
  static getCachedLightweightProducts(): LightweightProduct[] | null {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const expiryTime = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (!cachedData || !expiryTime) {
        return null;
      }
      
      // Check if cache is expired
      if (Date.now() > parseInt(expiryTime)) {
        this.clearCache();
        return null;
      }
      
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cached products:', error);
      this.clearCache();
      return null;
    }
  }
  
  /**
   * Cache lightweight products in localStorage
   */
  static cacheLightweightProducts(products: LightweightProduct[]): void {
    try {
      const expiryTime = Date.now() + CACHE_DURATION;
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }
  
  /**
   * Clear cached products
   */
  static clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  }
  
  /**
   * Fetch lightweight products (fast loading fields only)
   */
  static async getLightweightProducts(): Promise<LightweightProduct[]> {
    console.log('🚀 [DEBUG] Fetching lightweight products for fast loading...');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, rating')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching lightweight products:', error);
        throw new Error(`Failed to fetch lightweight products: ${error.message}`);
      }

      // Transform data to lightweight product format
      const lightweightProducts: LightweightProduct[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url || '',
        rating: item.rating || 5.0,
      }));

      console.log('✅ [DEBUG] Lightweight products loaded:', lightweightProducts.length);
      
      // Cache the results
      this.cacheLightweightProducts(lightweightProducts);
      
      return lightweightProducts;
    } catch (error) {
      console.error('Error fetching lightweight products:', error);
      throw error;
    }
  }
  
  /**
   * Fetch extended product fields for background loading
   */
  static async getProductExtendedFields(productIds: string[]): Promise<Record<string, ProductExtendedFields>> {
    console.log('🔄 [DEBUG] Fetching extended product fields in background...', productIds.length);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, description, stock, created_at, seller_id')
        .in('id', productIds);

      if (error) {
        console.error('Supabase error fetching extended product fields:', error);
        throw new Error(`Failed to fetch extended product fields: ${error.message}`);
      }

      // Transform data to extended fields format
      const extendedFields: Record<string, ProductExtendedFields> = {};
      
      (data || []).forEach(item => {
        extendedFields[item.id] = {
          description: item.description || '',
          stock: Number(item.stock) || 0,
          createdAt: item.created_at || new Date().toISOString(),
          sellerId: item.seller_id || '',
        };
      });

      console.log('✅ [DEBUG] Extended product fields loaded for', Object.keys(extendedFields).length, 'products');
      
      return extendedFields;
    } catch (error) {
      console.error('Error fetching extended product fields:', error);
      throw error;
    }
  }
  
  /**
   * Merge lightweight products with extended fields to create full products
   */
  static mergeProductData(
    lightweightProducts: LightweightProduct[],
    extendedFields: Record<string, ProductExtendedFields>
  ): Product[] {
    return lightweightProducts.map(lightweight => {
      const extended = extendedFields[lightweight.id];
      
      return {
        id: lightweight.id,
        name: lightweight.name,
        price: lightweight.price,
        image: lightweight.image_url,
        image_url: lightweight.image_url,
        rating: lightweight.rating,
        // Extended fields (may be empty if not yet loaded)
        description: extended?.description || '',
        stock: extended?.stock || 0,
        createdAt: extended?.createdAt || new Date().toISOString(),
        sellerId: extended?.sellerId || '',
      };
    });
  }
}
