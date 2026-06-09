import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, ChevronRight, Package, AlertCircle, ClipboardList } from 'lucide-react';
import { backendServer } from '../utils/info';

const displayOrderName = (order) => {
  const label = order?.orderLabel?.trim();
  if (label) {
    const m = label.match(/^phase\s*(\d+)$/i);
    if (m) return `Order #${m[1]}`;
    return label;
  }
  return `Order #${order?.orderNumber ?? '?'}`;
};

const ProposalOrderSelector = ({ isOpen, onClose, clientId, clientInfo }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && clientId) loadOrders();
  }, [isOpen, clientId]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.orders || [];
        if (list.length === 1) {
          // Only one order — skip the picker, open directly
          window.open(`/admin/proposal/${list[0]._id}`, '_blank');
          onClose();
          return;
        }
        setOrders(list);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (orderId) => {
    window.open(`/admin/proposal/${orderId}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Proposal Editor</h3>
            <p className="text-sm text-white/80 mt-1">
              {clientInfo?.name ? `${clientInfo.name} — ` : ''}
              Select which Order to open the Proposal for
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(80vh-96px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
              <button onClick={loadOrders} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found for this client</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => {
                const itemCount = (order.selectedProducts || []).length;
                const orderName = displayOrderName(order);
                return (
                  <div key={order._id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900">{orderName}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-12 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Package className="w-3 h-3" />
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                          {order.proposalNumber ? (
                            <span className="inline-flex items-center gap-1 text-xs text-[#005670] bg-[#005670]/8 px-2 py-0.5 rounded-full font-mono font-semibold">
                              <FileText className="w-3 h-3" />
                              {order.proposalNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No proposal yet</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpen(order._id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md shrink-0"
                      >
                        {order.proposalNumber ? 'Open Proposal' : 'Create Proposal'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalOrderSelector;
