// App.js - CORRECTED VERSION
// NO BrowserRouter here because it's already in main.jsx!

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import BrochureLandingPage from './pages/BrochureLandingPage';
import PortalLogin from './components/PortalLogin';
import ClientPortal from './components/ClientPortal';
import AdminPanel from './pages/AdminPanel';

// ✅ Protected Route untuk Client
const ClientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/portal-login" replace />;
  }
  
  if (role !== 'user') {
    return <Navigate to="/portal-login" replace />;
  }
  
  return children;
};

// ✅ Protected Route untuk Admin/Designer
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/portal-login" replace />;
  }
  
  if (role !== 'admin' && role !== 'designer') {
    return <Navigate to="/portal-login" replace />;
  }
  
  return children;
};

function App() {
  return (
    // ⚠️ NO <BrowserRouter> or <Router> here!
    // Just <Routes> because Router is already in main.jsx
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<BrochureLandingPage />} />
      <Route path="/portal-login" element={<PortalLogin />} />
      
      {/* Backward compatibility */}
      <Route path="/designer-login" element={<Navigate to="/portal-login" replace />} />
      
      {/* Protected Client Route */}
      <Route 
        path="/client-portal" 
        element={
          <ClientProtectedRoute>
            <ClientPortal />
          </ClientProtectedRoute>
        } 
      />
      
      {/* Protected Admin Route */}
      <Route 
        path="/admin-panel" 
        element={
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;