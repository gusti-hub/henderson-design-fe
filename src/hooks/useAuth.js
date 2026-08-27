// src/hooks/useAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { isTokenValid, getAuthUser, getTokenExpiresIn, clearAuth } from '../utils/auth';
import { backendServer } from '../utils/info';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const logoutTimerRef = useRef(null);

  const logout = useCallback((redirectTo = '/portal-login') => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    clearAuth();
    setUser(null);
    window.location.href = redirectTo;
  }, []);

  const scheduleAutoLogout = useCallback((expiresInSeconds) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Auto logout 1 menit sebelum token expire
    const logoutInMs = Math.max(0, (expiresInSeconds - 60) * 1000);

    console.log(`Session expires in ${Math.round(expiresInSeconds / 60)} minutes`);

    logoutTimerRef.current = setTimeout(() => {
      console.warn('Session expired, logging out...');
      logout();
    }, logoutInMs);
  }, [logout]);

  // Fetch latest role & permissions from server and sync to localStorage + state
  const syncRoleFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid()) return;
    try {
      const res = await fetch(`${backendServer}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const currentRole = localStorage.getItem('role');
      const currentPerms = localStorage.getItem('permissions');
      const newPerms = JSON.stringify(data.permissions || []);
      if (data.role !== currentRole || currentPerms !== newPerms) {
        localStorage.setItem('role', data.role);
        localStorage.setItem('permissions', newPerms);
        setUser(prev => prev ? { ...prev, role: data.role } : prev);
      }
    } catch {
      // Silent fail — don't interrupt the session
    }
  }, []);

  useEffect(() => {
    // Validasi saat pertama load
    if (isTokenValid()) {
      const authUser = getAuthUser();
      setUser(authUser);

      // Schedule auto-logout sesuai expiry token
      const expiresIn = getTokenExpiresIn();
      scheduleAutoLogout(expiresIn);

      // Sync role/permissions dari server saat mount
      syncRoleFromServer();
    } else {
      // Token tidak ada atau expired
      clearAuth();
      setUser(null);
    }

    setIsChecking(false);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [scheduleAutoLogout, syncRoleFromServer]);

  // Sync saat user kembali ke tab/window
  useEffect(() => {
    const handleFocus = () => syncRoleFromServer();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncRoleFromServer]);

  // Periodic sync setiap 5 menit
  useEffect(() => {
    const interval = setInterval(syncRoleFromServer, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncRoleFromServer]);

  return { user, isChecking, logout };
};
