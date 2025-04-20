import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckIcon } from '@heroicons/react/24/outline';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderToComplete, setOrderToComplete] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/order/getOrdersByVendor?vendorId=${userData.user_id}`
      );
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderToComplete) return;

    try {
      setCompleteLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order/completeOrder`,
        {
          orderId: orderToComplete._id
        }
      );

      if (response.data.success) {
        setOrders(orders.filter(order => order._id !== orderToComplete._id));
        setOrderToComplete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete order');
      console.error('Error completing order:', err);
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!orderToUpdate) return;

    try {
      setUpdateLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/order/updateOrderStatus`,
        {
          status: 'ready',
          orderId: orderToUpdate._id
        }
      );

      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderToUpdate._id 
            ? { ...order, status: 'ready' }
            : order
        ));
        setOrderToUpdate(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'confirmed':
        return 'bg-blue-900/50 text-blue-400';
      case 'ready':
        return 'bg-purple-900/50 text-purple-400';
      case 'picked_up':
        return 'bg-indigo-900/50 text-indigo-400';
      case 'delivered':
        return 'bg-green-900/50 text-green-400';
      case 'cancelled':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-gray-900/50 text-gray-400';
    }
  };

  const getStatusOrders = (status) => {
    return orders.filter(order => order.status === status);
  };

  const statusTabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'ready', label: 'Ready' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Status Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label} ({getStatusOrders(tab.id).length})
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading orders...</div>
          ) : getStatusOrders(activeTab).length > 0 ? (
            getStatusOrders(activeTab).map((order) => (
              <div
                key={order._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Order #{order._id.slice(-6)}</h3>
                    <p className="text-gray-400 mt-1">
                      Customer: {order.userName} ({order.userPhone})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-medium">₹{order.totalPrice}</p>
                    <p className="text-gray-400 text-sm">
                      Delivery by: {formatDate(order.estimatedDeliveryTime)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-gray-700/50 rounded-lg p-3">
                      <img
                        src={item.itemImg}
                        alt={item.itemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="text-white font-medium">{item.itemName}</h4>
                        <p className="text-gray-400">
                          ₹{item.itemPrice} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => setOrderToUpdate(order)}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Mark as Ready
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No {activeTab} orders found</div>
          )}
        </div>

        {/* Complete Order Confirmation Modal */}
        {orderToComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Complete Order</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to mark this order as completed? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOrderToComplete(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  disabled={completeLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteOrder}
                  disabled={completeLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {completeLoading ? 'Completing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Order Status Modal */}
        {orderToUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Update Order Status</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to mark this order as ready?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOrderToUpdate(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrderStatus}
                  disabled={updateLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Mark as Ready'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 