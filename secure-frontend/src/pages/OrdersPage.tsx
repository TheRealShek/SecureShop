import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import { useBuyerOrders, useFilteredOrders } from '../hooks/useBuyerOrders';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case 'confirmed':
      return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    case 'shipped':
      return <TruckIcon className="h-5 w-5 text-purple-500" />;
    case 'delivered':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  // Fetch buyer orders using the custom hook
  const { orders, orderStats, isLoading, error, refetch } = useBuyerOrders();
  
  // Filter orders based on selected filter
  const filteredOrders = useFilteredOrders(orders, filter);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900">My Orders</h1>
          <p className="text-lg text-slate-600 mt-3">Track and manage your order history</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
            <nav className="flex space-x-1">
              {[
                { key: 'all', label: 'All Orders', count: orderStats.total },
                { key: 'pending', label: 'Pending', count: orderStats.pending },
                { key: 'confirmed', label: 'Confirmed', count: orderStats.confirmed },
                { key: 'shipped', label: 'Shipped', count: orderStats.shipped },
                { key: 'delivered', label: 'Delivered', count: orderStats.delivered },
                { key: 'cancelled', label: 'Cancelled', count: orderStats.cancelled }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`${
                    filter === tab.key
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-transparent'
                  } flex-1 px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 border`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`${
                      filter === tab.key ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    } inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[1.5rem] h-6`}>
                      {tab.count}
                    </span>
                  )}
                </button>
            ))}
          </nav>
        </div>
      </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-slate-300 mb-6">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600">
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filter} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {filteredOrders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Order Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                        <p className="text-sm text-slate-600">Placed on {formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatPrice(order.total_amount)}</p>
                      <p className="text-sm text-slate-500">Total</p>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.products.image}
                      alt={order.products.name}
                      className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {order.products.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        Quantity: {order.quantity} × {formatPrice(order.products.price)}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {order.products.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="inline-flex items-center px-4 py-2.5 border border-slate-300 shadow-sm text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
