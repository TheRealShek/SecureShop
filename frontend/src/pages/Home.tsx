import React from 'react';
import { products } from '../mockData';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Welcome to SecureShop!</h1>
      <p>Your one-stop shop for quality products.</p>
      <h2>Product Highlights</h2>
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