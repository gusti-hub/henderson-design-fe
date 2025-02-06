import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Loader2, Users, Clock, Activity } from 'lucide-react';
import { backendServer } from '../utils/info';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState({
    activeUsers: 0,
    todayVisits: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendServer}/api/activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setActivityData(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivityData();
    const interval = setInterval(fetchActivityData, 30000);
    return () => clearInterval(interval);
  }, []);


  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allOrderIds = stats.recentOrders.map(order => order._id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleDownloadPO = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }

    try {
      setDownloadLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/dashboard/purchase-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderIds: selectedOrders })
      });

      if (!response.ok) throw new Error('Failed to generate PO');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase-order-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PO:', error);
      alert('Error generating Purchase Order');
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
      </div>
    );
  }

  const ActivitySection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#005670]" />
          <h3 className="text-gray-500 text-sm">Active Users</h3>
        </div>
        <p className="text-2xl font-semibold mt-2">{activityData.activeUsers}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#005670]" />
          <h3 className="text-gray-500 text-sm">Today's Visits</h3>
        </div>
        <p className="text-2xl font-semibold mt-2">{activityData.todayVisits}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#005670]" />
          <h3 className="text-gray-500 text-sm">Recent Activity</h3>
        </div>
        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
          {activityData.recentActivity.map((activity, index) => (
            <div key={index} className="text-sm flex justify-between items-center py-1 border-b">
              <span>{activity.action}</span>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#005670] text-center">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-semibold mt-2">{stats.overview?.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Ongoing Orders</h3>
          <p className="text-2xl font-semibold mt-2">{stats.overview?.ongoingOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Completed Orders</h3>
          <p className="text-2xl font-semibold mt-2">{stats.overview?.completedOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-semibold mt-2">${stats.overview?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Activity Section */}
      <ActivitySection />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-center">Order Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Ongoing', value: stats.orderDistribution?.ongoing || 0 },
                { name: 'Confirmed', value: stats.orderDistribution?.confirmed || 0 },
                { name: 'Completed', value: stats.orderDistribution?.completed || 0 }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#005670" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-center">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#005670" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders with Selection */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full text-center">
            <h3 className="text-lg font-medium">Recent Orders</h3>
          </div>
          <button
            onClick={handleDownloadPO}
            disabled={selectedOrders.length === 0 || downloadLoading}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 min-w-[250px] justify-center whitespace-nowrap ${
              selectedOrders.length === 0 || downloadLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#005670] text-white hover:bg-opacity-90'
            }`}
          >
            {downloadLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Download Selected PO</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
                    checked={selectedOrders.length === stats?.recentOrders?.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleOrderSelect(order._id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{order._id}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{order.clientName}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
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

export default Dashboard;