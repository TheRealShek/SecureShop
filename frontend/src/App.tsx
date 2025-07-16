import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import ProductList from './pages/ProductList.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import OrderConfirmation from './pages/OrderConfirmation.tsx';
import LoginSignup from './pages/LoginSignup.tsx';
import UserProfile from './pages/UserProfile.tsx';

// 404 Not Found page for unmatched routes
const NotFound: React.FC = () => (
  <div style={{ textAlign: 'center', margin: '4rem auto', color: '#e02d2d', fontWeight: 600, fontSize: 24 }}>
    404 – Page Not Found
  </div>
);

// Mock credentials for authentication
const MOCK_USER = {
  email: 'email@gmail.com',
  password: 'testpass',
  name: 'Jane Doe',
};

/**
 * ProfileDropdown: Shows profile options (View Profile, Logout)
 */
const ProfileDropdown: React.FC<{ onLogout: () => void; name: string }> = ({ onLogout, name }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#2a7ae2',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        aria-label="Profile menu"
      >
        <span className="icon" style={{ fontSize: 20, marginRight: 4 }}>👤</span> {name}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '2.2rem',
          background: 'var(--card-bg)',
          color: 'var(--text-color)',
          border: '1px solid var(--nav-border)',
          borderRadius: 8,
          boxShadow: 'var(--card-shadow)',
          minWidth: 160,
          zIndex: 100,
          paddingBottom: 8
        }}>
          <Link to="/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', color: 'var(--primary)', textDecoration: 'none', whiteSpace: 'nowrap', minWidth: 120
            }}
            onClick={() => setOpen(false)}
          >
            <span className="icon" style={{ color: 'var(--primary)' }}>👤</span> View Profile
          </Link>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{ width: '100%', background: 'none', border: 'none', color: '#e02d2d', padding: '10px 18px', textAlign: 'left', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span className="icon" style={{ color: '#e02d2d' }}>🚪</span> Logout
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Main App component: sets up authentication, navigation, and routing.
 */
const App: React.FC = () => {
  // Auth state: null = not logged in, object = logged in
  const [auth, setAuth] = useState<null | { email: string; name: string }>(null);
  // Loading state for product list
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Handle login with mock credentials
  const handleLogin = (email: string, password: string) => {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      setAuth({ email: MOCK_USER.email, name: MOCK_USER.name });
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  // Handle logout
  const handleLogout = () => {
    setAuth(null);
  };

  // If not authenticated, show only the Login/Signup page
  if (!auth) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<LoginSignup onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  // If authenticated, show the main app
  return (
    <Router>
      {/* Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--amazon-blue)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        padding: '0.5rem 2rem',
        minHeight: 56,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        borderBottom: 'none',
      }}>
        {/* Amazon-style logo */}
        <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--amazon-yellow)', letterSpacing: '1px', marginRight: '2.5rem', fontFamily: 'Arial, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>SecureShop</span>
        <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Products
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Cart
        </NavLink>
        {/* Profile dropdown on the right */}
        <div style={{ marginLeft: 'auto' }}>
          <ProfileDropdown onLogout={handleLogout} name={auth.name} />
        </div>
      </nav>
      {/* Main Content Area with Routing */}
      <div className="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        <Routes>
          {/* Home page: welcome and highlights */}
          <Route path="/" element={<Home />} />
          {/* Product listing page: all products, filters, add to cart */}
          <Route path="/products" element={
            loadingProducts ? (
              <div style={{ textAlign: 'center', margin: '3rem', color: '#2a7ae2', fontWeight: 600, fontSize: 22 }}>Loading products...</div>
            ) : (
              <ProductList />
            )
          } />
          {/* Product detail page: info, add to cart/buy now */}
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* Cart page: selected items, total, checkout */}
          <Route path="/cart" element={<Cart />} />
          {/* Order confirmation: success/failure after checkout */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          {/* User profile: user info and past orders */}
          <Route path="/profile" element={<UserProfile />} />
          {/* 404 Not Found for unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
