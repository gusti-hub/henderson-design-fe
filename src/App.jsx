// App.js - FIXED VERSION
import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';

// Import your components
import BrochureLandingPage from './pages/BrochureLandingPage';
import PortalLogin from './components/PortalLogin';
import ClientPortal from './components/ClientPortal';
import AdminPanel from './pages/AdminPanel';
import InvoiceHTML from './components/InvoiceHTML';
import QuickBooksConnect from './components/QuickBooksConnect';
import AgreementViewer from './components/AgreementViewer';
import ProposalEditor from './components/ProposalEditor';

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

// ✅ NEW: Wrapper component untuk ProposalEditor
const ProposalEditorWrapper = () => {
  const { orderId, version } = useParams();
  
  return (
    <AdminProtectedRoute>
      <ProposalEditor 
        orderId={orderId}
        version={version}
        onClose={() => window.close()}
      />
    </AdminProtectedRoute>
  );
};

function App() {
  return (
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
      
      {/* Invoice Route */}
      <Route 
        path="/invoice/:clientId/:invoiceNumber" 
        element={<InvoiceHTML />} 
      />
      
      {/* ✅ FIXED: Proposal Editor Route */}
      <Route 
        path="/admin/proposal/:orderId/:version?" 
        element={<ProposalEditorWrapper />}
      />

      {/* QuickBooks Route */}
      <Route 
        path="/admin/quickbooks" 
        element={
          <AdminProtectedRoute>
            <QuickBooksConnect />
          </AdminProtectedRoute>
        } 
      />
      
      {/* Agreement Route */}
      <Route 
        path="/agreement/:clientId/:agreementNumber" 
        element={<AgreementViewer />} 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;