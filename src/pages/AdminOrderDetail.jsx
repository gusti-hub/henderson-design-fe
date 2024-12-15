import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { backendServer } from '../utils/info';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-2">Confirm Payment Status Update</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action?.status} this payment? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminOrderDetail = ({ orderId, setActiveMenu }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = (installmentIndex, status) => {
    setPendingAction({ installmentIndex, status });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendServer}/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          installmentIndex: pendingAction.installmentIndex,
          status: pendingAction.status === 'approve' ? 'verified' : 'rejected'
        })
      });
      fetchOrderDetails();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update payment status');
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveMenu('/orders')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-medium text-[#005670]">Order Details</h2>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-medium mb-4">Client Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{order.clientInfo?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Number</p>
            <p className="font-medium">{order.clientInfo?.unitNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-medium mb-4">Order Details</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Floor Plan</p>
            <p className="font-medium">{order.selectedPlan?.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{order.status}</p>
          </div>
        </div>

        <h4 className="font-medium mb-4">Selected Products</h4>
        <div className="space-y-4">
          {order.designSelections?.selectedProducts?.map((product, index) => (
            <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
              {product.variants?.length > 0 && (
                <img
                  src={product.variants[0]?.image?.url || '/placeholder.png'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">Product ID: {product._id}</p>
                <p className="text-sm text-gray-600">Location: {product.spotName}</p>
                <p className="text-[#005670] font-medium mt-1">
                  ${product.finalPrice?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Payment Schedule</h3>
        <div className="space-y-6">
          {order.paymentDetails?.installments?.map((installment, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium">
                    {index === 0 ? 'First Payment (25%)' :
                     index === 1 ? 'Second Payment (50%)' :
                     'Final Payment (25%)'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-[#005670] font-medium">
                    ${installment.amount.toFixed(2)}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${installment.status === 'verified' ? 'bg-green-100 text-green-800' :
                    installment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    installment.status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {installment.status}
                </span>
              </div>

              {/* Payment Proof */}
              {installment.proofOfPayment && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Upload Date: {new Date(installment.proofOfPayment.uploadDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">
                        File: {installment.proofOfPayment.filename}
                      </p>
                    </div>
                    <a 
                      href={installment.proofOfPayment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#005670] hover:text-[#004560] font-medium text-sm"
                    >
                      View Proof
                    </a>
                  </div>
                </div>
              )}

              {/* Verification Buttons */}
              {installment.status === 'uploaded' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePaymentAction(index, 'approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handlePaymentAction(index, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        action={pendingAction}
      />
    </div>
  );
};

export default AdminOrderDetail;