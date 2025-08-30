/**
 * Frontend Input Sanitization Utilities
 * Provides comprehensive input sanitization for user inputs to prevent XSS and other attacks
 */

export interface SanitizationOptions {
  trimWhitespace?: boolean;
  escapeHTML?: boolean;
  removeNewlines?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
  preserveSpaces?: boolean;
  convertToLowercase?: boolean;
}

export const DefaultTextOptions: SanitizationOptions = {
  trimWhitespace: true,
  escapeHTML: true,
  removeNewlines: false,
  maxLength: 1000,
  preserveSpaces: true,
  convertToLowercase: false,
};

export const DefaultDescriptionOptions: SanitizationOptions = {
  trimWhitespace: true,
  escapeHTML: true,
  removeNewlines: false,
  maxLength: 5000,
  preserveSpaces: true,
  convertToLowercase: false,
};

export const DefaultEmailOptions: SanitizationOptions = {
  trimWhitespace: true,
  escapeHTML: true,
  removeNewlines: true,
  maxLength: 254, // RFC 5321 email length limit
  preserveSpaces: false,
  convertToLowercase: true,
};

export const DefaultSearchOptions: SanitizationOptions = {
  trimWhitespace: true,
  escapeHTML: true,
  removeNewlines: true,
  maxLength: 200,
  preserveSpaces: true,
  convertToLowercase: false,
};

/**
 * HTML entity escaping map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHTML(text: string): string {
  return text.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Remove control characters except allowed ones
 */
export function removeControlCharacters(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize user input according to the provided options
 */
export function sanitizeInput(input: string, options: SanitizationOptions = DefaultTextOptions): string {
  if (typeof input !== 'string') {
    return '';
  }

  let result = input;

  // Remove control characters first
  result = removeControlCharacters(result);

  // Trim whitespace if requested
  if (options.trimWhitespace) {
    result = result.trim();
  }

  // Convert to lowercase if requested
  if (options.convertToLowercase) {
    result = result.toLowerCase();
  }

  // Remove or normalize newlines
  if (options.removeNewlines) {
    result = result.replace(/[\r\n\t]/g, ' ');
  }

  // Normalize multiple spaces to single space if not preserving spaces
  if (!options.preserveSpaces) {
    result = result.replace(/\s+/g, ' ');
  }

  // Apply allowed characters filter if specified
  if (options.allowedChars) {
    result = result.split('').filter(char => options.allowedChars!.test(char)).join('');
  }

  // Escape HTML entities to prevent XSS
  if (options.escapeHTML) {
    result = escapeHTML(result);
  }

  // Truncate to maximum length if specified
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  return result;
}

/**
 * Sanitize product names
 */
export function sanitizeProductName(name: string): string {
  return sanitizeInput(name, {
    trimWhitespace: true,
    escapeHTML: true,
    removeNewlines: true,
    maxLength: 100,
    preserveSpaces: true,
  });
}

/**
 * Sanitize product descriptions
 */
export function sanitizeProductDescription(description: string): string {
  return sanitizeInput(description, DefaultDescriptionOptions);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  return sanitizeInput(email, DefaultEmailOptions);
}

/**
 * Sanitize search queries
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeInput(query, DefaultSearchOptions);
}

/**
 * Sanitize shipping addresses
 */
export function sanitizeAddress(address: string): string {
  return sanitizeInput(address, {
    trimWhitespace: true,
    escapeHTML: true,
    removeNewlines: false, // Allow newlines in addresses
    maxLength: 500,
    preserveSpaces: true,
  });
}

/**
 * Sanitize URLs
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeInput(url, {
    trimWhitespace: true,
    escapeHTML: false, // Don't escape HTML in URLs
    removeNewlines: true,
    maxLength: 2000,
    preserveSpaces: false,
  });

  // Basic URL validation - must start with http:// or https://
  if (sanitized && !sanitized.match(/^https?:\/\/.+/)) {
    return '';
  }

  return sanitized;
}

/**
 * Validate and sanitize price inputs
 */
export function sanitizePrice(price: string | number): number {
  if (typeof price === 'number') {
    return Math.max(0, Math.round(price * 100) / 100); // Round to 2 decimal places
  }

  const sanitized = sanitizeInput(String(price), {
    trimWhitespace: true,
    escapeHTML: true,
    removeNewlines: true,
    allowedChars: /[0-9.]/,
    preserveSpaces: false,
  });

  const numericValue = parseFloat(sanitized);
  return isNaN(numericValue) ? 0 : Math.max(0, Math.round(numericValue * 100) / 100);
}

/**
 * Validate and sanitize quantity inputs
 */
export function sanitizeQuantity(quantity: string | number): number {
  if (typeof quantity === 'number') {
    return Math.max(0, Math.min(100, Math.floor(quantity)));
  }

  const sanitized = sanitizeInput(String(quantity), {
    trimWhitespace: true,
    escapeHTML: true,
    removeNewlines: true,
    allowedChars: /[0-9]/,
    preserveSpaces: false,
  });

  const numericValue = parseInt(sanitized, 10);
  return isNaN(numericValue) ? 0 : Math.max(0, Math.min(100, numericValue));
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  fieldOptions: Partial<Record<keyof T, SanitizationOptions>> = {}
): T {
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      const options = fieldOptions[key as keyof T] || DefaultTextOptions;
      sanitized[key as keyof T] = sanitizeInput(value, options) as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Create a sanitization validator for React Hook Form
 */
export function createSanitizationValidator(options: SanitizationOptions = DefaultTextOptions) {
  return (value: string) => {
    const sanitized = sanitizeInput(value, options);
    return sanitized || 'Invalid input';
  };
}

/**
 * Sanitization utilities for specific use cases
 */
export const InputSanitizer = {
  productName: sanitizeProductName,
  productDescription: sanitizeProductDescription,
  email: sanitizeEmail,
  searchQuery: sanitizeSearchQuery,
  address: sanitizeAddress,
  url: sanitizeURL,
  price: sanitizePrice,
  quantity: sanitizeQuantity,
  general: (input: string) => sanitizeInput(input, DefaultTextOptions),
  formData: sanitizeFormData,
  escapeHTML,
  removeControlCharacters,
} as const;
