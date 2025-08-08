import axios from 'axios';
import { supabase } from './supabase';
import { Product, CartItem, User, Order, OrderWithDetails } from '../types';

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
          image: item.products.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
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
            image: (data.products as any).image_url || 'https://via.placeholder.com/400x400?text=No+Image',
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
          image: (data.products as any).image_url || 'https://via.placeholder.com/400x400?text=No+Image',
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
  getSellerProducts: async (): Promise<Product[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch seller products: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
        sellerId: item.seller_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  },

  // Create product (automatically assigns to current seller)
  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId'>): Promise<Product> => {
    return ProductService.create(productData);
  },

  // Update product (only if owned by current seller)
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    return ProductService.update(id, updates);
  },

  // Delete product (only if owned by current seller)
  deleteProduct: async (id: string): Promise<void> => {
    return ProductService.delete(id);
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

      // Query from order_items (junction table) with joins to both orders and products
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price_at_purchase,
          order_id,
          product_id,
          products:product_id (
            id,
            name,
            description,
            price,
            image_url,
            seller_id,
            created_at
          ),
          orders:order_id (
            id,
            user_id,
            status,
            total_amount,
            created_at,
            updated_at,
            users:user_id (
              id,
              email,
              role
            )
          )
        `)
        .eq('products.seller_id', userData.user.id)
        .order('orders(created_at)', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch seller orders: ${error.message}`);
      }

      // Transform the data to match OrderWithDetails interface
      return (data || []).map(item => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        const user = Array.isArray(order.users) ? order.users[0] : order.users;

        return {
          id: order.id,
          user_id: order.user_id,
          product_id: item.product_id,
          quantity: item.quantity,
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          updated_at: order.updated_at,
          products: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
            sellerId: product.seller_id,
            createdAt: product.created_at,
          },
          users: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        };
      });
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
