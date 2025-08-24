export interface User {
  id: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  image_url?: string; // Database field name
  sellerId: string;
  stock?: number; // Optional for backward compatibility
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

// Supabase cart item type (matches database schema)
export interface DbCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Extended cart item with product details
export interface CartItemWithProduct extends DbCartItem {
  products: Product;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Extended order with product and user details
export interface OrderWithDetails extends Order {
  products: Product;
  users: {
    id: string;
    email: string;
    role: string;
  };
}
