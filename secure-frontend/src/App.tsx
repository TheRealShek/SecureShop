import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootRedirect } from './components/RootRedirect';

// Lazy load large pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(module => ({ default: module.ProductDetailsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage').then(module => ({ default: module.OrderDetailsPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ManageProductsPage = lazy(() => import('./pages/ManageProductsPage').then(module => ({ default: module.ManageProductsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const NotAuthorizedPage = lazy(() => import('./pages/NotAuthorizedPage').then(module => ({ default: module.NotAuthorizedPage })));
// Seller pages
const SellerDashboardPage = lazy(() => import('./pages/SellerDashboardPage').then(module => ({ default: module.SellerDashboardPage })));
const SellerProductsPage = lazy(() => import('./pages/SellerProductsPage').then(module => ({ default: module.SellerProductsPage })));
const AddProductPage = lazy(() => import('./pages/AddProductPage').then(module => ({ default: module.AddProductPage })));
const EditProductPage = lazy(() => import('./pages/EditProductPage').then(module => ({ default: module.EditProductPage })));
const SellerOrdersPage = lazy(() => import('./pages/SellerOrdersPage').then(module => ({ default: module.SellerOrdersPage })));

// Loading component for Suspense fallback
const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center px-4 py-16 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6"></div>
        <p className="text-slate-700 text-lg font-semibold">Loading page...</p>
      </div>
    </div>
  </div>
);

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
            <Suspense fallback={<PageLoadingSpinner />}>
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
            </Suspense>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}export default App;