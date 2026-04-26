// src/utils/auth.js

/**
 * Decode JWT payload tanpa library (JWT adalah base64url encoded)
 */
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // base64url → base64 → decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Cek apakah token valid dan belum expired
 * @param {number} bufferSeconds - Anggap expired X detik sebelum exp (default 60s)
 */
export const isTokenValid = (bufferSeconds = 60) => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;

  const nowInSeconds = Date.now() / 1000;
  return payload.exp > nowInSeconds + bufferSeconds;
};

/**
 * Ambil info user dari localStorage
 */
export const getAuthUser = () => {
  const token = localStorage.getItem('token');
  if (!isTokenValid()) return null;

  return {
    token,
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
    role: localStorage.getItem('role'),
  };
};

/**
 * Berapa detik lagi token expire
 */
export const getTokenExpiresIn = () => {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  const payload = decodeToken(token);
  if (!payload?.exp) return 0;

  return Math.max(0, payload.exp - Date.now() / 1000);
};

/**
 * Clear semua auth data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('name');
  localStorage.removeItem('role');
  localStorage.removeItem('currentStep');
};