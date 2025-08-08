import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  seller_id: string;
  created_at: string;
}

interface UseSellerProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  deleting: string | null;
}

export function useSellerProducts(sellerId: string): UseSellerProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setDeleting(productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', sellerId); // Extra security: ensure seller owns the product

      if (error) {
        throw error;
      }

      // Remove from local state
      setProducts(prev => prev.filter(product => product.id !== productId));
      
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchProducts();
    }
  }, [sellerId]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    deleteProduct,
    deleting,
  };
}
