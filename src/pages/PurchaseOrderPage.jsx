import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PurchaseOrderEditor from '../components/PurchaseOrderEditor';

const PurchaseOrderPage = () => {
  const { orderId, vendorId, version } = useParams();
  const navigate = useNavigate();

  return (
    <PurchaseOrderEditor
      orderId={orderId}
      vendorId={vendorId}
      version={version || null}
      onClose={() => navigate('/admin/orders')}
    />
  );
};

export default PurchaseOrderPage;