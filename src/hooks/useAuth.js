// src/hooks/useAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { isTokenValid, getAuthUser, getTokenExpiresIn, clearAuth } from '../utils/auth';

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

  useEffect(() => {
    // Validasi saat pertama load
    if (isTokenValid()) {
      const authUser = getAuthUser();
      setUser(authUser);

      // Schedule auto-logout sesuai expiry token
      const expiresIn = getTokenExpiresIn();
      scheduleAutoLogout(expiresIn);
    } else {
      // Token tidak ada atau expired
      clearAuth();
      setUser(null);
    }

    setIsChecking(false);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [scheduleAutoLogout]);

  return { user, isChecking, logout };
};