import React, { useState } from 'react';
import { products, Product } from '../mockData.ts';
import './ProductList.css';

// Get unique categories from products for filter dropdown
const categories = Array.from(new Set(products.map(p => p.category)));

/**
 * Product Listing Page: Lists all products, allows filtering, and supports add to cart.
 */
const ProductList: React.FC = () => {
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState('');
  // State for max price filter
  const [maxPrice, setMaxPrice] = useState('');
  // Local cart state (for demo)
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  // Filter products by selected category and max price
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
    const priceMatch = maxPrice ? product.price <= parseFloat(maxPrice) : true;
    return categoryMatch && priceMatch;
  });

  // Add product to cart (increments quantity)
  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="product-list-container" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <h1>All Products</h1>
      {/* Filters for category and max price */}
      <div className="filters">
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          min="0"
        />
      </div>
      {/* Render filtered products as cards */}
      <div className="product-list">
        {filteredProducts.map(product => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>${product.price.toFixed(2)}</span>
            <button onClick={() => handleAddToCart(product.id)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList; 