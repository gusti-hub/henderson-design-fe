import React, { useState, useEffect } from 'react';
import { Download, Check, X, Eye } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add status filter dropdown
  const StatusFilter = () => (
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none"
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="completed">Completed</option>
    </select>
  );


  const handlePaymentStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadPDF = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>Order Management</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SearchFilter
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search by order ID or client name..."
        />
        <StatusFilter />
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4">{order.clientInfo.name}</td>
                <td className="px-6 py-4 capitalize">{order.selectedPlan}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">
                  {order.paymentStatus === 'pending' ? (
                    <div className="flex space-x-2">
                      <button onClick={() => handlePaymentStatus(order._id, 'approved')} 
                        className="text-green-600 hover:text-green-800">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handlePaymentStatus(order._id, 'rejected')}
                        className="text-red-600 hover:text-red-800">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span className={order.paymentStatus === 'approved' ? 'text-green-600' : 'text-red-600'}>
                      {order.paymentStatus}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => downloadPDF(order._id)}
                      className="text-gray-600 hover:text-gray-800">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Client Information</h4>
                <p>Name: {selectedOrder.clientInfo.name}</p>
                <p>Unit: {selectedOrder.clientInfo.unitNumber}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Order Details</h4>
                <p>Floor Plan: {selectedOrder.selectedPlan}</p>
                <p>Status: {selectedOrder.status}</p>
                <p>Payment Status: {selectedOrder.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;