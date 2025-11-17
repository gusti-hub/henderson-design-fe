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
import { 
  Loader2, Users, Clock, Activity, ShoppingCart, 
  CheckCircle, DollarSign, Download, Eye, Circle 
} from 'lucide-react';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedOrders(checked ? stats.recentOrders.map(order => order._id) : []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of your business metrics</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.overview?.totalOrders || 0}
          icon={ShoppingCart}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Ongoing Orders"
          value={stats.overview?.ongoingOrders || 0}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Completed Orders"
          value={stats.overview?.completedOrders || 0}
          icon={CheckCircle}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.overview?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActivityCard
          title="Active Users"
          value={activityData.activeUsers}
          icon={Users}
          color="blue"
        />
        <ActivityCard
          title="Today's Visits"
          value={activityData.todayVisits}
          icon={Clock}
          color="cyan"
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {activityData.recentActivity.length > 0 ? (
              activityData.recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{activity.action}</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Ongoing', value: stats.orderDistribution?.ongoing || 0 },
                { name: 'Review', value: stats.orderDistribution?.review || 0 },
                { name: 'Confirmed', value: stats.orderDistribution?.confirmed || 0 },
                { name: 'Completed', value: stats.orderDistribution?.completed || 0 }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="value" fill="#005670" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="quantity" fill="#007a9a" name="Quantity" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <button
            onClick={handleDownloadPO}
            disabled={selectedOrders.length === 0 || downloadLoading}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all ${
              selectedOrders.length === 0 || downloadLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white hover:shadow-lg'
            }`}
          >
            {downloadLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download PO ({selectedOrders.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === stats?.recentOrders?.length && stats?.recentOrders?.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleOrderSelect(order._id)}
                      className="rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.clientName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
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

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

// Activity Card Component
const ActivityCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    cyan: 'from-cyan-500 to-teal-600',
    purple: 'from-purple-500 to-pink-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    completed: { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      icon: CheckCircle, 
      label: 'Completed' 
    },
    confirmed: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      icon: CheckCircle, 
      label: 'Confirmed' 
    },
    ongoing: { 
      bg: 'bg-amber-100', 
      text: 'text-amber-700', 
      icon: Clock, 
      label: 'Ongoing' 
    },
    review: { 
      bg: 'bg-purple-100', 
      text: 'text-purple-700', 
      icon: Eye, 
      label: 'Review' 
    }
  }[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    icon: Circle, 
    label: status 
  };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default Dashboard;