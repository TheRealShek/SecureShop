# Database Documentation

This section contains all documentation related to the SecureShop database setup, configuration, and Row Level Security (RLS) implementation.

## Overview

SecureShop uses PostgreSQL through Supabase, featuring:

- **Database**: PostgreSQL 15+ via Supabase
- **Security**: Row Level Security (RLS) for data isolation
- **Authentication**: Integrated with Supabase Auth
- **Real-time**: Live updates with Supabase subscriptions
- **Backups**: Automated backups through Supabase

## Quick Start

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Email/Password authentication
3. Follow the [RLS Setup Guide](./rls-setup-guide.md)
4. Configure environment variables in both frontend and backend

## Database Schema

### Core Tables

#### Users
- Managed by Supabase Auth
- Extended with custom roles and profiles
- Linked to products, orders, and cart items

#### Products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image TEXT,
  seller_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Order Items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);
```

#### Cart Items
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Profiles
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

RLS ensures users can only access data they're authorized to see:

### Products Table RLS
```sql
-- Anyone can read products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Only sellers can create products
CREATE POLICY "Sellers can create products" ON products FOR INSERT 
WITH CHECK (auth.uid() = seller_id AND user_role() = 'seller');

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE 
USING (auth.uid() = seller_id AND user_role() IN ('seller', 'admin'));
```

### Orders Table RLS
```sql
-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT 
USING (auth.uid() = buyer_id);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view relevant orders" ON orders FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM order_items oi 
  JOIN products p ON oi.product_id = p.id 
  WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
));

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT 
USING (user_role() = 'admin');
```

### Cart Items RLS
```sql
-- Users can only access their own cart
CREATE POLICY "Users can manage own cart" ON cart_items 
FOR ALL USING (auth.uid() = user_id);
```

## Setup Instructions

### 1. Supabase Project Setup

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Enable Authentication**
   - Go to Authentication → Settings
   - Enable Email/Password authentication
   - Configure email templates if needed

3. **Database Setup**
   - Go to SQL Editor
   - Run the complete setup script from [RLS Setup Guide](./rls-setup-guide.md)

### 2. Environment Configuration

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
```

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

### 3. Test Data Setup

Use the provided SQL scripts to create test users and sample data:

```sql
-- Create test users (run after auth setup)
INSERT INTO user_profiles (id, role, full_name) VALUES
  ('admin-user-id', 'admin', 'Admin User'),
  ('seller-user-id', 'seller', 'Seller User'),
  ('buyer-user-id', 'buyer', 'Buyer User');

-- Add sample products
INSERT INTO products (name, description, price, stock, seller_id) VALUES
  ('Sample Product 1', 'Description here', 29.99, 100, 'seller-user-id'),
  ('Sample Product 2', 'Another description', 49.99, 50, 'seller-user-id');
```

## Security Considerations

### Data Access Control
- **RLS Policies**: Ensure users can only access appropriate data
- **Role Validation**: Server-side role checking for all operations
- **Input Sanitization**: Prevent SQL injection and XSS attacks

### Authentication Security
- **JWT Validation**: All API requests validate tokens
- **Session Management**: Automatic token refresh and logout
- **Password Security**: Supabase handles secure password storage

### Database Security
- **Connection Security**: Encrypted connections to database
- **Backup Security**: Automated encrypted backups
- **Access Logs**: Audit trails for all database operations

## Performance Optimization

### Indexing Strategy
```sql
-- Product search performance
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_seller ON products(seller_id);

-- Order lookup performance
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Cart performance
CREATE INDEX idx_cart_user ON cart_items(user_id);
```

### Query Optimization
- Use appropriate indexes for frequent queries
- Implement pagination for large result sets
- Cache frequently accessed data
- Use database functions for complex operations

## Monitoring & Maintenance

### Database Monitoring
- **Performance Metrics**: Query performance and slow queries
- **Connection Monitoring**: Active connections and pool usage
- **Storage Monitoring**: Database size and growth trends

### Backup Strategy
- **Automated Backups**: Daily automated backups via Supabase
- **Point-in-Time Recovery**: Available through Supabase Pro
- **Data Export**: Regular exports for additional safety

### Maintenance Tasks
- **Regular Updates**: Keep Supabase updated to latest version
- **Index Maintenance**: Monitor and optimize database indexes
- **Security Audits**: Regular review of RLS policies and access patterns

## Troubleshooting

### Common Issues

#### RLS Policy Problems
- **Symptom**: Users can't access their own data
- **Solution**: Check RLS policies and user role assignments

#### Authentication Issues
- **Symptom**: JWT validation failures
- **Solution**: Verify Supabase configuration and token format

#### Performance Issues
- **Symptom**: Slow query performance
- **Solution**: Check indexes and query optimization

### Debug Tools
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Monitor query performance
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check active connections
SELECT * FROM pg_stat_activity;
```

## Migration Guide

When making schema changes:

1. **Test in Development**: Always test migrations in development first
2. **Backup Data**: Ensure recent backups before production changes
3. **Gradual Rollout**: Use feature flags for gradual deployment
4. **Monitor Performance**: Watch for performance impacts after changes

---

*For more information, see the [main documentation](../README.md)*
