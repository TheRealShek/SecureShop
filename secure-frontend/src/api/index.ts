/**
 * Main API Module
 * 
 * Centralized barrel export for the entire API module providing
 * clean imports for services, utilities, and configuration.
 * Maintains backward compatibility with existing imports.
 */

// Export all services for backward compatibility
export * from './services';

// Export utilities for advanced usage
export * from './utils';

// Export configuration for advanced setup
export * from './config';

// Main API instance for direct use
export { api } from './config/axios';

// Legacy imports support - these maintain the exact same interface
import { ProductService, CartService, UserService, SellerService, OrderService } from './services';

// Named exports for the services (maintains existing import patterns)
export {
  ProductService,
  CartService, 
  UserService,
  SellerService,
  OrderService,
  // Legacy alias
  SellerService as SellerProductService
};
