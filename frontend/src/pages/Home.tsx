import React from 'react';
import { products } from '../mockData.ts';
import './Home.css';

/**
 * Home Page: Shows a welcome message and product highlights (top 3 products).
 */
const Home: React.FC = () => {
  return (
    <div className="home-container" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Hero/banner image */}
      <img
        src="https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=900&q=80"
        alt="Shop banner"
        style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }}
      />
      <h1>Welcome to SecureShop!</h1>
      <p>Your one-stop shop for quality products.</p>
      <h2>Product Highlights</h2>
      {/* Display the first 3 products as highlights */}
      <div className="product-highlights">
        {products.slice(0, 3).map((product) => (
          <div className="highlight-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>${product.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 