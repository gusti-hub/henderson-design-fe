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
  FileText
} from 'lucide-react';
import UserManagement from './UserManagement';
import Profile from './Profile';
import AdminOrderManagement from './AdminOrderManagement';
import ClientManagement from './ClientManagement';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('/dashboard');
  const [showHelp, setShowHelp] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    try {
      // Clear all localStorage items
      localStorage.clear();
      
      // Force a page refresh and redirect
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout method
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'User Management', path: '/user-management' },
    { icon: Users, label: 'Client Management', path: '/client-management' },
    { divider: true },
    { icon: User, label: 'Profile', path: '/profile' },
    { divider: true },
    { icon: LogOut, label: 'Logout', path: '/logout', onClick: handleLogout }
  ];

  const handleMenuClick = (path, onClick) => {
    if (onClick) {
      onClick();
    } else {
      setActiveMenu(path);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case '/user-management':
        return <UserManagement />;
      case '/client-management':
        return <ClientManagement />;  
      case '/orders':
        return <AdminOrderManagement />;
      case '/profile':
        return <Profile />;
      default:
        return (
          <div>
            <div className="text-xl mb-4" style={{ color: '#005670' }}>
              {menuItems.find(item => item.path === activeMenu)?.label || 'Dashboard'}
            </div>
            <p className="text-neutral-600">
              Selected menu: {activeMenu}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main AdminPanel */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div 
          className="w-64 text-white min-h-screen flex flex-col" // Added flex flex-col
          style={{ backgroundColor: '#005670' }}
        >
          {/* Logo Area */}
          <div className="p-4 border-b border-white/10">
            <h1 className="text-xl font-light">HENDERSON</h1>
            <p className="text-sm opacity-80">DESIGN GROUP</p>
          </div>

          {/* Navigation Area - Now with flex-grow */}
          <div className="flex-grow flex flex-col justify-between">
            {/* Main Navigation */}
            <nav className="py-4">
              {menuItems.slice(0, -3).map((item, index) => (
                item.divider ? (
                  <div key={index} className="my-4 border-b border-white/10" />
                ) : (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path, item.onClick)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-white/90
                      transition-all duration-200 relative
                      ${activeMenu === item.path 
                        ? 'bg-white/20 text-white' 
                        : 'hover:bg-white/10'}
                    `}
                  >
                    {activeMenu === item.path && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                    )}
                    <item.icon className={`w-5 h-5 ${activeMenu === item.path ? 'text-white' : 'text-white/80'}`} />
                    <span className={`text-sm ${activeMenu === item.path ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                )
              ))}
            </nav>

            {/* Bottom Navigation - Profile and Logout */}
            <div className="mt-auto border-t border-white/10">
              {menuItems.slice(-3).map((item, index) => (
                item.divider ? (
                  <div key={index} className="my-1 border-b border-white/10" />
                ) : (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path, item.onClick)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-white/90
                      transition-all duration-200 relative
                      ${activeMenu === item.path 
                        ? 'bg-white/20 text-white' 
                        : 'hover:bg-white/10'}
                    `}
                  >
                    {activeMenu === item.path && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                    )}
                    <item.icon className={`w-5 h-5 ${activeMenu === item.path ? 'text-white' : 'text-white/80'}`} />
                    <span className={`text-sm ${activeMenu === item.path ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 bg-neutral-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;