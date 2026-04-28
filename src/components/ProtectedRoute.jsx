// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return payload.exp > Date.now() / 1000; // ← hapus buffer
};

const clearAuth = () => {
  ['token', 'userId', 'name', 'role', 'currentStep'].forEach(k =>
    localStorage.removeItem(k)
  );
};

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token    = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/portal-login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'user' ? '/client-portal' : '/admin-panel'} replace />;
  }

  return element;
};

export const PublicRoute = ({ element }) => {
  const token    = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (isTokenValid(token)) {
    return <Navigate to={userRole === 'user' ? '/client-portal' : '/admin-panel'} replace />;
  }

  return element;
};

export default ProtectedRoute;