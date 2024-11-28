import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const OrderHistory = () => {
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-02-15',
      unitNumber: 'A-123',
      floorPlan: 'Investor',
      status: 'completed',
      totalItems: 12,
      paymentStatus: 'paid'
    },
    {
      id: 'ORD-002',
      date: '2024-02-20',
      unitNumber: 'B-456',
      floorPlan: 'Custom',
      status: 'pending',
      totalItems: 8,
      paymentStatus: 'awaiting'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>My Orders</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.unitNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.floorPlan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-sm px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#005670' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;