import React, { useState, useEffect } from 'react';
import api from './services/api.js';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Cart from './pages/Cart.jsx';

// App.jsx
const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      // User has a token, redirect to home
      setCurrentPage('home');
      // Note: In a real app, you might want to validate the token with the backend
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCart([]);
      setCurrentPage('login');
    }
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleUpdateCart = (newCart) => {
    setCart(newCart);
  };

  switch (currentPage) {
    case 'login':
      return <Login onLogin={handleLogin} />;
    case 'home':
      return (
        <Home
          user={user}
          cart={cart}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onAddToCart={handleAddToCart}
        />
      );
    case 'cart':
      return (
        <Cart
          user={user}
          cart={cart}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onUpdateCart={handleUpdateCart}
        />
      );
    default:
      return <Login onLogin={handleLogin} />;
  }
};

export default App;