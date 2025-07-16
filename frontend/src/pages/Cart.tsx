import React from 'react';
import { products } from '../mockData.ts';

// Mock cart: productId -> quantity (for demo purposes)
const cart: { [id: string]: number } = {
  '1': 2,
  '3': 1,
};

/**
 * Cart Page: Lists selected items, shows total cost, and provides a checkout button.
 */
const Cart: React.FC = () => {
  // Map cart product IDs to product details and quantities
  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(p => p.id === id);
    return product ? { ...product, quantity } : null;
  }).filter(Boolean) as Array<typeof products[0] & { quantity: number }>;

  // Calculate total cost
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{
      maxWidth: 800,
      margin: '2.5rem auto',
      padding: '2.5rem 1.5rem',
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
      borderRadius: 16,
      boxShadow: 'var(--card-shadow)'
    }}>
      <h1 style={{ marginBottom: 24, color: 'var(--text-color)' }}>Your Cart</h1>
      {/* Show message if cart is empty, else show table of items */}
      {cartItems.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Your cart is empty.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', marginBottom: 32, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--card-bg)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-color)' }}>Image</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-color)' }}>Product</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-color)' }}>Quantity</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-color)' }}>Price</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-color)' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--nav-border)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-color)' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-color)' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-color)' }}>${item.price.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-color)' }}>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Show total and checkout button */}
      <h2 style={{ color: 'var(--primary)', marginBottom: 24 }}>Total: ${total.toFixed(2)}</h2>
      <button style={{ padding: '1rem 2.5rem', background: 'var(--button-bg)', color: 'var(--button-text)', borderRadius: 6, fontWeight: 600, fontSize: 18, boxShadow: 'var(--button-shadow)' }} disabled={cartItems.length === 0}>
        Checkout
      </button>
    </div>
  );
};

export default Cart; 