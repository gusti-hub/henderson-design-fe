// src/components/ProtectedRoute.jsx
import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// ─── JWT decode (tanpa library) ──────────────────────────────────────────────
const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenValid = (token, bufferSeconds = 60) => {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return payload.exp > Date.now() / 1000 + bufferSeconds;
};

const clearAuth = () => {
  ['token', 'userId', 'name', 'role', 'currentStep'].forEach(k =>
    localStorage.removeItem(k)
  );
};

// ─── Auto-logout timer ────────────────────────────────────────────────────────
const useAutoLogout = (token) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload?.exp) return;

    // Logout tepat saat token expire
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) return;

    timerRef.current = setTimeout(() => {
      clearAuth();
      window.location.href = '/portal-login';
    }, msUntilExpiry);

    return () => clearTimeout(timerRef.current);
  }, [token]);
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Schedule auto-logout sesuai expiry JWT
  useAutoLogout(token);

  // Token tidak ada atau sudah expired
  if (!isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/portal-login" replace />;
  }

  // Role tidak diizinkan
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'user' ? '/client-portal' : '/admin-panel'} replace />;
  }

  return element;
};


const PublicRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (isTokenValid(token)) {
    // Sudah login → redirect ke halaman yang sesuai
    return <Navigate to={userRole === 'user' ? '/client-portal' : '/admin-panel'} replace />;
  }

  return element;
};

export { PublicRoute };
export default ProtectedRoute;