import React from 'react';
import UserDesignFlow from '../components/design-flow/UserDesignFlow';
import { backendServer } from '../utils/info';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#005670] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-light">HENDERSON</h1>
            <p className="text-sm opacity-80">DESIGN GROUP</p>
          </div>
          <div className="flex items-center gap-4">
            <span>{localStorage.getItem('name')}</span>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <UserDesignFlow />
    </div>
  );
};

export default UserDashboard;