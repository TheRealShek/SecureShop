import axios from 'axios';
import { Product, CartItem, User } from '../types';
import { safeParseProducts } from '../utils/typeGuards';

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
      const response = await api.get('/api/products');
      const data = response.data;
      
      // Use type guard to safely parse the response
      return safeParseProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  getById: (id: string) => api.get<Product>(`/api/products/${id}`).then(res => res.data),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'sellerId'>) => 
    api.post<Product>('/api/products', data).then(res => res.data),
  update: (id: string, data: Partial<Product>) => 
    api.put<Product>(`/api/products/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
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
