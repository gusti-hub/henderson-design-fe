import React, { useState, useEffect } from 'react';
import { Eye, Loader2, Download, FileText, Edit2, ArrowLeft, X, Clock, Check } from 'lucide-react';
import { backendServer } from '../utils/info';
import Pagination from '../components/common/Pagination';
import AreaCustomization from '../components/design-flow/AreaCustomization';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded-lg flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span>Processing...</span>
    </div>
  </div>
);

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Handle clicking outside the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Proposal Generated Successfully</h3>
          <p className="text-sm text-gray-500 mt-2">
            The proposal has been generated and saved as a new version.
          </p>
        </div>
        
        {/* Close button at bottom */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProposalModal = ({ isOpen, onClose, onConfirm, isLoading, notes, setNotes }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Generate New Proposal Version</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This will generate a new proposal and save it as a new version for this order.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version Notes (Required)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes explaining the changes in this version..."
            className="w-full p-3 border rounded-lg"
            rows="4"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !notes.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
    setGeneratingPdf(prev => ({ ...prev, [version.version]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/generate-version-pdf/${version.version}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      setGeneratingPdf(prev => ({ ...prev, [version.version]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-medium">Proposal Versions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center text-gray-500">No versions available</p>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.version}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Version {version.version}</h4>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(version.createdAt).toLocaleDateString()} at{' '}
                        {new Date(version.createdAt).toLocaleTimeString()}
                      </p>
                      {version.notes && (
                        <p className="text-sm mt-2 text-gray-600">{version.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(version)}
                      disabled={generatingPdf[version.version]}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
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
  const [itemsPerPage] = useState(10);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalNotes, setProposalNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);

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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: proposalNotes })
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
      
      // Reset form
      setProposalNotes('');
      
      // Refresh order list to show updated version number
      fetchOrders();
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setGeneratingProposal(false);
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
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterStatus, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      // Filter out orders with null selectedPlan
      const validOrders = data.orders.filter(order => order.selectedPlan);
      setOrders(validOrders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download ${type}`);
      }
  
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      let fileExtension = contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
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
    // Check if order is ongoing
    if (order.status !== 'ongoing') {
      alert('Only ongoing orders can be edited');
      return;
    }

    // Validate required data
    if (!order.selectedPlan || !order.selectedPlan.id) {
      alert('Cannot edit order: Invalid floor plan data');
      return;
    }

    setEditingOrder({
      ...order,
      selectedPlan: {
        ...order.selectedPlan,
        image: order.selectedPlan?.image || `/floorplans/${order.selectedPlan?.id}.png`
      }
    });
  };

  const handleBackToList = () => {
    setEditingOrder(null);
    fetchOrders(); // Refresh the list to show any updates
  };

  const getOrderStatus = (order) => {
    if (order.status) {
      return order.status.charAt(0).toUpperCase() + order.status.slice(1);
    }
  
    switch (order.step) {
      case 1: return 'Floor Plan Selection';
      case 2: return 'Space Design';
      case 3: return 'Order Review';
      case 4: return 'Payment Schedule';
      default: return 'In Progress';
    }
  };

  // If editing an order, show the AreaCustomization component
  if (editingOrder) {
    return (
      <div>
        <div className="p-6 bg-white border-b">
          <button
            onClick={handleBackToList}
            className="flex items-center text-[#005670] hover:text-[#005670]/80"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
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
            fetchOrders(); // Refresh the list after update
          }}
        />
      </div>
    );
  }

  const renderVersionsModal = () => (
    showVersions && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-medium">Proposal Versions</h2>
            <button
              onClick={() => setShowVersions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <textarea
                value={newVersionNotes}
                onChange={(e) => setNewVersionNotes(e.target.value)}
                placeholder="Add notes for the new version..."
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
              <button
                onClick={() => handleCreateVersion(selectedOrderId)}
                disabled={creatingVersion}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingVersion ? 'Creating...' : 'Create New Version'}
              </button>
            </div>

            {loadingVersions ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.version}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">Version {version.version}</h4>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(version.createdAt).toLocaleDateString()}
                      </p>
                      {version.notes && (
                        <p className="text-sm mt-1">{version.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={version.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        Download PDF
                      </a>
                      {version.status === 'draft' && (
                        <button
                          onClick={() => handleUpdateVersionStatus(selectedOrderId, version.version, 'sent')}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        >
                          Mark as Sent
                        </button>
                      )}
                      {version.status === 'sent' && (
                        <>
                          <button
                            onClick={() => handleUpdateVersionStatus(selectedOrderId, version.version, 'accepted')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateVersionStatus(selectedOrderId, version.version, 'rejected')}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
      {downloading && <LoadingOverlay />}
      <h2 className="text-2xl font-medium mb-6 text-[#005670]">Order Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by client name or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="review">Review</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{order.clientInfo?.name}</td>
                    <td className="px-6 py-4">{order.selectedPlan?.title || 'N/A'}</td>
                    <td className="px-6 py-4">{getOrderStatus(order)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onOrderClick(order._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => order.status === 'ongoing' && handleEdit(order)}
                          className={`${
                            order.status === 'ongoing' 
                              ? 'text-gray-600 hover:text-gray-800' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={order.status === 'ongoing' ? 'Edit Order' : 'Only ongoing orders can be edited'}
                          disabled={order.status !== 'ongoing'}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(order._id, 'summary')}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                          title="Download Summary (Excel)"
                        >
                          <Download className="w-5 h-5" />
                          <span className="text-sm">Excel</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrderId(order._id);
                            setShowProposalModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                          title="Generate New Proposal"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-sm">Generate Proposal</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrderId(order._id);
                            setShowVersions(true);
                            fetchVersions(order._id);
                          }}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                          title="View Proposal Versions"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-sm">View Proposal Versions</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

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
        onClose={() => {
          setShowSuccessModal(false);
        }}
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