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
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManageProductsPage } from './pages/ManageProductsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotAuthorizedPage } from './pages/NotAuthorizedPage';
// Seller pages
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerProductsPage } from './pages/SellerProductsPage';
import { AddProductPage } from './pages/AddProductPage';
import { EditProductPage } from './pages/EditProductPage';
import { SellerOrdersPage } from './pages/SellerOrdersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable refetch on window focus to prevent unnecessary reloads on tab switching
      refetchOnWindowFocus: false,
      // Extend stale time to reduce unnecessary background refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Extend garbage collection time to keep cached data longer
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      // Disable refetch on reconnect for stable user experience
      refetchOnReconnect: false,
      // Only retry failed requests once to avoid excessive network calls
      retry: 1,
      // Add longer retry delay
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Shorter retry for mutations since they're user-initiated
      retry: 1,
      retryDelay: 1000,
    },
  },
});


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
            
            {/* Admin Product Edit - only admin */}
            <Route 
              path="/admin/products/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditProductPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Seller Management - only seller */}
            <Route 
              path="/manage-products" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <ManageProductsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Seller Dashboard Routes - only seller */}
            <Route 
              path="/seller/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seller/products" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerProductsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seller/products/add" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <AddProductPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seller/products/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <EditProductPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seller/orders" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerOrdersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes with Layout wrapper */}
            <Route element={<Layout />}>
              {/* Products - only buyers and sellers (admin uses dashboard) */}
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller']}>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Product Details - only buyers and sellers (admin uses dashboard) */}
              <Route 
                path="/products/:id" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller']}>
                    <ProductDetailsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Cart - only buyers */}
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <CartPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Orders - only buyers */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <OrdersPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Order Details - only buyers */}
              <Route 
                path="/orders/:orderId" 
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Catch-all route for unknown paths - requires authentication */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute allowedRoles={['buyer', 'seller']}>
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