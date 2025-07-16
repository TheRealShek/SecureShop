import React from 'react';
import { mockUser, products } from '../mockData.ts';

/**
 * User Profile Page: Shows user info and a list of past orders (mock data).
 */
const UserProfile: React.FC = () => {
  return (
    <div style={{
      maxWidth: 600,
      margin: '3rem auto',
      padding: '2.5rem 1.5rem',
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
      borderRadius: 16,
      boxShadow: 'var(--card-shadow)'
    }}>
      {/* User avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="User avatar"
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '2.5px solid var(--primary)' }}
        />
        <h1 style={{ marginBottom: 8, color: 'var(--text-color)' }}>{mockUser.name}</h1>
      </div>
      {/* Display user name and email */}
      <div style={{ marginBottom: 32, fontSize: 17, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <strong>Email:</strong> {mockUser.email}
      </div>
      <h2 style={{ marginBottom: 16, color: 'var(--text-color)' }}>Past Orders</h2>
      {/* List past orders, showing product names and quantities */}
      {mockUser.pastOrders.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No past orders.</p>
      ) : (
        <div>
          {mockUser.pastOrders.map(order => (
            <div key={order.orderId} style={{
              border: '1px solid var(--nav-border)',
              borderRadius: 10,
              marginBottom: 18,
              padding: 16,
              background: 'var(--bg-color)',
              boxShadow: 'var(--card-shadow)',
              color: 'var(--text-color)'
            }}>
              <div style={{ marginBottom: 6 }}><strong>Order ID:</strong> {order.orderId}</div>
              <div style={{ marginBottom: 6 }}><strong>Date:</strong> {order.date}</div>
              <div style={{ marginBottom: 6 }}><strong>Total:</strong> ${order.total.toFixed(2)}</div>
              <div><strong>Items:</strong>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {order.items.map(item => {
                    // Find product name from product ID
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <li key={item.productId}>
                        {product ? product.name : 'Unknown Product'} x {item.quantity}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 