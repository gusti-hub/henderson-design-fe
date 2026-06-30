// App.jsx - CLEAN VERSION
import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';

import BrochureLandingPage from './pages/BrochureLandingPage';
import PortalLogin from './components/PortalLogin';
import ClientPortal from './components/ClientPortal';
import AdminPanel from './pages/AdminPanel';
import InvoiceHTML from './components/InvoiceHTML';
import QuickBooksConnect from './components/QuickBooksConnect';
import AgreementViewer from './components/AgreementViewer';
import ProposalEditor from './components/ProposalEditor';
import AdminInstallBinder from './pages/AdminInstallBinder';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute'; // ← pakai ini

// ─── Hapus ClientProtectedRoute & AdminProtectedRoute yang lama ───────────────

const ProposalEditorWrapper = () => {
  const { orderId, version } = useParams();
  return (
    <ProtectedRoute allowedRoles={['admin', 'designer']} element={
      <ProposalEditor orderId={orderId} version={version} onClose={() => window.close()} />
    } />
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<BrochureLandingPage />} />

      <Route path="/portal-login" element={<PublicRoute element={<PortalLogin />} />} />
      <Route path="/designer-login" element={<Navigate to="/portal-login" replace />} />

      <Route path="/client-portal" element={
        <ProtectedRoute element={<ClientPortal />} allowedRoles={['user']} />
      } />

      <Route path="/admin-panel" element={
        <ProtectedRoute element={<AdminPanel />} allowedRoles={['admin', 'designer']} />
      } />

      <Route path="/invoice/:clientId/:invoiceNumber" element={<InvoiceHTML />} />

      <Route path="/admin/proposal/:orderId/:version?" element={<ProposalEditorWrapper />} />

      <Route path="/admin/quickbooks" element={
        <ProtectedRoute element={<QuickBooksConnect />} allowedRoles={['admin', 'designer']} />
      } />

      <Route path="/agreement/:clientId/:agreementNumber" element={<AgreementViewer />} />
      <Route path="/admin/install-binder/:orderId" element={<AdminInstallBinder />} />
      <Route path="/admin/purchase-order/:orderId/:vendorId/:version?" element={<PurchaseOrderPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;