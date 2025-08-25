import { useParams, useNavigate } from 'react-router-dom';
import { useBuyerOrderDetails } from '../hooks/useBuyerOrders';
import { formatPrice } from '../utils/currency';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 'confirmed':
      return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
    case 'shipped':
      return <TruckIcon className="h-6 w-6 text-purple-500" />;
    case 'delivered':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'cancelled':
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    default:
      return <ClockIcon className="h-6 w-6 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const { orderDetails, isLoading, error } = useBuyerOrderDetails(orderId || null);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading order details</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{orderDetails.id}</h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Placed on {formatDate(orderDetails.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(orderDetails.status)}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusColor(orderDetails.status)}`}>
              {orderDetails.status}
            </span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(orderDetails.total_amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
              <p className="text-sm text-gray-900">Paid</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Delivery Status</h3>
              <p className="text-sm text-gray-900 capitalize">{orderDetails.status}</p>
            </div>
          </div>
          
          {orderDetails.shipping_address && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <MapPinIcon className="h-4 w-4 mr-2" />
                Shipping Address
              </h3>
              <p className="text-sm text-gray-900">{orderDetails.shipping_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
            orderDetails.orderItems.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {item.product.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Quantity: {item.quantity}</span>
                      <span>Unit Price: {formatPrice(item.unit_price)}</span>
                      {item.product.seller && (
                        <span>Seller: {item.product.seller.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatPrice(item.total_price)}
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback to main product if no order items
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={orderDetails.products.image}
                  alt={orderDetails.products.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {orderDetails.products.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {orderDetails.products.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Quantity: {orderDetails.quantity}</span>
                    <span>Unit Price: {formatPrice(orderDetails.products.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    {formatPrice(orderDetails.total_amount)}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Timeline</h2>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Order placed
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={orderDetails.created_at}>
                          {formatDate(orderDetails.created_at)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              
              {orderDetails.status !== 'pending' && (
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Order confirmed
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={orderDetails.updated_at}>
                            {formatDate(orderDetails.updated_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {(orderDetails.status === 'shipped' || orderDetails.status === 'delivered') && (
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                          <TruckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Order shipped
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={orderDetails.updated_at}>
                            {formatDate(orderDetails.updated_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {orderDetails.status === 'delivered' && (
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center ring-8 ring-white">
                          <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Order delivered
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={orderDetails.updated_at}>
                            {formatDate(orderDetails.updated_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {orderDetails.status === 'cancelled' && (
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
                          <XCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Order cancelled
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={orderDetails.updated_at}>
                            {formatDate(orderDetails.updated_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
