import axios from 'axios';
import { supabase } from './supabase';
import { Product, CartItem, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
);

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    try {
      // Fetch products from Supabase database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      // Transform Supabase data to match our Product interface
      const products: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url || item.image || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: item.seller_id || item.sellerId || '',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getPaginated: async (limit: number, offset: number): Promise<{ products: Product[]; totalCount: number }> => {
    try {
      // First, get the total count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Supabase error counting products:', countError);
        throw new Error(`Failed to count products: ${countError.message}`);
      }

      // Then fetch the paginated products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      // Transform Supabase data to match our Product interface
      const products: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url || item.image || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: item.seller_id || item.sellerId || '',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));

      return {
        products,
        totalCount: count || 0,
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      if (!data) {
        throw new Error('Product not found');
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image_url || data.image || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: data.seller_id || data.sellerId || '',
        createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: productData.image,
          seller_id: userData.user.id,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: data.seller_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.price) updateData.price = updates.price;
      if (updates.image) updateData.image_url = updates.image;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: data.seller_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

export const CartService = {
  get: () => api.get<CartItem[]>('/api/cart').then(res => res.data),
  addItem: (productId: string, quantity: number) => 
    api.post<CartItem>('/api/cart', { productId, quantity }).then(res => res.data),
  updateQuantity: (itemId: string, quantity: number) => 
    api.put<CartItem>(`/api/cart/${itemId}`, { quantity }).then(res => res.data),
  removeItem: (itemId: string) => api.delete(`/api/cart/${itemId}`),
};

export const UserService = {
  getProfile: () => api.get<User>('/api/user').then(res => res.data),
  updateProfile: (data: Partial<User>) => 
    api.put<User>('/api/user', data).then(res => res.data),
};
