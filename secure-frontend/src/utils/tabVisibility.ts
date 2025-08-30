/**
 * Utilities for handling tab switching and visibility changes
 * Prevents unnecessary reloads and API calls when switching tabs
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to detect tab switching and prevent unnecessary operations
 */
export function useTabVisibility() {
  const isTabVisible = useRef(true);
  const lastVisibilityChange = useRef(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isTabVisible.current;
      isTabVisible.current = !document.hidden;
      lastVisibilityChange.current = Date.now();

      // Log visibility changes for debugging
      if (wasVisible && document.hidden) {
        console.log(' Tab hidden - preventing unnecessary operations');
      } else if (!wasVisible && !document.hidden) {
        console.log(' Tab visible - resuming normal operations');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, []);

  return {
    isVisible: isTabVisible.current,
    lastVisibilityChange: lastVisibilityChange.current,
    shouldSkipOperation: (threshold = 1000) => {
      // Skip operations if tab was just made visible (within threshold)
      return Date.now() - lastVisibilityChange.current < threshold;
    },
  };
}

/**
 * Enhanced session storage that's aware of tab visibility
 */
export class TabAwareStorage {
  private static readonly TAB_VISIBILITY_KEY = 'tab_visibility_state';
  
  static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.warn('Failed to set localStorage item:', key, error);
    }
  }

  static getItem(key: string, maxAge?: number): string | null {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      if (maxAge) {
        const timestamp = localStorage.getItem(`${key}_timestamp`);
        if (timestamp && Date.now() - parseInt(timestamp) > maxAge) {
          // Data is too old, remove it
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
          return null;
        }
      }

      return value;
    } catch (error) {
      console.warn('Failed to get localStorage item:', key, error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    } catch (error) {
      console.warn('Failed to remove localStorage item:', key, error);
    }
  }

  static isRecentlyVisible(): boolean {
    const lastVisible = this.getItem(this.TAB_VISIBILITY_KEY);
    if (!lastVisible) return false;
    
    return Date.now() - parseInt(lastVisible) < 5000; // 5 seconds threshold
  }

  static markTabVisible(): void {
    this.setItem(this.TAB_VISIBILITY_KEY, Date.now().toString());
  }
}

/**
 * Debounced function utility for tab switching scenarios
 */
export function debounceTabOperation<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
