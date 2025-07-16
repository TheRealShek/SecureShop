import React, { useState } from 'react';
import { products, Product } from '../mockData';
import './ProductList.css';

const categories = Array.from(new Set(products.map(p => p.category)));

const ProductList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
    const priceMatch = maxPrice ? product.price <= parseFloat(maxPrice) : true;
    return categoryMatch && priceMatch;
  });

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="product-list-container">
      <h1>All Products</h1>
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