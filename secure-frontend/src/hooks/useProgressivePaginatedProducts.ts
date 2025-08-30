import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, LightweightProduct, ProductExtendedFields } from '../types';
import { LightweightProductService } from '../services/lightweightProductService';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedProducts } from './usePaginatedProducts';

interface UseProgressivePaginatedProductsResult {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isBackgroundLoading: boolean;
  isFullyLoaded: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  remainingCount: number;
  isEmpty: boolean;
  refetch: () => void;
}

const BACKGROUND_LOAD_DELAY = 2500; // 2.5 seconds delay for background loading
const PRODUCTS_PER_PAGE = 16;

/**
 * Progressive paginated product loading hook for buyers
 * Combines fast initial loading with pagination functionality
 */
export function useProgressivePaginatedProducts(): UseProgressivePaginatedProductsResult {
  const { role } = useAuth();
  const [lightweightProducts, setLightweightProducts] = useState<LightweightProduct[]>([]);
  const [extendedFields, setExtendedFields] = useState<Record<string, ProductExtendedFields>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // For non-buyers, fall back to regular paginated loading
  const fallbackQuery = usePaginatedProducts();

  // Phase 1: Load lightweight products (immediate)
  const loadLightweightProducts = useCallback(async () => {
    if (role !== 'buyer') return;
    
    try {
      setIsInitialLoading(true);
      setError(null);
      
      // Try to get cached data first
      const cachedProducts = LightweightProductService.getCachedLightweightProducts();
      
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(' [DEBUG] Using cached lightweight products:', cachedProducts.length);
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
        console.log(' [DEBUG] No cache, fetching fresh lightweight products...');
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
  const loadExtendedFields = useCallback(async (productIds: string[]) => {
    if (role !== 'buyer' || productIds.length === 0) return;
    
    try {
      setIsBackgroundLoading(true);
      
      const fields = await LightweightProductService.getProductExtendedFields(productIds);
      
      setExtendedFields(prev => ({ ...prev, ...fields }));
      setIsBackgroundLoading(false);
      
      // Check if all loaded products have extended fields
      const loadedCount = Object.keys({ ...extendedFields, ...fields }).length;
      const totalDisplayed = Math.min((currentPage + 1) * PRODUCTS_PER_PAGE, lightweightProducts.length);
      
      if (loadedCount >= totalDisplayed) {
        setIsFullyLoaded(true);
      }
    } catch (error) {
      console.error('Error loading extended product fields:', error);
      setIsBackgroundLoading(false);
    }
  }, [role, extendedFields, currentPage, lightweightProducts.length]);

  // Initial load
  useEffect(() => {
    if (role === 'buyer') {
      loadLightweightProducts();
    }
  }, [loadLightweightProducts, role]);

  // Background load with delay for currently displayed products
  useEffect(() => {
    if (role === 'buyer' && lightweightProducts.length > 0) {
      const displayedProducts = lightweightProducts.slice(0, (currentPage + 1) * PRODUCTS_PER_PAGE);
      const productIdsNeedingExtendedData = displayedProducts
        .filter(p => !extendedFields[p.id])
        .map(p => p.id);

      if (productIdsNeedingExtendedData.length > 0) {
        const timer = setTimeout(() => {
          loadExtendedFields(productIdsNeedingExtendedData);
        }, BACKGROUND_LOAD_DELAY);

        return () => clearTimeout(timer);
      }
    }
  }, [lightweightProducts, currentPage, extendedFields, loadExtendedFields, role]);

  // Paginated products for current page
  const paginatedLightweightProducts = useMemo(() => {
    if (role !== 'buyer') return [];
    return lightweightProducts.slice(0, (currentPage + 1) * PRODUCTS_PER_PAGE);
  }, [lightweightProducts, currentPage, role]);

  // Merge data for final products
  const products = role === 'buyer' 
    ? LightweightProductService.mergeProductData(paginatedLightweightProducts, extendedFields)
    : (fallbackQuery.products || []);

  const loadMore = useCallback(() => {
    if (role === 'buyer') {
      const maxPages = Math.ceil(lightweightProducts.length / PRODUCTS_PER_PAGE);
      if (currentPage + 1 < maxPages) {
        setCurrentPage(prev => prev + 1);
      }
    } else {
      fallbackQuery.loadMore();
    }
  }, [role, currentPage, lightweightProducts.length, fallbackQuery]);

  const refetch = useCallback(() => {
    if (role === 'buyer') {
      // Clear cache and reload
      LightweightProductService.clearCache();
      setExtendedFields({});
      setIsFullyLoaded(false);
      setCurrentPage(0);
      loadLightweightProducts();
    } else {
      // Fallback doesn't have refetch, but we can reset the query
      window.location.reload();
    }
  }, [role, loadLightweightProducts]);

  // Calculate pagination state for buyers
  const totalCount = role === 'buyer' ? lightweightProducts.length : fallbackQuery.totalCount;
  const displayedCount = role === 'buyer' ? paginatedLightweightProducts.length : products.length;
  const hasMore = role === 'buyer' 
    ? displayedCount < lightweightProducts.length
    : fallbackQuery.hasMore;
  const remainingCount = Math.max(0, totalCount - displayedCount);

  // For non-buyers, return fallback query results
  if (role !== 'buyer') {
    return {
      ...fallbackQuery,
      isBackgroundLoading: false,
      isFullyLoaded: true,
      isEmpty: (fallbackQuery.products || []).length === 0,
      refetch,
    };
  }

  return {
    products,
    totalCount,
    isLoading: isInitialLoading,
    isLoadingMore: false, // We don't show loading more for progressive loading
    isBackgroundLoading,
    isFullyLoaded,
    error,
    hasMore,
    loadMore,
    remainingCount,
    isEmpty: products.length === 0,
    refetch,
  };
}
