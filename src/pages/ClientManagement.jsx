import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, X, Loader2, Check, XIcon, Eye, DollarSign, Receipt,
  Search, Filter, Sparkles, FileText, AlertCircle, Calendar, MapPin, Mail, Phone,
  User, Building2, CreditCard, CheckCircle, Clock
} from 'lucide-react';
import { backendServer } from '../utils/info';
import AdminJourneyManager from '../components/AdminJourneyManager';

// ==================== MAIN COMPONENT ====================

const ClientManagement = () => {
  // ==================== STATE ====================
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorPlans, setFloorPlans] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'form' | 'approval' | 'payment' | 'paymentDetails' | 'journey'
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    clientCode: '',
    name: '',
    email: '',
    password: '',
    unitNumber: '',
    floorPlan: '',
    totalAmount: 0,
    propertyType:  '',
    downPaymentPercentage: 30
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Approval Data
  const [approvalMode, setApprovalMode] = useState('approve');
  const [approvalData, setApprovalData] = useState({ clientCode: '', floorPlan: '', rejectionReason: '' });

  // Payment Data
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: '',
    reference: '',
    notes: ''
  });

  // ==================== API CALLS (memoized) ====================

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/clients?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchTerm
        )}&status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.success) {
        setClients(data.data || []);
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage) || 1);
      } else {
        setClients([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (activeModal === 'journey') {
      document.body.style.overflow = 'hidden';   // 🔒 disable scroll luar
    } else {
      document.body.style.overflow = 'auto';     // 🔓 enable scroll kembali
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeModal]);

  const fetchFloorPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/floor-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFloorPlans(data.data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      setFloorPlans([]);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/pending-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
      setPendingCount(0);
    }
  }, []);

  // ==================== EFFECTS ====================

  // Initial load
  useEffect(() => {
    fetchClients();
    fetchFloorPlans();
    fetchPendingCount();
  }, [fetchClients, fetchFloorPlans, fetchPendingCount]);

  // Refetch on page / status change (kecuali kalau modal terbuka, jangan ganggu)
  useEffect(() => {
    if (activeModal) return;
    fetchClients();
  }, [currentPage, statusFilter, activeModal, fetchClients]);

  // Refetch on search (debounce) – juga di-block kalau modal sedang terbuka
  useEffect(() => {
    if (activeModal) return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchClients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeModal, fetchClients]);

  // ==================== HELPERS ====================

  const validateForm = useCallback(() => {
    const newErrors = {};
    // if (!formData.clientCode) newErrors.clientCode = 'Required';
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (!formData.unitNumber) newErrors.unitNumber = 'Required';
    if (!formData.floorPlan) newErrors.floorPlan = 'Required';
    if (!formData.propertyType) newErrors.propertyType = 'Required';
    if (modalMode === 'create' && !formData.password) newErrors.password = 'Required';
    if (showPasswordField && modalMode === 'edit' && formData.password?.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, modalMode, showPasswordField]);

  const resetFormState = useCallback(() => {
    setFormData({
      clientCode: '',
      name: '',
      email: '',
      password: '12345678',
      unitNumber: '',
      propertyType: '',
      floorPlan: '',
      totalAmount: 0,
      downPaymentPercentage: 30
    });
    setApprovalData({ clientCode: '', floorPlan: '', rejectionReason: '' });
    setPaymentData({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: '',
      reference: '',
      notes: ''
    });
    setErrors({});
    setShowPasswordField(false);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedClient(null);
    resetFormState();
  }, [resetFormState]);

  const openFormModal = useCallback((mode, client = null) => {
    setModalMode(mode);
    setSelectedClient(client || null);

    if (client && mode === 'edit') {
      setFormData({
        clientCode: client.clientCode || '',
        name: client.name || '',
        email: client.email || '',
        unitNumber: client.unitNumber || '',
        floorPlan: client.floorPlan || '',
        propertyType: client.propertyType || '',
        password: '',
        totalAmount: client.paymentInfo?.totalAmount || 0,
        downPaymentPercentage: client.paymentInfo?.downPaymentPercentage || 30
      });
    } else if (mode === 'create') {
      resetFormState();
    }

    setActiveModal('form');
  }, [resetFormState]);

  const openApprovalModal = useCallback((client, mode) => {
    setSelectedClient(client);
    setApprovalMode(mode);
    setApprovalData({
      clientCode: client.clientCode || '',
      floorPlan: client.floorPlan || '',
      rejectionReason: ''
    });
    setActiveModal('approval');
  }, []);

  const openPaymentModal = useCallback((client) => {
    setSelectedClient(client);
    const requiredDP =
      (client.paymentInfo?.totalAmount || 0) *
      ((client.paymentInfo?.downPaymentPercentage || 30) / 100);
    setPaymentData({
      amount: requiredDP,
      date: new Date().toISOString().split('T')[0],
      method: '',
      reference: '',
      notes: ''
    });
    setActiveModal('payment');
  }, []);

  const openPaymentDetailsModal = useCallback((client) => {
    setSelectedClient(client);
    setActiveModal('paymentDetails');
  }, []);

  const openJourneyModal = useCallback((client) => {
    setSelectedClient(client);
    setActiveModal('journey');
  }, []);

  const getBadge = useCallback((status, type = 'status') => {
    const badges = {
      status: {
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
        approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Approved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XIcon, label: 'Rejected' },
        'admin-created': { bg: 'bg-blue-100', text: 'text-blue-700', icon: User, label: 'Admin' }
      },
      payment: {
        paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Paid' },
        partial: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Partial' },
        overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Overdue' },
        'not-paid': { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Unpaid' },
        default: { bg: 'bg-gray-100', text: 'text-gray-600', icon: null, label: '-' }
      }
    };

    const config =
      type === 'status'
        ? status === 'admin-created'
          ? badges.status['admin-created']
          : badges.status[status]
        : badges.payment[status] || badges.payment['default'];

    const Icon = config?.icon;

    if (!config) return null;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </span>
    );
  }, []);

  // ==================== HANDLERS ====================

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setFormLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url =
          modalMode === 'create'
            ? `${backendServer}/api/clients`
            : `${backendServer}/api/clients/${selectedClient._id}`;

        const submitData = { ...formData };
        if (!showPasswordField && modalMode === 'edit') {
          delete submitData.password;
        }

        const res = await fetch(url, {
          method: modalMode === 'create' ? 'POST' : 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to save client');
        }

        await fetchClients();
        await fetchPendingCount();
        closeModal();
      } catch (error) {
        console.error(error);
        setErrors((prev) => ({ ...prev, form: error.message }));
      } finally {
        setFormLoading(false);
      }
    },
    [validateForm, modalMode, formData, showPasswordField, selectedClient, fetchClients, fetchPendingCount, closeModal]
  );

  const handleApprovalSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormLoading(true);

      try {
        const token = localStorage.getItem('token');
        const endpoint = approvalMode === 'approve' ? 'approve' : 'reject';

        const payload =
          approvalMode === 'approve'
            ? { clientCode: approvalData.clientCode, floorPlan: approvalData.floorPlan }
            : { reason: approvalData.rejectionReason };

        const res = await fetch(
          `${backendServer}/api/clients/${selectedClient._id}/${endpoint}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed');
        }

        await fetchClients();
        await fetchPendingCount();
        closeModal();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setFormLoading(false);
      }
    },
    [approvalMode, approvalData, selectedClient, fetchClients, fetchPendingCount, closeModal]
  );

  const handlePaymentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormLoading(true);

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${backendServer}/api/clients/${selectedClient._id}/record-payment`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: paymentData.amount,
              paymentDate: paymentData.date,
              paymentMethod: paymentData.method,
              transactionReference: paymentData.reference,
              notes: paymentData.notes
            })
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to record payment');
        }

        await fetchClients();
        closeModal();
        alert('Payment recorded successfully!');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to record payment');
      } finally {
        setFormLoading(false);
      }
    },
    [selectedClient, paymentData, fetchClients, closeModal]
  );

  const handleDelete = useCallback(
    async (clientId) => {
      if (!window.confirm('Are you sure?')) return;

      try {
        const token = localStorage.getItem('token');
        await fetch(`${backendServer}/api/clients/${clientId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchClients();
        await fetchPendingCount();
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [fetchClients, fetchPendingCount]
  );

  const handleInitializeJourney = useCallback(
    async (clientId) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          alert('Journey initialized!');
          const client = clients.find((c) => c._id === clientId);
          if (client) {
            setSelectedClient(client);
            setActiveModal('journey');
          }
        } else {
          const body = await res.json().catch(() => ({}));
          alert(body.message || 'Failed to initialize journey');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to initialize journey');
      }
    },
    [clients]
  );

  const paginationPages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Client Management</h1>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-sm text-amber-600 font-medium">
                {pendingCount} pending approval
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => openFormModal('create')}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-semibold">Add Client</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, unit..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 bg-white text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table / State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No clients found</p>
        </div>
      ) : (
        <ClientTable
          clients={clients}
          getBadge={getBadge}
          onOpenFormModal={openFormModal}
          onOpenApprovalModal={openApprovalModal}
          onOpenPaymentModal={openPaymentModal}
          onDeleteClient={handleDelete}
          onInitializeJourney={handleInitializeJourney}
          onOpenPaymentDetails={openPaymentDetailsModal}
          onOpenJourneyModal={openJourneyModal}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {paginationPages.map((page) => (
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

      {/* Modals */}
      {activeModal === 'form' && (
        <FormModal
          modalMode={modalMode}
          selectedClient={selectedClient}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          showPasswordField={showPasswordField}
          setShowPasswordField={setShowPasswordField}
          floorPlans={floorPlans}
          formLoading={formLoading}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {activeModal === 'approval' && selectedClient && (
        <ApprovalModal
          approvalMode={approvalMode}
          selectedClient={selectedClient}
          approvalData={approvalData}
          setApprovalData={setApprovalData}
          floorPlans={floorPlans}
          formLoading={formLoading}
          onClose={closeModal}
          onSubmit={handleApprovalSubmit}
        />
      )}

      {activeModal === 'payment' && (
        <PaymentModal
          selectedClient={selectedClient}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          formLoading={formLoading}
          closeModal={closeModal}
          handlePaymentSubmit={handlePaymentSubmit}
        />
      )}


      {activeModal === 'paymentDetails' && selectedClient && (
        <PaymentDetailsModal
          selectedClient={selectedClient}
          getBadge={getBadge}
          onClose={closeModal}
        />
      )}

      {activeModal === 'journey' && selectedClient && (
        <JourneyModal selectedClient={selectedClient} onClose={closeModal} />
      )}
    </div>
  );
};

// ==================== CHILD COMPONENTS ====================

const ClientTable = React.memo(
  ({
    clients,
    getBadge,
    onOpenFormModal,
    onOpenApprovalModal,
    onOpenPaymentModal,
    onDeleteClient,
    onInitializeJourney,
    onOpenPaymentDetails,
    onOpenJourneyModal
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {client.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.clientCode || 'No code'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{client.email}</span>
                      </p>
                      {client.phoneNumber && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {client.phoneNumber}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Property */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        Unit {client.unitNumber}
                      </p>
                      <p className="text-xs text-gray-500">{client.floorPlan || '-'}</p>
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {client.paymentInfo?.totalAmount ? (
                        <>
                          <p className="text-sm font-bold text-[#005670]">
                            ${client.paymentInfo.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            DP: $
                            {(
                              (client.paymentInfo.totalAmount *
                                (client.paymentInfo.downPaymentPercentage || 30)) /
                              100
                            ).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {getBadge(
                        client.registrationType === 'admin-created'
                          ? 'admin-created'
                          : client.status,
                        'status'
                      )}
                      {getBadge(client.paymentInfo?.downPaymentStatus, 'payment')}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {client.registrationType === 'self-registered' ? (
                        <>
                          <ActionButton
                            icon={Check}
                            color="green"
                            onClick={() => onOpenApprovalModal(client, 'approve')}
                            title="Approve"
                            size="sm"
                          />
                          <ActionButton
                            icon={XIcon}
                            color="red"
                            onClick={() => onOpenApprovalModal(client, 'reject')}
                            title="Reject"
                            size="sm"
                          />
                          <ActionButton
                            icon={Eye}
                            color="blue"
                            onClick={() => onOpenFormModal('view', client)}
                            title="View"
                            size="sm"
                          />
                        </>
                      ) : (
                        <>
                          <ActionButton
                            icon={Pencil}
                            color="blue"
                            onClick={() => onOpenFormModal('edit', client)}
                            title="Edit"
                            size="sm"
                          />

                          {client.paymentInfo?.downPaymentStatus === 'paid' ? (
                            <>
                              <ActionButton
                                icon={Sparkles}
                                color="purple"
                                onClick={() => onInitializeJourney(client._id)}
                                title="Initialize Journey"
                                size="sm"
                              />
                              <ActionButton
                                icon={FileText}
                                color="cyan"
                                onClick={() => onOpenJourneyModal(client)}
                                title="Manage Journey"
                                size="sm"
                              />
                            </>
                          ) : (
                            <ActionButton
                              icon={DollarSign}
                              color="green"
                              onClick={() => onOpenPaymentModal(client)}
                              title="Record Payment"
                              size="sm"
                            />
                          )}

                          {client.paymentInfo?.totalAmount > 0 && (
                            <ActionButton
                              icon={Receipt}
                              color="indigo"
                              onClick={() => onOpenPaymentDetails(client)}
                              title="Payment Details"
                              size="sm"
                            />
                          )}

                          <ActionButton
                            icon={Trash2}
                            color="red"
                            onClick={() => onDeleteClient(client._id)}
                            title="Delete"
                            size="sm"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

// ==================== MODALS ====================

const FormModal = React.memo(
  ({
    modalMode,
    selectedClient,
    formData,
    setFormData,
    errors,
    showPasswordField,
    setShowPasswordField,
    floorPlans,
    formLoading,
    onClose,
    onSubmit
  }) => {
    return (
      <Modal
        title={
          modalMode === 'create'
            ? '✨ Add New Client'
            : modalMode === 'edit'
            ? '✏️ Edit Client'
            : '👤 Client Details'
        }
        onClose={onClose}
      >
        {modalMode === 'view' ? (
          <ViewMode client={selectedClient} />
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {errors.form && <Alert type="error" message={errors.form} />}

            <div className="grid md:grid-cols-2 gap-4">
              {/* <Input
                label="Client Code"
                value={formData.clientCode}
                onChange={(v) => setFormData((prev) => ({ ...prev, clientCode: v }))}
                error={errors.clientCode}
                required
              /> */}
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(v) => setFormData((prev) => ({ ...prev, name: v }))}
                error={errors.name}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(v) => setFormData((prev) => ({ ...prev, email: v }))}
                error={errors.email}
                required
              />
              <Input
                label="Unit Number"
                value={formData.unitNumber}
                onChange={(v) => setFormData((prev) => ({ ...prev, unitNumber: v }))}
                error={errors.unitNumber}
                required
              />
              <Select
                label="Floor Plan"
                value={formData.floorPlan}
                onChange={(v) => setFormData((prev) => ({ ...prev, floorPlan: v }))}
                options={floorPlans.map((fp) => ({ value: fp, label: fp }))}
                error={errors.floorPlan}
                required
              />
              <Select 
                label="Property Type" 
                value={formData.propertyType} 
                onChange={(v) => setFormData(prev => ({...prev, propertyType: v}))} 
                options={[
                  { value: 'Lock 2025 Pricing', label: 'Lock 2025 Pricing' },
                  { value: 'Design Hold Fee', label: 'Design Hold Fee' }
                ]}
                error={errors.propertyType} 
                required 
              />
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Payment Information
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Total Amount ($)"
                type="text"
                value={formData.totalAmount === 0 ? "" : formData.totalAmount}
                onChange={(v) => {
                  // Hilangkan semua leading zero
                  let cleaned = v.replace(/^0+(?=\d)/, "");

                  // Hanya boleh angka dan titik
                  cleaned = cleaned.replace(/[^0-9.]/g, "");

                  // Konversi ke number jika valid
                  const numericValue = cleaned === "" ? 0 : parseFloat(cleaned);

                  setFormData((prev) => ({
                    ...prev,
                    totalAmount: isNaN(numericValue) ? 0 : numericValue
                  }));
                }}
                placeholder="0"
              />

                <Input
                  label="DP Percentage (%)"
                  type="number"
                  value={formData.downPaymentPercentage}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      downPaymentPercentage: parseInt(v) || 30
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
              {formData.totalAmount > 0 && (
                <div className="mt-3 p-3 bg-white rounded-xl">
                  <p className="text-sm">
                    Required DP:{' '}
                    <strong className="text-[#005670]">
                      ${((formData.totalAmount * formData.downPaymentPercentage) / 100).toLocaleString()}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {modalMode === 'create' ? (
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(v) => setFormData((prev) => ({ ...prev, password: v }))}
                error={errors.password}
                required
              />
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordField((prev) => !prev)}
                    className="text-sm text-[#005670] font-medium hover:underline"
                  >
                    {showPasswordField ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {showPasswordField && (
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(v) => setFormData((prev) => ({ ...prev, password: v }))}
                    error={errors.password}
                    placeholder="New password (min 6 chars)"
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={formLoading}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg font-bold flex items-center gap-2"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : modalMode === 'create' ? (
                  '✨ Create'
                ) : (
                  '💾 Save'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    );
  }
);

const ApprovalModal = React.memo(
  ({
    approvalMode,
    selectedClient,
    approvalData,
    setApprovalData,
    floorPlans,
    formLoading,
    onClose,
    onSubmit
  }) => {
    return (
      <Modal
        title={approvalMode === 'approve' ? '✅ Approve Registration' : '❌ Reject Registration'}
        onClose={onClose}
        headerClass={
          approvalMode === 'approve'
            ? 'from-emerald-600 to-teal-600'
            : 'from-red-600 to-rose-600'
        }
      >
        <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-1">
          <p className="text-sm">
            <strong>Client:</strong> {selectedClient?.name}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {selectedClient?.email}
          </p>
          <p className="text-sm">
            <strong>Unit:</strong> {selectedClient?.unitNumber}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {approvalMode === 'approve' ? (
            <>
              <Input
                label="Client Code"
                value={approvalData.clientCode}
                onChange={(v) =>
                  setApprovalData((prev) => ({
                    ...prev,
                    clientCode: v
                  }))
                }
                required
              />
              <Select
                label="Floor Plan"
                value={approvalData.floorPlan}
                onChange={(v) =>
                  setApprovalData((prev) => ({
                    ...prev,
                    floorPlan: v
                  }))
                }
                options={floorPlans.map((fp) => ({ value: fp, label: fp }))}
                required
              />
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={approvalData.rejectionReason}
                onChange={(e) =>
                  setApprovalData((prev) => ({
                    ...prev,
                    rejectionReason: e.target.value
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 resize-none"
                rows="4"
                placeholder="Optional..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={formLoading}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className={`px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 ${
                approvalMode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : approvalMode === 'approve' ? (
                <>
                  <Check className="w-5 h-5" /> Approve
                </>
              ) : (
                <>
                  <XIcon className="w-5 h-5" /> Reject
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
  }
);

function PaymentModal({
  selectedClient,
  paymentData,
  setPaymentData,
  formLoading,
  closeModal,
  handlePaymentSubmit
}) {

  if (!selectedClient) return null;

  const requiredDP =
    (selectedClient?.paymentInfo?.totalAmount || 0) *
    ((selectedClient?.paymentInfo?.downPaymentPercentage || 30) / 100);

  return (
    <Modal title="💰 Record Down Payment" onClose={closeModal}>
      {/* Client Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
        <p className="text-sm"><strong>Client:</strong> {selectedClient?.name}</p>
        <p className="text-sm"><strong>Unit:</strong> {selectedClient?.unitNumber}</p>
        <p className="text-sm">
          <strong>Required DP:</strong>{' '}
          <strong className="text-[#005670]">${requiredDP.toLocaleString()}</strong>
        </p>
      </div>

      {/* FORM */}
      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          handlePaymentSubmit(e); 
        }} 
        className="space-y-4 pb-24"
      >
        <Input 
          label="Payment Amount ($)"
          type="number"
          value={paymentData.amount}
          onChange={(v) =>
            setPaymentData(prev => ({ ...prev, amount: parseFloat(v) || 0 }))
          }
          required
        />

        <Input 
          label="Payment Date"
          type="date"
          value={paymentData.date}
          onChange={(v) =>
            setPaymentData(prev => ({ ...prev, date: v }))
          }
          required
        />

        <Select 
          label="Payment Method"
          value={paymentData.method}
          onChange={(v) =>
            setPaymentData(prev => ({ ...prev, method: v }))
          }
          options={[
            { value: 'bank-transfer', label: 'Bank Transfer' },
            { value: 'credit-card', label: 'Credit Card' },
            { value: 'check', label: 'Check' },
            { value: 'cash', label: 'Cash' },
            { value: 'wire-transfer', label: 'Wire Transfer' },
            { value: 'other', label: 'Other' }
          ]}
          required
        />

        <Input 
          label="Transaction Reference"
          value={paymentData.reference}
          onChange={(v) =>
            setPaymentData(prev => ({ ...prev, reference: v }))
          }
          placeholder="Optional"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={paymentData.notes}
            onChange={(e) =>
              setPaymentData(prev => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            rows="3"
          />
        </div>

        {/* STICKY FOOTER */}
        <div className="sticky bottom-0 left-0 bg-white py-4 border-t mt-6 
                        flex justify-end gap-3 z-50">

          <button 
            type="button"
            onClick={closeModal}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700"
          >
            Cancel
          </button>

          <button 
            type="submit"
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700"
          >
            Record Payment
          </button>

        </div>

      </form>
    </Modal>
  );
}




const PaymentDetailsModal = React.memo(({ selectedClient, getBadge, onClose }) => {
  const client = selectedClient;
  if (!client) return null;

  const requiredDP =
    (client.paymentInfo?.totalAmount || 0) *
    ((client.paymentInfo?.downPaymentPercentage || 30) / 100);
  const amountPaid = client.paymentInfo?.amountPaid || 0;
  const balance = (client.paymentInfo?.totalAmount || 0) - amountPaid;

  return (
    <Modal title="📊 Payment Details" onClose={onClose} size="large">
      {/* Client Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm text-gray-600">Client</p>
          <p className="font-bold">{client.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Unit</p>
          <p className="font-bold">{client.unitNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Code</p>
          <p className="font-bold">{client.clientCode || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Floor Plan</p>
          <p className="font-bold">{client.floorPlan || '-'}</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 mb-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> Payment Summary
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold">${(client.paymentInfo?.totalAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              Required DP ({client.paymentInfo?.downPaymentPercentage || 30}%):
            </span>
            <span className="font-bold">${requiredDP.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-emerald-600">
              ${amountPaid.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-blue-300">
            <span className="text-gray-600">Remaining Balance:</span>
            <span className="font-bold text-red-600">${balance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            {getBadge(client.paymentInfo?.downPaymentStatus, 'payment')}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h4 className="font-bold text-gray-900 mb-4">📋 Payment History</h4>
        {client.paymentInfo?.payments?.length > 0 ? (
          <div className="space-y-3">
            {client.paymentInfo.payments
              .slice()
              .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
              .map((payment, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg">
                        ${(payment.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      ✓ Paid
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-gray-600">Method:</span>{' '}
                      <span className="font-medium capitalize">
                        {(payment.paymentMethod || '-').replace('-', ' ')}
                      </span>
                    </div>
                    {payment.transactionReference && (
                      <div>
                        <span className="text-gray-600">Ref:</span>{' '}
                        <span className="font-medium">{payment.transactionReference}</span>
                      </div>
                    )}
                  </div>
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                      <strong>Notes:</strong> {payment.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Recorded by: {payment.recordedBy || 'System'} •{' '}
                    {payment.recordedAt &&
                      new Date(payment.recordedAt).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No payment history</p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          Close
        </button>
      </div>
    </Modal>
  );
});

const JourneyModal = React.memo(({ selectedClient, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-[90vw] h-[95vh] max-w-none shadow-2xl overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center rounded-t-3xl z-10">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8" /> Journey Manager
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {selectedClient?.name} • Unit {selectedClient?.unitNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <AdminJourneyManager
            clientId={selectedClient?._id}
            clientName={selectedClient?.name}
          />
        </div>
      </div>
    </div>
  );
});

// ==================== UTILITY COMPONENTS ====================

const Modal = ({ title, children, onClose, headerClass = 'from-[#005670] to-[#007a9a]', size = 'default' }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div
      className={`
        bg-white rounded-3xl
        ${size === 'large' ? 'max-w-4xl' : 'max-w-2xl'}
        w-full
        max-h-[90vh]
        flex flex-col
        shadow-2xl
        animate-[slideUp_0.3s_ease-out]
      `}
      onClick={(e) => e.stopPropagation()}  // ⛔ prevent bubbling
    >
      {/* HEADER */}
      <div className={`bg-gradient-to-r ${headerClass} text-white p-6 flex justify-between items-center rounded-t-3xl`}>
        <h3 className="text-2xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6 overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  </div>
);


const Input = React.memo(
  ({ label, value, onChange, error, type = 'text', required = false, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-all pr-12"
            {...props}
          />

          {/* Eye Button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#005670]"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.676 0 
                    3.27-.365 4.695-1.022M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 
                    0 8.773 3.162 10.065 7.5a10.52 10.52 0 01-4.293 5.774M6.228 
                    6.228L3 3m3.228 3.228l5.772 5.772m0 0l3.772 3.772M12 
                    12l3.772 3.772" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M2.036 12C3.284 7.943 7.274 4.5 12 
                    4.5c4.726 0 8.716 3.443 9.964 7.5C20.716 
                    16.057 16.726 19.5 12 19.5c-4.726 
                    0-8.716-3.443-9.964-7.5z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);


const Select = React.memo(({ label, value, onChange, options, error, required = false }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white transition-all"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

const ActionButton = React.memo(({ icon: Icon, color, onClick, title, size = 'md' }) => {
  const colors = {
    green: 'text-emerald-600 hover:bg-emerald-50',
    red: 'text-red-600 hover:bg-red-50',
    blue: 'text-blue-600 hover:bg-blue-50',
    purple: 'text-purple-600 hover:bg-purple-50',
    cyan: 'text-cyan-600 hover:bg-cyan-50',
    indigo: 'text-indigo-600 hover:bg-indigo-50'
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2.5'
  };

  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} ${colors[color]} rounded-lg transition-all hover:scale-110`}
      title={title}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
});

const Alert = React.memo(({ type, message }) => {
  const styles = {
    error: 'bg-red-50 border-red-500 text-red-700',
    success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
    warning: 'bg-amber-50 border-amber-500 text-amber-700'
  };

  return (
    <div className={`p-4 border-l-4 rounded-xl ${styles[type]}`}>
      <p className="font-medium">{message}</p>
    </div>
  );
});

const ViewMode = React.memo(({ client }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
        <p className="text-lg font-bold">{client?.name}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
        <p className="text-lg">{client?.email}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase">Unit</label>
        <p className="text-lg font-bold text-[#005670]">{client?.unitNumber}</p>
      </div>
      {client?.phoneNumber && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
          <p className="text-lg">{client.phoneNumber}</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase">Registered</label>
        <p className="text-lg">
          {client?.createdAt
            ? new Date(client?.createdAt).toLocaleDateString()
            : '-'}
        </p>
      </div>
    </div>

    {client?.questionnaire && (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
        <h4 className="text-lg font-bold mb-4">📋 Questionnaire</h4>
        <div className="space-y-3 text-sm">
          {client.questionnaire.designStyle?.length > 0 && (
            <div>
              <span className="font-semibold">Design:</span>{' '}
              {client.questionnaire.designStyle.join(', ')}
            </div>
          )}
          {client.questionnaire.colorPalette?.length > 0 && (
            <div>
              <span className="font-semibold">Colors:</span>{' '}
              {client.questionnaire.colorPalette.join(', ')}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
));

export default ClientManagement;
