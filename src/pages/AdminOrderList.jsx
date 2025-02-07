import React, { useState, useEffect } from 'react';
import { Eye, Loader2, Download, FileText } from 'lucide-react';
import { backendServer } from '../utils/info';
import Pagination from '../components/common/Pagination';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded-lg flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span>Downloading...</span>
    </div>
  </div>
);


const AdminOrderList = ({ onOrderClick }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterStatus, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId, type) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/${type}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download ${type}`);
      }
  
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      
      let fileExtension = contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        ? 'xlsx' 
        : 'pdf';
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${type}-${orderId}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Failed to download ${type}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };
  

  const getOrderStatus = (order) => {
    // If order has a status, use it directly
    if (order.status) {
      return order.status.charAt(0).toUpperCase() + order.status.slice(1);
    }
  
    // Fallback to step-based status
    switch (order.step) {
      case 1:
        return 'Floor Plan Selection';
      case 2:
        return 'Space Design';
      case 3:
        return 'Order Review';
      case 4:
        return 'Payment Schedule';
      default:
        return 'In Progress';
    }
  };
  

  return (
    <div className="p-6">
      {downloading && <LoadingOverlay />}
      <h2 className="text-2xl font-medium mb-6 text-[#005670]">Order Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by client name or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">all status</option>
          <option value="completed">completed</option>
          <option value="ongoing">ongoing</option>
          <option value="confirmed">confirmed</option>
          <option value="cancelled">cancelled</option>
          <option value="review">review</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{order.clientInfo?.name}</td>
                    <td className="px-6 py-4">{order.selectedPlan?.title}</td>
                    <td className="px-6 py-4">{getOrderStatus(order)}</td>
                    <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOrderClick(order._id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(order._id, 'summary')}
                      className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      title="Download Summary (Excel)"
                    >
                      <Download className="w-5 h-5" />
                      {/* Optional: Add text */}
                      <span className="text-sm">Excel</span>
                    </button>
                    <button
                      onClick={() => handleDownload(order._id, 'proposal')}
                      className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      title="Download Proposal (PDF)"
                    >
                      <FileText className="w-5 h-5" />
                      {/* Optional: Add text */}
                      <span className="text-sm">PDF</span>
                    </button>
                  </div>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};


export default AdminOrderList;