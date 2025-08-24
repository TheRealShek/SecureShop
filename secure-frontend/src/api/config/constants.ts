/**
 * API Configuration Constants
 * 
 * Centralized constants for API configuration including URLs, fallback values,
 * and other configuration values used across the application.
 */

/** Base API URL for backend services */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** 
 * Fallback image URL that works reliably when product images fail to load
 * Base64 encoded SVG placeholder image
 */
export const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTQwSDIyNVYxNzBIMTc1VjE0MFpNMTUwIDEwMEgzMDBDMzEzLjgwNyAxMDAgMzI1IDExMS4xOTMgMzI1IDEyNVYyNzVDMzI1IDI4OC44MDcgMzEzLjgwNyAzMDAgMzAwIDMwMEgxMDBDODYuMTkzIDMwMCA3NSAyODguODA3IDc1IDI3NVYxMjVDNzUgMTExLjE5MyA4Ni4xOTMgMTAwIDEwMCAxMDBIMTUwWk0xMDAgMTI1VjI3NUgzMDBWMTI1SDEwMFpNMTI1IDE3MkwxNzUgMjI1TDIyNSAxNzVMMjc1IDIyNVYyNTBIMTI1VjE3MloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';

/** Default pagination limits */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Request timeout in milliseconds */
export const REQUEST_TIMEOUT = 30000;

/** Cache durations in milliseconds */
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,   // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000,   // 1 hour
} as const;
