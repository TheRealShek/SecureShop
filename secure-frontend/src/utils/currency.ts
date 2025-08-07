/**
 * Currency utilities for formatting prices
 */

/**
 * Format a price in Indian Rupees
 * @param price - The price to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted price string with ₹ symbol
 */
export function formatPrice(price: number, showDecimals: boolean = true): string {
  if (showDecimals) {
    return `₹${price.toFixed(2)}`;
  }
  return `₹${Math.round(price)}`;
}

/**
 * Format a price with Indian number system (lakhs, crores)
 * @param price - The price to format
 * @returns Formatted price string with Indian number formatting
 */
export function formatPriceIndian(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Currency symbol for Indian Rupee
 */
export const RUPEE_SYMBOL = '₹';
