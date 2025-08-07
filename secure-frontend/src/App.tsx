import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootRedirect } from './components/RootRedirect';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManageProductsPage } from './pages/ManageProductsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotAuthorizedPage } from './pages/NotAuthorizedPage';

const queryClient = new QueryClient();


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Root route: redirect based on auth status and role */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/not-authorized" element={<NotAuthorizedPage />} />
            
            {/* Role-based protected routes */}
            {/* Admin Dashboard - only admin */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Seller Management - only seller and admin */}
            <Route 
              path="/manage-products" 
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <ManageProductsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes with Layout wrapper */}
            <Route element={<Layout />}>
              {/* Products - all authenticated users */}
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Product Details - all authenticated users */}
              <Route 
                path="/products/:id" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <ProductDetailsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Cart - only buyers and admin */}
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <CartPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Catch-all route for unknown paths - requires authentication */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                  <NotFoundPage />
                </ProtectedRoute>
              } 
            />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}export default App;