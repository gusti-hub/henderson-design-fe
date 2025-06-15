import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Check, XIcon, Eye, Clock, Filter } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';
import { backendServer } from '../utils/info';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    clientCode: '',
    name: '',
    email: '',
    password: '',
    unitNumber: '',
    floorPlan: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorPlans, setFloorPlans] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Approval/Rejection state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState('approve'); // 'approve' or 'reject'
  const [approvalData, setApprovalData] = useState({
    clientCode: '',
    floorPlan: '',
    rejectionReason: ''
  });
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchFloorPlans();
    fetchPendingCount();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchClients();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/clients/pending-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPendingCount(data.pendingCount);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const fetchFloorPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/clients/floor-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFloorPlans(data);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/clients?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${statusFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setClients(data.clients);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientCode) newErrors.clientCode = 'Client code is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
    if (!formData.floorPlan) newErrors.floorPlan = 'Floor plan is required';
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }
    if (showPasswordField && modalMode === 'edit' && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'New password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create'
        ? `${backendServer}/api/clients`
        : `${backendServer}/api/clients/${selectedClient._id}`;

      const submitData = { ...formData };
      if (!showPasswordField && modalMode === 'edit') {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save client');
      }

      await fetchClients();
      await fetchPendingCount();
      handleCloseModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setApprovalLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = approvalMode === 'approve' ? 'approve' : 'reject';
      
      const response = await fetch(`${backendServer}/api/clients/${selectedClient._id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalMode === 'approve' ? {
          clientCode: approvalData.clientCode,
          floorPlan: approvalData.floorPlan
        } : {
          reason: approvalData.rejectionReason
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${approvalMode} client`);
      }

      await fetchClients();
      await fetchPendingCount();
      handleCloseApprovalModal();
    } catch (error) {
      console.error(`Error ${approvalMode}ing client:`, error);
      // You could add error state here if needed
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setFormData({
      clientCode: '',
      name: '',
      email: '',
      password: '',
      unitNumber: '',
      floorPlan: '',
      role: 'user'
    });
    setErrors({});
    setShowPasswordField(false);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedClient(null);
    setApprovalData({
      clientCode: '',
      floorPlan: '',
      rejectionReason: ''
    });
  };

  const getStatusBadge = (status, registrationType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (registrationType === 'admin-created') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          Admin Created
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const openApprovalModal = (client, mode) => {
    setSelectedClient(client);
    setApprovalMode(mode);
    setApprovalData({
      clientCode: client.clientCode || '',
      floorPlan: client.floorPlan || '',
      rejectionReason: ''
    });
    setIsApprovalModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-light" style={{ color: '#005670' }}>
            Client Management
          </h2>
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              {pendingCount} registration{pendingCount > 1 ? 's' : ''} pending approval
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#005670' }}
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <SearchFilter
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search by client code, name, email..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : clients.map((client) => (
              <tr key={client._id}>
                <td className="px-6 py-4">{client.clientCode || '-'}</td>
                <td className="px-6 py-4">{client.name}</td>
                <td className="px-6 py-4">{client.email}</td>
                <td className="px-6 py-4">{client.unitNumber}</td>
                <td className="px-6 py-4">{client.floorPlan || '-'}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(client.status, client.registrationType)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    { client.registrationType === 'self-registered' ? (
                      <>
                        <button
                          onClick={() => openApprovalModal(client, 'approve')}
                          className="text-green-600 hover:text-green-800"
                          title="Approve Registration"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openApprovalModal(client, 'reject')}
                          className="text-red-600 hover:text-red-800"
                          title="Reject Registration"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setIsModalOpen(true);
                            setModalMode('view');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setFormData({
                              clientCode: client.clientCode || '',
                              name: client.name,
                              email: client.email,
                              unitNumber: client.unitNumber,
                              floorPlan: client.floorPlan || '',
                              role: 'user'
                            });
                            setModalMode('edit');
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this client?')) {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`${backendServer}/api/clients/${client._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                                
                                if (!response.ok) {
                                  throw new Error('Failed to delete client');
                                }
                                
                                await fetchClients();
                                await fetchPendingCount();
                              } catch (error) {
                                console.error('Error:', error);
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Main Modal for Create/Edit/View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {modalMode === 'create' ? 'Add New Client' : 
                 modalMode === 'edit' ? 'Edit Client' : 'Client Details'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalMode === 'view' ? (
              // View Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedClient?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedClient?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                  <p className="text-gray-900">{selectedClient?.unitNumber}</p>
                </div>
                {selectedClient?.phoneNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900">{selectedClient.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                  <p className="text-gray-900">{new Date(selectedClient?.createdAt).toLocaleDateString()}</p>
                </div>
                
                {selectedClient?.questionnaire && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Questionnaire Responses</label>
                    <div className="bg-gray-50 p-4 rounded space-y-3 text-sm max-h-64 overflow-y-auto">
                      
                      {/* Design Style & Aesthetic Preferences */}
                      <div className="border-b pb-2">
                        <h5 className="font-semibold text-gray-800 mb-2">Design Style & Aesthetic</h5>
                        {selectedClient.questionnaire.designStyle && selectedClient.questionnaire.designStyle.length > 0 && (
                          <div><strong>Design Styles:</strong> {selectedClient.questionnaire.designStyle.join(', ')}</div>
                        )}
                        {selectedClient.questionnaire.colorPalette && selectedClient.questionnaire.colorPalette.length > 0 && (
                          <div><strong>Color Palette:</strong> {selectedClient.questionnaire.colorPalette.join(', ')}</div>
                        )}
                        {selectedClient.questionnaire.patterns && selectedClient.questionnaire.patterns.length > 0 && (
                          <div><strong>Patterns:</strong> {selectedClient.questionnaire.patterns.join(', ')}</div>
                        )}
                        {selectedClient.questionnaire.personalTouches && (
                          <div><strong>Personal Items:</strong> {selectedClient.questionnaire.personalTouches}</div>
                        )}
                        {selectedClient.questionnaire.personalArtworkDetails && (
                          <div><strong>Personal Items Details:</strong> {selectedClient.questionnaire.personalArtworkDetails}</div>
                        )}
                      </div>

                      {/* Lifestyle & Functionality */}
                      <div className="border-b pb-2">
                        <h5 className="font-semibold text-gray-800 mb-2">Lifestyle & Functionality</h5>
                        {selectedClient.questionnaire.primaryUse && selectedClient.questionnaire.primaryUse.length > 0 && (
                          <div><strong>Primary Use:</strong> {selectedClient.questionnaire.primaryUse.join(', ')}</div>
                        )}
                        {selectedClient.questionnaire.occupants && (
                          <div><strong>Occupants:</strong> {selectedClient.questionnaire.occupants}</div>
                        )}
                        {selectedClient.questionnaire.lifestyleNeeds && (
                          <div><strong>Lifestyle Needs:</strong> {selectedClient.questionnaire.lifestyleNeeds}</div>
                        )}
                      </div>

                      {/* Timeline & Budget */}
                      <div className="border-b pb-2">
                        <h5 className="font-semibold text-gray-800 mb-2">Timeline & Budget</h5>
                        {selectedClient.questionnaire.desiredCompletionDate && (
                          <div><strong>Desired Completion:</strong> {new Date(selectedClient.questionnaire.desiredCompletionDate).toLocaleDateString()}</div>
                        )}
                        {selectedClient.questionnaire.budgetFlexibility && (
                          <div><strong>Budget Flexibility:</strong> {selectedClient.questionnaire.budgetFlexibility}</div>
                        )}
                      </div>

                      {/* Project Details */}
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Project Details</h5>
                        {selectedClient.questionnaire.technologyIntegration && (
                          <div><strong>Technology Features:</strong> {selectedClient.questionnaire.technologyIntegration}</div>
                        )}
                        {selectedClient.questionnaire.additionalThoughts && (
                          <div><strong>Additional Thoughts:</strong> {selectedClient.questionnaire.additionalThoughts}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Create/Edit Mode
              <>
                {errors.form && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Code</label>
                    <input
                      type="text"
                      value={formData.clientCode}
                      onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                    {errors.clientCode && <p className="text-red-500 text-sm mt-1">{errors.clientCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                    <input
                      type="text"
                      value={formData.unitNumber}
                      onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                    {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Plan</label>
                    <select
                      value={formData.floorPlan}
                      onChange={(e) => setFormData({ ...formData, floorPlan: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    >
                      <option value="">Select a floor plan</option>
                      {floorPlans.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                    {errors.floorPlan && <p className="text-red-500 text-sm mt-1">{errors.floorPlan}</p>}
                  </div>

                  {modalMode === 'create' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPasswordField(!showPasswordField)}
                          className="text-sm text-[#005670]"
                        >
                          {showPasswordField ? 'Cancel Password Change' : 'Change Password'}
                        </button>
                      </div>
                      {showPasswordField && (
                        <>
                          <input
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                            placeholder="Enter new password"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-4 py-2 text-white rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: '#005670' }}
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                        </>
                      ) : (
                        modalMode === 'create' ? 'Create' : 'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {approvalMode === 'approve' ? 'Approve Registration' : 'Reject Registration'}
              </h3>
              <button onClick={handleCloseApprovalModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Client: {selectedClient?.name}</p>
              <p className="text-sm text-gray-600">Email: {selectedClient?.email}</p>
              <p className="text-sm text-gray-600">Unit: {selectedClient?.unitNumber}</p>
            </div>

            <form onSubmit={handleApprovalSubmit} className="space-y-4">
              {approvalMode === 'approve' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Code *
                    </label>
                    <input
                      type="text"
                      value={approvalData.clientCode}
                      onChange={(e) => setApprovalData({ ...approvalData, clientCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                      placeholder="Enter client code"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Plan *
                    </label>
                    <select
                      value={approvalData.floorPlan}
                      onChange={(e) => setApprovalData({ ...approvalData, floorPlan: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                      required
                    >
                      <option value="">Select a floor plan</option>
                      {floorPlans.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    value={approvalData.rejectionReason}
                    onChange={(e) => setApprovalData({ ...approvalData, rejectionReason: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    rows="3"
                    placeholder="Enter reason for rejection (optional)"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseApprovalModal}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={approvalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvalLoading}
                  className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                    approvalMode === 'approve' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {approvalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {approvalMode === 'approve' ? 'Approving...' : 'Rejecting...'}
                    </>
                  ) : (
                    <>
                      {approvalMode === 'approve' ? (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      ) : (
                        <>
                          <XIcon className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;