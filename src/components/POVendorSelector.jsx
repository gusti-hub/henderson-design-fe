import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, ChevronRight, Package, DollarSign, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const POVendorSelector = ({ isOpen, onClose, orderId, orderClientInfo }) => {
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && orderId) {
      loadVendors();
    }
  }, [isOpen, orderId]);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/vendors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();

      if (result.success) {
        setVendorData(result.data);
      } else {
        setError(result.message || 'Failed to load vendor data');
      }
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPO = (vendorId) => {
    if (!vendorId) {
      alert('Cannot create PO for products without a vendor. Please assign a vendor first.');
      return;
    }
    // Open PO editor in new tab
    window.open(`/admin/purchase-order/${orderId}/${vendorId}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Purchase Orders</h3>
            <p className="text-sm text-white/80 mt-1">
              {orderClientInfo?.name ? `${orderClientInfo.name} — ` : ''}
              Select a vendor to create or view a Purchase Order
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(85vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
              <button
                onClick={loadVendors}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : !vendorData?.vendors?.length ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products found in this order</p>
              <p className="text-sm text-gray-400 mt-1">
                Add products to the order first before creating purchase orders.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {vendorData.vendors.map((group, idx) => (
                <div
                  key={group.vendorId || `no-vendor-${idx}`}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {group.vendorName?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {group.vendorName}
                          </h4>
                          {group.vendorInfo?.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {group.vendorInfo.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Product count & amount */}
                      <div className="flex items-center gap-4 ml-[52px]">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Package className="w-3 h-3" />
                          {group.productCount} product{group.productCount !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          <DollarSign className="w-3 h-3" />
                          ${group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>

                        {/* Latest PO status */}
                        {group.latestPO && (
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                            group.latestPO.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            group.latestPO.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            group.latestPO.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <FileText className="w-3 h-3" />
                            PO v{group.latestPO.version} — {group.latestPO.status}
                          </span>
                        )}
                      </div>

                      {/* Product names preview */}
                      <div className="ml-[52px] mt-2">
                        <p className="text-xs text-gray-400 truncate">
                          {group.products.map(p => p.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => handleOpenPO(group.vendorId)}
                      disabled={!group.vendorId}
                      className={`ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                        group.vendorId
                          ? 'bg-[#005670] hover:bg-[#004558] text-white shadow-sm hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {group.latestPO ? 'View PO' : 'Create PO'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POVendorSelector;