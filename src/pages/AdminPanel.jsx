import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MapPin, 
  Store, 
  UserCog, 
  BarChart2, 
  Calculator, 
  Users, 
  AlertCircle,
  RefreshCcw,
  Tags,
  User,
  HelpCircle,
  LogOut,
  FileText,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import UserManagement from './UserManagement';
import Profile from './Profile';
import AdminOrderList from './AdminOrderList';
import AdminOrderDetail from './AdminOrderDetail';
import ClientManagement from './ClientManagement';
import ProductConfiguration from './ProductConfiguration';
import ProductMapping from './ProductMapping';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('/dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (!token) {
      window.location.href = '/';
    }
    if (userName) {
      setAdminName(userName);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    { 
      icon: FileText, 
      label: 'Orders', 
      path: '/orders',
      description: 'Manage client orders'
    },
    { 
      icon: Users, 
      label: 'User Management', 
      path: '/user-management',
      description: 'Admin users & roles'
    },
    { 
      icon: Users, 
      label: 'Client Management', 
      path: '/client-management',
      description: 'Client accounts & journey'
    },
    { 
      icon: Store, 
      label: 'Product Config', 
      path: '/product',
      description: 'Product settings'
    },
    { 
      icon: MapPin, 
      label: 'Product Mapping', 
      path: '/product-mapping',
      description: 'Location mapping'
    }
  ];

  const bottomMenuItems = [
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      description: 'Your account'
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      path: '/logout', 
      onClick: handleLogout,
      description: 'Sign out'
    }
  ];

  const handleMenuClick = (path, onClick) => {
    if (onClick) {
      onClick();
    } else {
      setActiveMenu(path);
    }
  };

  const getPageTitle = () => {
    if (activeMenu.startsWith('/orders/')) {
      return 'Order Details';
    }
    const item = [...menuItems, ...bottomMenuItems].find(item => item.path === activeMenu);
    return item?.label || 'Dashboard';
  };

  const renderContent = () => {
    if (activeMenu.startsWith('/orders/')) {
      const orderId = activeMenu.split('/orders/')[1];
      return <AdminOrderDetail orderId={orderId} setActiveMenu={setActiveMenu} />;
    }
  
    switch (activeMenu) {
      case '/dashboard':
        return <Dashboard />;
      case '/user-management':
        return <UserManagement />;
      case '/client-management':
        return <ClientManagement />;  
      case '/orders':
        return <AdminOrderList onOrderClick={(orderId) => setActiveMenu(`/orders/${orderId}`)} />;
      case '/profile':
        return <Profile />;
      case '/product':
        return <ProductConfiguration />;
      case '/product-mapping':
        return <ProductMapping />;  
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#005670] to-[#007a9a] shadow-lg">
        <div className="flex items-center justify-between p-4">
          <img 
            src="/images/HDG-Logo.png" 
            alt="Henderson Design Group" 
            className="h-8 w-auto brightness-0 invert"
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-screen lg:pt-0 pt-16">
        {/* Sidebar */}
        <aside 
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:sticky top-0 left-0 h-screen
            w-72 bg-gradient-to-b from-[#005670] to-[#004a5a]
            shadow-2xl transition-transform duration-300 ease-in-out
            z-40 flex flex-col
          `}
        >
          {/* Logo Area */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src="/images/HDG-Logo.png" 
                alt="Henderson Design Group" 
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{adminName}</p>
                  <p className="text-white/60 text-xs">Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = activeMenu === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path, item.onClick)}
                    className={`
                      w-full group relative overflow-hidden rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-white text-[#005670] shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#005670] to-[#007a9a] rounded-r-full"></div>
                      )}
                      
                      {/* Icon */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-gradient-to-br from-[#005670] to-[#007a9a]' 
                          : 'bg-white/5 group-hover:bg-white/10'}
                      `}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-semibold ${isActive ? '' : 'group-hover:text-white'}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-[#005670]/60' : 'text-white/40 group-hover:text-white/60'}`}>
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-[#005670]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-white/10 p-3">
            <div className="space-y-1">
              {bottomMenuItems.map((item, index) => {
                const isActive = activeMenu === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path, item.onClick)}
                    className={`
                      w-full group relative overflow-hidden rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-white text-[#005670] shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {/* Icon */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-gradient-to-br from-[#005670] to-[#007a9a]' 
                          : 'bg-white/5 group-hover:bg-white/10'}
                      `}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-semibold ${isActive ? '' : 'group-hover:text-white'}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-[#005670]/60' : 'text-white/40 group-hover:text-white/60'}`}>
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow for logout */}
                      {item.path === '/logout' && (
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#005670]' : 'text-white/60'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Henderson Design Group Admin Portal
                  </p>
                </div>
                
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-[1600px] mx-auto">
              {renderContent()}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
                <p className="hidden sm:block">Admin Portal v2.0</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;