import axios from 'axios';
import { supabase } from './supabase';
import { getCachedUserRole } from '../utils/roleUtils';
import { Product, CartItem, User, Order, OrderWithDetails } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Fallback image URL that works reliably
const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTQwSDIyNVYxNzBIMTc1VjE0MFpNMTUwIDEwMEgzMDBDMzEzLjgwNyAxMDAgMzI1IDExMS4xOTMgMzI1IDEyNVYyNzVDMzI1IDI4OC44MDcgMzEzLjgwNyAzMDAgMzAwIDMwMEgxMDBDODYuMTkzIDMwMCA3NSAyODguODA3IDc1IDI3NVYxMjVDNzUgMTExLjE5MyA4Ni4xOTMgMTAwIDEwMCAxMDBIMTUwWk0xMDAgMTI1VjI3NUgzMDBWMTI1SDEwMFpNMTI1IDE3MkwxNzUgMjI1TDIyNSAxNzVMMjc1IDIyNVYyNTBIMTI1VjE3MloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';

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

// Helper function to get current user role from cache
const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    // Get current user first
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    
    // Get cached role
    return getCachedUserRole(userData.user.id);
  } catch {
    return null;
  }
};

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const userRole = await getCurrentUserRole();
    
    // For sellers, use backend API to get role-filtered products
    if (userRole === 'seller') {
      try {
        const response = await api.get('/api/products');
        
        // Transform backend data to match frontend Product interface
        const products: Product[] = (response.data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || FALLBACK_IMAGE_URL,
          sellerId: item.seller_id,
          createdAt: item.created_at,
        }));
        
        return products;
      } catch (error) {
        console.error('Error fetching seller products from backend:', error);
        throw error;
      }
    }
    
    // For buyers and other roles, use direct Supabase for better performance
    try {
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
        image: item.image_url || item.image || FALLBACK_IMAGE_URL,
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
    const userRole = await getCurrentUserRole();
    
    // For sellers, use backend API to get role-filtered products
    if (userRole === 'seller') {
      try {
        const response = await api.get('/api/products');
        
        // Transform backend data to match frontend Product interface
        const allProducts: Product[] = (response.data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || 'FALLBACK_IMAGE_URL',
          sellerId: item.seller_id,
          createdAt: item.created_at,
        }));
        
        // Apply pagination
        const products = allProducts.slice(offset, offset + limit);
        
        return {
          products,
          totalCount: allProducts.length,
        };
      } catch (error) {
        console.error('Error fetching paginated seller products from backend:', error);
        throw error;
      }
    }
    
    // For buyers, use direct Supabase with pagination for better performance
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
        image: item.image_url || item.image || 'FALLBACK_IMAGE_URL',
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
      const response = await api.get(`/api/products/${id}`);
      
      // Transform backend data to match frontend Product interface
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      };
    } catch (error) {
      console.error('Error fetching product by ID from backend:', error);
      throw error;
    }
  },

  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product> => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
      };
      
      const response = await api.post('/api/products', backendData);
      
      // Transform backend response to frontend format
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      // Transform frontend data to backend format
      const backendData: any = {};
      if (updates.name) backendData.name = updates.name;
      if (updates.description) backendData.description = updates.description;
      if (updates.price) backendData.price = updates.price;
      if (updates.image) backendData.image = updates.image;

      const response = await api.put(`/api/products/${id}`, backendData);
      
      // Transform backend response to frontend format
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

export const CartService = {
  getCartItems: async (): Promise<CartItem[]> => {
    try {
      // Check if user is authenticated first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          products (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            created_at
          )
        `)
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching cart items:', error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }

      // Transform to match CartItem interface
      return (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          image: item.products.image_url || 'FALLBACK_IMAGE_URL',
          sellerId: item.products.seller_id,
          createdAt: item.products.created_at,
        }
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },

  addToCart: async (productId: string): Promise<CartItem> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', sessionData.session.user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to check existing cart item: ${checkError.message}`);
      }

      if (existingItem) {
        // Update existing item quantity
        return await CartService.updateCartItem(productId, existingItem.quantity + 1);
      } else {
        // Create new cart item
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: sessionData.session.user.id,
            product_id: productId,
            quantity: 1
          }])
          .select(`
            id,
            user_id,
            product_id,
            quantity,
            created_at,
            products (
              id,
              name,
              description,
              price,
              image_url,
              seller_id,
              created_at
            )
          `)
          .single();

        if (error) {
          throw new Error(`Failed to add item to cart: ${error.message}`);
        }

        return {
          id: data.id,
          productId: data.product_id,
          quantity: data.quantity,
          product: {
            id: (data.products as any).id,
            name: (data.products as any).name,
            description: (data.products as any).description,
            price: (data.products as any).price,
            image: (data.products as any).image_url || 'FALLBACK_IMAGE_URL',
            sellerId: (data.products as any).seller_id,
            createdAt: (data.products as any).created_at,
          }
        };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (productId: string, quantity: number): Promise<CartItem> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: quantity
        })
        .eq('user_id', sessionData.session.user.id)
        .eq('product_id', productId)
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          products (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            created_at
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update cart item: ${error.message}`);
      }

      return {
        id: data.id,
        productId: data.product_id,
        quantity: data.quantity,
        product: {
          id: (data.products as any).id,
          name: (data.products as any).name,
          description: (data.products as any).description,
          price: (data.products as any).price,
          image: (data.products as any).image_url || 'FALLBACK_IMAGE_URL',
          sellerId: (data.products as any).seller_id,
          createdAt: (data.products as any).created_at,
        }
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeCartItem: async (productId: string): Promise<void> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', sessionData.session.user.id)
        .eq('product_id', productId);

      if (error) {
        throw new Error(`Failed to remove cart item: ${error.message}`);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  clearCart: async (): Promise<void> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', sessionData.session.user.id);

      if (error) {
        throw new Error(`Failed to clear cart: ${error.message}`);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export const UserService = {
  getProfile: () => api.get<User>('/api/user').then(res => res.data),
  updateProfile: (data: Partial<User>) => 
    api.put<User>('/api/user', data).then(res => res.data),
};

// Seller-specific product services
export const SellerProductService = {
  // Get products for current seller only
  // Uses backend API which automatically filters by seller role
  getSellerProducts: async (): Promise<Product[]> => {
    try {
      // Call backend API which handles role-based filtering
      const response = await api.get('/api/products');
      // Support both array and { products: [] } formats
      const raw = response.data;
      const arr = Array.isArray(raw) ? raw : (raw.products || []);
      const products: Product[] = arr.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      }));
      return products;
    } catch (error) {
      console.error('Error fetching seller products from backend:', error);
      throw error;
    }
  },

  // Create product (automatically assigns to current seller)
  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product> => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
      };
      
      const response = await api.post('/api/products', backendData);
      
      // Transform backend response to frontend format
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      };
    } catch (error) {
      console.error('Error creating product via backend:', error);
      throw error;
    }
  },

  // Update product (only if owned by current seller)
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      // Transform frontend data to backend format
      const backendData: any = {};
      if (updates.name) backendData.name = updates.name;
      if (updates.description) backendData.description = updates.description;
      if (updates.price) backendData.price = updates.price;
      if (updates.image) backendData.image = updates.image;

      const response = await api.put(`/api/products/${id}`, backendData);
      
      // Transform backend response to frontend format
      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || 'FALLBACK_IMAGE_URL',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      };
    } catch (error) {
      console.error('Error updating product via backend:', error);
      throw error;
    }
  },

  // Delete product (only if owned by current seller)
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      console.error('Error deleting product via backend:', error);
      throw error;
    }
  },
};

// Order management services
export const OrderService = {
  // Get orders for seller's products
  getSellerOrders: async (): Promise<OrderWithDetails[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Step 1: Get seller's product IDs
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', userData.user.id);

      if (productsError) {
        throw new Error(`Failed to fetch seller products: ${productsError.message}`);
      }

      const productIds = productsData?.map(p => p.id) || [];
      
      if (productIds.length === 0) {
        return [];
      }

      // Step 2: Get order_items for seller's products
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('product_id', productIds);

      if (orderItemsError) {
        throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
      }

      if (!orderItemsData || orderItemsData.length === 0) {
        return [];
      }

      const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];

      // Step 3: Get orders with buyer details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          status,
          total_amount,
          created_at,
          updated_at,
          users:buyer_id (
            id,
            email,
            role
          )
        `)
        .in('id', orderIds);

      if (ordersError) {
        throw new Error(`Failed to fetch orders: ${ordersError.message}`);
      }

      // Step 4: Get product details
      const { data: productDetailsData, error: productDetailsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productDetailsError) {
        throw new Error(`Failed to fetch product details: ${productDetailsError.message}`);
      }

      // Create lookup maps
      const ordersMap = new Map(ordersData?.map(order => [order.id, order]) || []);
      const productsMap = new Map(productDetailsData?.map(product => [product.id, product]) || []);

      // Map to OrderWithDetails format, preserving return shape
      const orders: OrderWithDetails[] = orderItemsData.map((item: any) => {
        const order = ordersMap.get(item.order_id);
        const product = productsMap.get(item.product_id);
        const user = order ? (Array.isArray(order.users) ? order.users[0] : order.users) : null;
        
        const mappedUser = user
          ? { id: user.id as string, email: user.email as string, role: user.role as string }
          : { id: (order?.buyer_id ?? '') as string, email: '', role: '' };

        return {
          id: order?.id || item.order_id,
          user_id: order?.buyer_id || null,
          product_id: item.product_id,
          quantity: item.quantity,
          status: order?.status || 'pending',
          total_amount: order?.total_amount || 0,
          created_at: order?.created_at || '',
          updated_at: order?.updated_at || '',
          products: product ? {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image_url || 'FALLBACK_IMAGE_URL',
            sellerId: product.seller_id,
            createdAt: product.created_at,
          } : {} as any,
          users: mappedUser,
        };
      });

      // Sort by order creation date descending (most recent first)
      orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return orders;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      return {
        id: data.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        status: data.status,
        total_amount: data.total_amount,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};
