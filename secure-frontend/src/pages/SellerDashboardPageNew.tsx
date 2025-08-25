import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SellerProductService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { ExclamationTriangleIcon, PencilIcon } from '@heroicons/react/24/outline';

export function SellerDashboardPage() {
  const { user, isAuthenticated, isSeller, authReady } = useAuth();

  // Fetch seller's products - only when user is authenticated, is a seller, and auth is ready
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: SellerProductService.getSellerProducts,
    enabled: authReady && isAuthenticated && isSeller && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('not authenticated') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch seller's orders - ENABLED with real Supabase data
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          created_at,
          order_id,
          orders!inner(
            id,
            status,
            buyer_id,
            created_at,
            users!inner(email)
          ),
          products!inner(
            name,
            seller_id
          )
        `)
        .eq('products.seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.order_id,
        product_name: item.products?.name || 'Unknown Product',
        customer_email: item.orders?.users?.email || 'Unknown Customer',
        status: (item.orders?.status || 'pending') as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
        created_at: item.orders?.created_at || item.created_at,
        total_amount: item.total_price || 0
      }));
    },
    enabled: authReady && isAuthenticated && isSeller && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('not authenticated') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Helper functions for inventory overview
  const getLowStockProducts = () => products.filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0);
  const getOutOfStockProducts = () => products.filter(p => (p.stock || 0) === 0);

  // Update order status function
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refetch orders after update
      window.location.reload();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const isLoading = productsLoading || ordersLoading;

  // Show error state if there are critical errors
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">
            {productsError?.message || 'Failed to load dashboard data'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0);

  // Top products by orders (simplified since orders are disabled)
  const topProducts = products
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Seller Dashboard
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Welcome back! Here's an overview of your store performance.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/seller/products/add"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Active inventory
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    All time
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <div className="flex items-center mt-1">
                  {pendingOrders > 0 ? (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Needs attention
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      All caught up
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Lifetime earnings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Inventory Overview</h3>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Real-time updates</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {getOutOfStockProducts().length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-semibold text-red-800 mb-3">Out of Stock Items</h4>
                    <div className="space-y-3">
                      {getOutOfStockProducts().map(product => (
                        <div key={product.id} className="bg-white rounded-lg p-4 border border-red-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image}
                                alt={product.name}
                              />
                              <div>
                                <span className="text-sm font-medium text-red-800">{product.name}</span>
                                <p className="text-xs text-red-600">0 units remaining</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/seller/products/edit/${product.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Edit
                              </Link>
                              <button
                                onClick={() => alert('Restock functionality would be implemented here')}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {getLowStockProducts().length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-3">Low Stock Items</h4>
                    <div className="space-y-3">
                      {getLowStockProducts().map(product => (
                        <div key={product.id} className="bg-white rounded-lg p-4 border border-yellow-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image}
                                alt={product.name}
                              />
                              <div>
                                <span className="text-sm font-medium text-yellow-800">{product.name}</span>
                                <p className="text-xs text-yellow-600">{product.stock} units remaining</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/seller/products/edit/${product.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Edit
                              </Link>
                              <button
                                onClick={() => alert('Restock functionality would be implemented here')}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {getOutOfStockProducts().length === 0 && getLowStockProducts().length === 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-green-100 rounded-full mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-green-800 mb-2">All products are well stocked!</h4>
                  <p className="text-sm text-green-700">Your inventory levels look healthy across all products.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Recent Orders
                </h3>
                <Link
                  to="/seller/orders"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                >
                  View all
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                  <p className="text-sm text-gray-500 mb-4">Orders will appear here when customers buy your products</p>
                  <Link
                    to="/seller/products/add"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Add Your Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {order.product_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Customer: {order.customer_email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{order.total_amount.toFixed(2)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          order.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'shipped'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="mt-2 w-full text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Top Products
                </h3>
                <Link
                  to="/seller/products"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                >
                  View all
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {topProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                  <p className="text-sm text-gray-500 mb-4">Start by adding your first product to get started</p>
                  <Link
                    to="/seller/products/add"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Add Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            className="h-14 w-14 rounded-xl object-cover shadow-sm"
                            src={product.image}
                            alt={product.name}
                          />
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm font-medium text-indigo-600">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {product.stock || 0} units
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Latest
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/seller/products/add"
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-white hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-lg font-semibold">Add Product</span>
              </div>
              <p className="mt-2 text-sm text-indigo-100">Add new items to your store</p>
            </Link>
            
            <Link
              to="/seller/products"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl text-white hover:from-blue-700 hover:to-cyan-700 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-lg font-semibold">Manage Products</span>
              </div>
              <p className="mt-2 text-sm text-blue-100">Edit and organize your inventory</p>
            </Link>
            
            <Link
              to="/seller/orders"
              className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 p-6 rounded-xl text-white hover:from-gray-600 hover:to-gray-700 transform transition-all duration-200 hover:scale-105 shadow-lg opacity-75 cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-lg font-semibold">View Orders</span>
              </div>
              <p className="mt-2 text-sm text-gray-200">Manage customer orders</p>
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Coming Soon
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
