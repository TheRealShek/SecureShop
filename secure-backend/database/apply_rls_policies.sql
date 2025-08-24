-- Apply these RLS policies to your Supabase database
-- Go to Supabase Dashboard -> SQL Editor and run this script

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for products table
-- Allow all authenticated users to read published products (buyers, sellers, admins)
CREATE POLICY "Authenticated users can read published products" ON products
    FOR SELECT USING (status = 'published');

-- Sellers can read their own products (all statuses)
CREATE POLICY "Sellers can read own products" ON products
    FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can create products
CREATE POLICY "Sellers can create products" ON products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products" ON products
    FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for cart_items table
-- Users can manage their own cart items
CREATE POLICY "Users can read own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders table
-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update their own orders (limited scenarios)
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id);

-- RLS Policies for order_items table
-- Users can read order items for their own orders
CREATE POLICY "Users can read own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.buyer_id = auth.uid()
        )
    );

-- Sellers can read order items for their products
CREATE POLICY "Sellers can read order items for own products" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = order_items.product_id 
            AND products.seller_id = auth.uid()
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.buyer_id = auth.uid()
        )
    );
