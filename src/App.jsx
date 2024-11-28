import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './context/CommonContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
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
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to={userRole === 'admin' ? '/admin-panel' : '/dashboard'} /> : 
              <Login />
          } 
        />
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
      </Routes>
    </AppProvider>
  );
}

export default App;