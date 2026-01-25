// ============================================================
// Admin Install Binder Route Page
// Create new file: pages/AdminInstallBinder.jsx
// Pattern: Same as Proposal - displays HTML in browser only
// ============================================================

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { backendServer } from '../utils/info';

const AdminInstallBinder = () => {
  const { orderId } = useParams();

  useEffect(() => {
    const fetchAndDisplayInstallBinder = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
          `${backendServer}/api/orders/${orderId}/install-binder`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load install binder');
        }

        const html = await response.text();
        
        // Replace entire document with the returned HTML
        document.open();
        document.write(html);
        document.close();
      } catch (err) {
        console.error('Error loading install binder:', err);
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 16px;">Error Loading Install Binder</h2>
              <p style="color: #6b7280; margin-bottom: 24px;">${err.message}</p>
              <button 
                onclick="window.close()" 
                style="padding: 12px 24px; background: #374151; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;"
              >
                Close Window
              </button>
            </div>
          </div>
        `;
      }
    };

    if (orderId) {
      fetchAndDisplayInstallBinder();
    }
  }, [orderId]);

  // Show loading state briefly before content loads
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#005670',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', fontWeight: '500' }}>Loading Install Binder...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminInstallBinder;