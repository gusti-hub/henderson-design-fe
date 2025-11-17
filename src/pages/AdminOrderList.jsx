import React, { useState, useEffect } from 'react';
import {
  Eye,
  Loader2,
  Download,
  FileText,
  Edit2,
  ArrowLeft,
  X,
  Check,
  Search,
  User,
} from 'lucide-react';
import { backendServer } from '../utils/info';
import AreaCustomization from '../components/design-flow/AreaCustomization';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
    <div className="bg-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
      <Loader2 className="w-6 h-6 animate-spin text-[#005670]" />
      <span className="text-sm font-medium text-gray-700">Processing...</span>
    </div>
  </div>
);

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Proposal Generated</h3>
            <p className="text-xs text-white/80 mt-1">
              A new proposal version has been created.
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
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Proposal Generated Successfully
            </h4>
            <p className="text-sm text-gray-500 mt-2">
              The proposal has been generated and saved as a new version for this order.
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProposalModal = ({ isOpen, onClose, onConfirm, isLoading, notes, setNotes }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center rounded-t-3xl">
          <h3 className="text-xl font-bold">Generate New Proposal Version</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This will generate a new proposal PDF and save it as a new version for this order.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes explaining the changes in this version..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !notes.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Proposal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const VersionsPanel = ({ versions, isLoading, onClose, orderId }) => {
  const [generatingPdf, setGeneratingPdf] = useState({});

  const handleDownloadPdf = async (version) => {
    setGeneratingPdf((prev) => ({ ...prev, [version.version]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/generate-version-pdf/${version.version}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${orderId}-v${version.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf((prev) => ({ ...prev, [version.version]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-lg font-bold">Proposal Versions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-medium">No versions available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.version}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Version {version.version}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Created on{' '}
                        {new Date(version.createdAt).toLocaleDateString()} at{' '}
                        {new Date(version.createdAt).toLocaleTimeString()}
                      </p>
                      {version.notes && (
                        <p className="text-sm mt-2 text-gray-700">{version.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(version)}
                      disabled={generatingPdf[version.version]}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-60"
                    >
                      {generatingPdf[version.version] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Generate PDF
                        </>
                      )}
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

const AdminOrderList = ({ onOrderClick }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [editingOrder, setEditingOrder] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalNotes, setProposalNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      const validOrders = (data.orders || []).filter((order) => order.selectedPlan);
      setOrders(validOrders);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (orderId) => {
    setLoadingVersions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/proposal-versions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleGenerateProposal = async () => {
    if (!proposalNotes.trim()) {
      alert('Please add notes explaining the changes in this version');
      return;
    }

    setGeneratingProposal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${selectedOrderId}/proposal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: proposalNotes }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate proposal');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${selectedOrderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowProposalModal(false);
      setProposalNotes('');
      setShowSuccessModal(true);

      fetchOrders();
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleDownload = async (orderId, type) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download ${type}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      const fileExtension =
        contentType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ? 'xlsx'
          : 'pdf';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${type}-${orderId}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Failed to download ${type}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = (order) => {
    if (order.status !== 'ongoing') {
      alert('Only ongoing orders can be edited');
      return;
    }

    if (!order.selectedPlan || !order.selectedPlan.id) {
      alert('Cannot edit order: Invalid floor plan data');
      return;
    }

    setEditingOrder({
      ...order,
      selectedPlan: {
        ...order.selectedPlan,
        image: order.selectedPlan?.image || `/floorplans/${order.selectedPlan?.id}.png`,
      },
    });
  };

  const handleBackToList = () => {
    setEditingOrder(null);
    fetchOrders();
  };

  const getOrderStatusLabel = (order) => {
    if (order.status) {
      return order.status.charAt(0).toUpperCase() + order.status.slice(1);
    }

    switch (order.step) {
      case 1:
        return 'Floor Plan Selection';
      case 2:
        return 'Space Design';
      case 3:
        return 'Order Review';
      case 4:
        return 'Payment Schedule';
      default:
        return 'In Progress';
    }
  };

  const getStatusPillClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'review':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStatusPill = (order) => {
    const label = getOrderStatusLabel(order);
    const classes = getStatusPillClasses(order.status);

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${classes}`}
      >
        <Check className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Editing mode – keep as separate view
  if (editingOrder) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-white border-b border-gray-200">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-[#005670] hover:text-[#005670]/80 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order List
          </button>
        </div>
        <AreaCustomization
          selectedPlan={editingOrder.selectedPlan}
          floorPlanImage={editingOrder.selectedPlan?.image}
          existingOrder={editingOrder}
          clientInfo={editingOrder.clientInfo}
          currentStep={editingOrder.step || 2}
          checkExistingOrder={fetchOrders}
          onComplete={(updatedOrder) => {
            console.log('Order updated:', updatedOrder);
            fetchOrders();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {downloading && <LoadingOverlay />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Order Management
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="review">Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / States */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Floor Plan
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {order.clientInfo?.name
                          ? order.clientInfo.name.charAt(0).toUpperCase()
                          : 'C'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {order.clientInfo?.name || 'Unknown Client'}
                        </span>
                        {order.clientInfo?.email && (
                          <span className="text-xs text-gray-500">
                            {order.clientInfo.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Floor Plan */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.selectedPlan?.title || 'N/A'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">{renderStatusPill(order)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View details */}
                      <button
                        onClick={() => onOrderClick(order._id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (only ongoing) */}
                      <button
                        onClick={() =>
                          order.status === 'ongoing' && handleEdit(order)
                        }
                        className={`p-1.5 rounded-lg transition-all ${
                          order.status === 'ongoing'
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title={
                          order.status === 'ongoing'
                            ? 'Edit Order'
                            : 'Only ongoing orders can be edited'
                        }
                        disabled={order.status !== 'ongoing'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Download Summary (Excel/PDF) */}
                      <button
                        onClick={() => handleDownload(order._id, 'summary')}
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Download Summary"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Generate new proposal */}
                      <button
                        onClick={() => {
                          setSelectedOrderId(order._id);
                          setShowProposalModal(true);
                        }}
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Generate New Proposal"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* View versions (optional – call fetchVersions when you enable trigger) */}
                      {/* 
                      <button
                        onClick={() => {
                          setSelectedOrderId(order._id);
                          setShowVersions(true);
                          fetchVersions(order._id);
                        }}
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="View Proposal Versions"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination (same concept as UserManagement) */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProposalModal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setProposalNotes('');
        }}
        onConfirm={handleGenerateProposal}
        isLoading={generatingProposal}
        notes={proposalNotes}
        setNotes={setProposalNotes}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {showVersions && (
        <VersionsPanel
          versions={versions}
          isLoading={loadingVersions}
          onClose={() => setShowVersions(false)}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default AdminOrderList;
