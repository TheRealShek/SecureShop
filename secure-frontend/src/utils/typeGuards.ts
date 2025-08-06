import { Product } from '../types';

/**
 * Type guard to check if a value is an array of products
 */
export function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

/**
 * Type guard to check if a value is a valid product
 */
export function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).description === 'string' &&
    typeof (value as any).price === 'number' &&
    typeof (value as any).image === 'string' &&
    typeof (value as any).sellerId === 'string' &&
    typeof (value as any).createdAt === 'string'
  );
}

/**
 * Safely parse API response to ensure it's a valid product array
 */
export function safeParseProducts(data: unknown): Product[] {
  if (isProductArray(data)) {
    return data;
  }
  
  console.error('Invalid products data received:', data);
  return [];
}

/**
 * Default values for fallback scenarios
 */
export const DEFAULT_PRODUCT_VALUES = {
  EMPTY_ARRAY: [] as Product[],
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/400x400?text=No+Image',
} as const;
