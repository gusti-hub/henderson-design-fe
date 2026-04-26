// src/utils/fetchWithAuth.js
import { backendServer } from './info';
import { clearAuth } from './auth';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${backendServer}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Token rejected oleh backend → paksa logout
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/portal-login';
    return null; // return null supaya caller tidak crash
  }

  return response;
};