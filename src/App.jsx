import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './context/CommonContext';
import ProtectedRoute from './components/ProtectedRoute';
import BrochureLandingPage from './pages/BrochureLandingPage';
import DesignerLogin from './pages/DesignerLogin';
import ClientPortal from './pages/ClientPortal';
import ClientRegistration from './pages/ClientRegistration';
import AdminPanel from './pages/AdminPanel';
import UserDashboard from './pages/UserDashboard';
import AutoLogout from './utils/AutoLogout';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  return (
    <AppProvider>
      <AutoLogout />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BrochureLandingPage />} />
        <Route path="/designer-login" element={<DesignerLogin />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/register" element={<ClientRegistration />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin-panel/*" 
          element={
            <ProtectedRoute 
              element={<AdminPanel />} 
              allowedRoles={['admin']} 
            />
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute 
              element={<UserDashboard />} 
              allowedRoles={['user']} 
            />
          } 
        />

        {/* Redirect old login route to new designer login */}
        <Route 
          path="/login" 
          element={<Navigate to="/designer-login" replace />} 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
