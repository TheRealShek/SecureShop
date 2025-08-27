import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, LightweightProduct, ProductExtendedFields } from '../types';
import { LightweightProductService } from '../services/lightweightProductService';
import { ProductService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface UseProgressiveProductsResult {
  products: Product[];
  isInitialLoading: boolean;
  isBackgroundLoading: boolean;
  isFullyLoaded: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => void;
}

const BACKGROUND_LOAD_DELAY = 2500; // 2.5 seconds delay for background loading

/**
 * Progressive product loading hook for buyers
 * Phase 1: Load lightweight products (fast) from cache or API
 * Phase 2: Load extended fields in background and merge
 */
export function useProgressiveProducts(): UseProgressiveProductsResult {
  const { role } = useAuth();
  const [lightweightProducts, setLightweightProducts] = useState<LightweightProduct[]>([]);
  const [extendedFields, setExtendedFields] = useState<Record<string, ProductExtendedFields>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // For non-buyers, fall back to regular product loading
  const fallbackQuery = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
    enabled: role !== 'buyer',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Phase 1: Load lightweight products (immediate)
  const loadLightweightProducts = useCallback(async () => {
    if (role !== 'buyer') return;
    
    try {
      setIsInitialLoading(true);
      setError(null);
      
      // Try to get cached data first
      const cachedProducts = LightweightProductService.getCachedLightweightProducts();
      
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('📦 [DEBUG] Using cached lightweight products:', cachedProducts.length);
        setLightweightProducts(cachedProducts);
        setIsInitialLoading(false);
        
        // Still fetch fresh data in background but don't show loading
        setTimeout(async () => {
          try {
            const freshProducts = await LightweightProductService.getLightweightProducts();
            setLightweightProducts(freshProducts);
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        }, 1000);
      } else {
        // No cache, fetch fresh data
        console.log('🚀 [DEBUG] No cache, fetching fresh lightweight products...');
        const products = await LightweightProductService.getLightweightProducts();
        setLightweightProducts(products);
        setIsInitialLoading(false);
      }
    } catch (error) {
      console.error('Error loading lightweight products:', error);
      setError(error as Error);
      setIsInitialLoading(false);
    }
  }, [role]);

  // Phase 2: Load extended fields in background
  const loadExtendedFields = useCallback(async () => {
    if (role !== 'buyer' || lightweightProducts.length === 0) return;
    
    try {
      setIsBackgroundLoading(true);
      
      const productIds = lightweightProducts.map(p => p.id);
      const fields = await LightweightProductService.getProductExtendedFields(productIds);
      
      setExtendedFields(fields);
      setIsFullyLoaded(true);
      setIsBackgroundLoading(false);
    } catch (error) {
      console.error('Error loading extended product fields:', error);
      setIsBackgroundLoading(false);
      // Don't set error here as this is background loading
    }
  }, [role, lightweightProducts]);

  // Initial load
  useEffect(() => {
    if (role === 'buyer') {
      loadLightweightProducts();
    }
  }, [loadLightweightProducts, role]);

  // Background load with delay
  useEffect(() => {
    if (role === 'buyer' && lightweightProducts.length > 0 && !isFullyLoaded) {
      const timer = setTimeout(() => {
        loadExtendedFields();
      }, BACKGROUND_LOAD_DELAY);

      return () => clearTimeout(timer);
    }
  }, [lightweightProducts, loadExtendedFields, role, isFullyLoaded]);

  // Merge data for final products
  const products = role === 'buyer' 
    ? LightweightProductService.mergeProductData(lightweightProducts, extendedFields)
    : (fallbackQuery.data || []);

  const refetch = useCallback(() => {
    if (role === 'buyer') {
      // Clear cache and reload
      LightweightProductService.clearCache();
      setExtendedFields({});
      setIsFullyLoaded(false);
      loadLightweightProducts();
    } else {
      fallbackQuery.refetch();
    }
  }, [role, loadLightweightProducts, fallbackQuery]);

  // For non-buyers, return fallback query results
  if (role !== 'buyer') {
    return {
      products: fallbackQuery.data || [],
      isInitialLoading: fallbackQuery.isLoading,
      isBackgroundLoading: false,
      isFullyLoaded: true,
      error: fallbackQuery.error,
      isEmpty: (fallbackQuery.data || []).length === 0,
      refetch,
    };
  }

  return {
    products,
    isInitialLoading,
    isBackgroundLoading,
    isFullyLoaded,
    error,
    isEmpty: products.length === 0,
    refetch,
  };
}
