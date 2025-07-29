import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import ProductCard from '../components/ProductCard.jsx';

// pages/Home.js
const Home = ({ user, cart, onNavigate, onLogout, onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError('');
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} cart={cart} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} cart={cart} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <button
              onClick={retryFetch}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} cart={cart} onNavigate={onNavigate} onLogout={onLogout} />
     
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
       
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">No products available.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                userRole={user?.role}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;