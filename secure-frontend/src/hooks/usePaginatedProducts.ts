import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/api';

interface UsePaginatedProductsResult {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  remainingCount: number;
}

interface PaginatedResponse {
  products: Product[];
  totalCount: number;
}

const PRODUCTS_PER_PAGE = 16;

export function usePaginatedProducts(): UsePaginatedProductsResult {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedResponse, Error, InfiniteData<PaginatedResponse>, string[], number>({
    queryKey: ['products-paginated'],
    queryFn: async ({ pageParam }) => {
      const result = await ProductService.getPaginated(PRODUCTS_PER_PAGE, pageParam);
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse, allPages: PaginatedResponse[]) => {
      const currentOffset = allPages.length * PRODUCTS_PER_PAGE;
      return currentOffset < lastPage.totalCount ? currentOffset : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { products, totalCount, remainingCount } = useMemo(() => {
    if (!data?.pages) {
      return {
        products: [] as Product[],
        totalCount: 0,
        remainingCount: 0,
      };
    }

    const allProducts = data.pages.flatMap(page => page.products);
    const total = data.pages[0]?.totalCount || 0;
    const remaining = Math.max(0, total - allProducts.length);

    return {
      products: allProducts,
      totalCount: total,
      remainingCount: remaining,
    };
  }, [data]);

  return {
    products,
    totalCount,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: isError ? (error as Error) : null,
    hasMore: !!hasNextPage,
    loadMore: () => fetchNextPage(),
    remainingCount,
  };
}
