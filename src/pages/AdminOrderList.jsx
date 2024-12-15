import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminOrderList = ({ onOrderClick }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders?search=${searchTerm}&status=${filterStatus}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepLabel = (step) => {
    const steps = {
      1: 'Choose Floor Plan',
      2: 'Design Your Space',
      3: 'Review Order',
      4: 'Payment Schedule'
    };
    return steps[step] || 'Unknown Step';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-medium mb-6 text-[#005670]">Order Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Step</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{order.clientInfo?.name}</td>
                  <td className="px-6 py-4">{order.selectedPlan?.title}</td>
                  <td className="px-6 py-4">{getStepLabel(order.step)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onOrderClick(order._id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderList;