import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../mockData.ts';

/**
 * Product Detail Page: Shows details for a single product, with add to cart and buy now options.
 */
const ProductDetail: React.FC = () => {
  // Get product ID from URL params
  const { id } = useParams<{ id: string }>();
  // Find the product by ID from mock data
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div style={{ textAlign: 'center', marginTop: '3rem', color: '#e02d2d' }}>Product not found.</div>;
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: '2.5rem auto',
      padding: '2.5rem 1.5rem',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(42, 122, 226, 0.09)',
      display: 'flex',
      flexDirection: 'row',
      gap: '2.5rem',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    }}>
      {/* Product image */}
      <img src={product.image} alt={product.name} style={{ width: 280, maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(42, 122, 226, 0.07)' }} />
      <div style={{ flex: 1, minWidth: 220 }}>
        <h1 style={{ marginBottom: 8 }}>{product.name}</h1>
        <div style={{ color: '#2a7ae2', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>${product.price.toFixed(2)}</div>
        <p style={{ marginBottom: 24, color: '#444', fontSize: 16 }}>{product.description}</p>
        {/* Add to Cart and Buy Now buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.75rem 2rem', background: '#2a7ae2', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 6, boxShadow: '0 1px 4px rgba(42, 122, 226, 0.04)' }}>Add to Cart</button>
          <button style={{ padding: '0.75rem 2rem', background: '#28a745', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 6, boxShadow: '0 1px 4px rgba(40, 167, 69, 0.08)' }}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 