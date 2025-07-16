import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Order Confirmation Page: Shows a success or failure message after checkout, based on URL status param.
 */
const OrderConfirmation: React.FC = () => {
  // Get status from query params (?status=success or ?status=failure)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const status = params.get('status');

  return (
    <div style={{
      maxWidth: 420,
      margin: '4rem auto',
      padding: '2.5rem 1.5rem',
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
      borderRadius: 16,
      boxShadow: 'var(--card-shadow)',
      textAlign: 'center',
    }}>
      {/* Show success or failure illustration and message based on status */}
      {status === 'success' ? (
        <>
          <img
            src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
            alt="Order success"
            style={{ width: 80, height: 80, marginBottom: 16 }}
          />
          <h1 style={{ color: '#28a745', marginBottom: 8 }}>Order Successful!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Thank you for your purchase. Your order has been placed successfully.</p>
        </>
      ) : (
        <>
          <img
            src="https://cdn-icons-png.flaticon.com/512/463/463612.png"
            alt="Order failed"
            style={{ width: 80, height: 80, marginBottom: 16 }}
          />
          <h1 style={{ color: '#e02d2d', marginBottom: 8 }}>Order Failed</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sorry, there was a problem processing your order. Please try again.</p>
        </>
      )}
    </div>
  );
};

export default OrderConfirmation; 