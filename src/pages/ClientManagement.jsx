import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, X, Loader2, Check, XIcon, Eye, DollarSign, Receipt,
  Search, Filter, Sparkles, FileText, AlertCircle, Calendar, MapPin, Mail, Phone,
  User, Building2, CreditCard, CheckCircle, Clock
} from 'lucide-react';
import { backendServer } from '../utils/info';
import AdminJourneyManager from '../components/AdminJourneyManager';

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
  const [activeModal, setActiveModal] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    clientCode: '', name: '', email: '', password: '', unitNumber: '', floorPlan: '',
    totalAmount: 0, downPaymentPercentage: 30
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Approval Data
  const [approvalMode, setApprovalMode] = useState('approve');
  const [approvalData, setApprovalData] = useState({ clientCode: '', floorPlan: '', rejectionReason: '' });

  // Payment Data
  const [paymentData, setPaymentData] = useState({
    amount: 0, date: new Date().toISOString().split('T')[0], method: '', reference: '', notes: ''
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchClients();
    fetchFloorPlans();
    fetchPendingCount();
  }, []);

  useEffect(() => { fetchClients(); }, [currentPage, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setCurrentPage(1); fetchClients(); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ==================== API CALLS ====================
  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/clients?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${statusFilter}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setClients(data.clients);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/floor-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFloorPlans(await res.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/pending-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingCount((await res.json()).pendingCount);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== HANDLERS ====================
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? `${backendServer}/api/clients`
        : `${backendServer}/api/clients/${selectedClient._id}`;
      
      const submitData = { ...formData };
      if (!showPasswordField && modalMode === 'edit') delete submitData.password;

      const res = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Failed');

      await fetchClients();
      await fetchPendingCount();
      closeModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = approvalMode === 'approve' ? 'approve' : 'reject';
      
      const res = await fetch(`${backendServer}/api/clients/${selectedClient._id}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalMode === 'approve' 
          ? { clientCode: approvalData.clientCode, floorPlan: approvalData.floorPlan }
          : { reason: approvalData.rejectionReason }
        )
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Failed');

      await fetchClients();
      await fetchPendingCount();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/${selectedClient._id}/record-payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          paymentDate: paymentData.date,
          paymentMethod: paymentData.method,
          transactionReference: paymentData.reference,
          notes: paymentData.notes
        })
      });

      if (!res.ok) throw new Error('Failed to record payment');

      await fetchClients();
      closeModal();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to record payment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendServer}/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchClients();
      await fetchPendingCount();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInitializeJourney = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert('Journey initialized!');
        setSelectedClient(clients.find(c => c._id === clientId));
        setActiveModal('journey');
      } else {
        alert((await res.json()).message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initialize journey');
    }
  };

  // ==================== HELPERS ====================
  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientCode) newErrors.clientCode = 'Required';
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (!formData.unitNumber) newErrors.unitNumber = 'Required';
    if (!formData.floorPlan) newErrors.floorPlan = 'Required';
    if (modalMode === 'create' && !formData.password) newErrors.password = 'Required';
    if (showPasswordField && modalMode === 'edit' && formData.password?.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedClient(null);
    setFormData({ clientCode: '', name: '', email: '', password: '', unitNumber: '', floorPlan: '', totalAmount: 0, downPaymentPercentage: 30 });
    setApprovalData({ clientCode: '', floorPlan: '', rejectionReason: '' });
    setPaymentData({ amount: 0, date: new Date().toISOString().split('T')[0], method: '', reference: '', notes: '' });
    setErrors({});
    setShowPasswordField(false);
  };

  const openFormModal = (mode, client = null) => {
    setModalMode(mode);
    setSelectedClient(client);
    if (client && mode === 'edit') {
      setFormData({
        clientCode: client.clientCode || '',
        name: client.name,
        email: client.email,
        unitNumber: client.unitNumber,
        floorPlan: client.floorPlan || '',
        password: '',
        totalAmount: client.paymentInfo?.totalAmount || 0,
        downPaymentPercentage: client.paymentInfo?.downPaymentPercentage || 30
      });
    }
    setActiveModal('form');
  };

  const openApprovalModal = (client, mode) => {
    setSelectedClient(client);
    setApprovalMode(mode);
    setApprovalData({
      clientCode: client.clientCode || '',
      floorPlan: client.floorPlan || '',
      rejectionReason: ''
    });
    setActiveModal('approval');
  };

  const openPaymentModal = (client) => {
    setSelectedClient(client);
    const requiredDP = (client.paymentInfo?.totalAmount || 0) * ((client.paymentInfo?.downPaymentPercentage || 30) / 100);
    setPaymentData({
      amount: requiredDP,
      date: new Date().toISOString().split('T')[0],
      method: '',
      reference: '',
      notes: ''
    });
    setActiveModal('payment');
  };

  const getBadge = (status, type = 'status') => {
    const badges = {
      status: {
        'pending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
        'approved': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Approved' },
        'rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: XIcon, label: 'Rejected' },
        'admin-created': { bg: 'bg-blue-100', text: 'text-blue-700', icon: User, label: 'Admin' }
      },
      payment: {
        'paid': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Paid' },
        'partial': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Partial' },
        'overdue': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Overdue' },
        'not-paid': { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Unpaid' },
        'default': { bg: 'bg-gray-100', text: 'text-gray-600', icon: null, label: '-' }
      }
    };

    const config = type === 'status' 
      ? (status === 'admin-created' ? badges.status['admin-created'] : badges.status[status])
      : badges.payment[status] || badges.payment['default'];

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

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

      {/* Clients Table/Cards */}
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
                          {client.name.charAt(0).toUpperCase()}
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
                              DP: ${((client.paymentInfo.totalAmount * (client.paymentInfo.downPaymentPercentage || 30)) / 100).toLocaleString()}
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
                        {getBadge(client.registrationType === 'admin-created' ? 'admin-created' : client.status, 'status')}
                        {getBadge(client.paymentInfo?.downPaymentStatus, 'payment')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {client.registrationType === 'self-registered' ? (
                          <>
                            <ActionButton icon={Check} color="green" onClick={() => openApprovalModal(client, 'approve')} title="Approve" size="sm" />
                            <ActionButton icon={XIcon} color="red" onClick={() => openApprovalModal(client, 'reject')} title="Reject" size="sm" />
                            <ActionButton icon={Eye} color="blue" onClick={() => openFormModal('view', client)} title="View" size="sm" />
                          </>
                        ) : (
                          <>
                            <ActionButton icon={Pencil} color="blue" onClick={() => openFormModal('edit', client)} title="Edit" size="sm" />
                            {client.paymentInfo?.downPaymentStatus === 'paid' ? (
                              <>
                                <ActionButton icon={Sparkles} color="purple" onClick={() => handleInitializeJourney(client._id)} title="Initialize Journey" size="sm" />
                                <ActionButton icon={FileText} color="cyan" onClick={() => { setSelectedClient(client); setActiveModal('journey'); }} title="Manage Journey" size="sm" />
                              </>
                            ) : (
                              <ActionButton icon={DollarSign} color="green" onClick={() => openPaymentModal(client)} title="Record Payment" size="sm" />
                            )}
                            {client.paymentInfo?.totalAmount > 0 && (
                              <ActionButton icon={Receipt} color="indigo" onClick={() => { setSelectedClient(client); setActiveModal('paymentDetails'); }} title="Payment Details" size="sm" />
                            )}
                            <ActionButton icon={Trash2} color="red" onClick={() => handleDelete(client._id)} title="Delete" size="sm" />
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
      {activeModal === 'form' && <FormModal />}
      {activeModal === 'approval' && <ApprovalModal />}
      {activeModal === 'payment' && <PaymentModal />}
      {activeModal === 'paymentDetails' && <PaymentDetailsModal />}
      {activeModal === 'journey' && <JourneyModal />}
    </div>
  );

  // ==================== MODAL COMPONENTS ====================
  function FormModal() {
    return (
      <Modal title={modalMode === 'create' ? '✨ Add New Client' : modalMode === 'edit' ? '✏️ Edit Client' : '👤 Client Details'} onClose={closeModal}>
        {modalMode === 'view' ? (
          <ViewMode client={selectedClient} />
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {errors.form && <Alert type="error" message={errors.form} />}
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Client Code" value={formData.clientCode} onChange={(v) => setFormData({...formData, clientCode: v})} error={errors.clientCode} required />
              <Input label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} error={errors.name} required />
              <Input label="Email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} error={errors.email} required />
              <Input label="Unit Number" value={formData.unitNumber} onChange={(v) => setFormData({...formData, unitNumber: v})} error={errors.unitNumber} required />
              <Select 
                label="Floor Plan" 
                value={formData.floorPlan} 
                onChange={(v) => setFormData({...formData, floorPlan: v})} 
                options={floorPlans.map(fp => ({ value: fp, label: fp }))}
                error={errors.floorPlan} 
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
                  type="number" 
                  value={formData.totalAmount} 
                  onChange={(v) => setFormData({...formData, totalAmount: parseFloat(v) || 0})} 
                  min="0" 
                  step="0.01" 
                />
                <Input 
                  label="DP Percentage (%)" 
                  type="number" 
                  value={formData.downPaymentPercentage} 
                  onChange={(v) => setFormData({...formData, downPaymentPercentage: parseInt(v) || 30})} 
                  min="0" 
                  max="100" 
                />
              </div>
              {formData.totalAmount > 0 && (
                <div className="mt-3 p-3 bg-white rounded-xl">
                  <p className="text-sm">Required DP: <strong className="text-[#005670]">${((formData.totalAmount * formData.downPaymentPercentage) / 100).toLocaleString()}</strong></p>
                </div>
              )}
            </div>

            {modalMode === 'create' ? (
              <Input label="Password" type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} error={errors.password} required />
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button type="button" onClick={() => setShowPasswordField(!showPasswordField)} className="text-sm text-[#005670] font-medium hover:underline">
                    {showPasswordField ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {showPasswordField && <Input type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} error={errors.password} placeholder="New password (min 6 chars)" />}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeModal} disabled={formLoading} className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" disabled={formLoading} className="px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg font-bold flex items-center gap-2">
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : modalMode === 'create' ? '✨ Create' : '💾 Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    );
  }

  function ApprovalModal() {
    return (
      <Modal 
        title={approvalMode === 'approve' ? '✅ Approve Registration' : '❌ Reject Registration'} 
        onClose={closeModal}
        headerClass={approvalMode === 'approve' ? 'from-emerald-600 to-teal-600' : 'from-red-600 to-rose-600'}
      >
        <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-1">
          <p className="text-sm"><strong>Client:</strong> {selectedClient?.name}</p>
          <p className="text-sm"><strong>Email:</strong> {selectedClient?.email}</p>
          <p className="text-sm"><strong>Unit:</strong> {selectedClient?.unitNumber}</p>
        </div>

        <form onSubmit={handleApprovalSubmit} className="space-y-4">
          {approvalMode === 'approve' ? (
            <>
              <Input label="Client Code" value={approvalData.clientCode} onChange={(v) => setApprovalData({...approvalData, clientCode: v})} required />
              <Select 
                label="Floor Plan" 
                value={approvalData.floorPlan} 
                onChange={(v) => setApprovalData({...approvalData, floorPlan: v})} 
                options={floorPlans.map(fp => ({ value: fp, label: fp }))}
                required 
              />
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                value={approvalData.rejectionReason}
                onChange={(e) => setApprovalData({...approvalData, rejectionReason: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 resize-none"
                rows="4"
                placeholder="Optional..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} disabled={formLoading} className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
            <button 
              type="submit" 
              disabled={formLoading} 
              className={`px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 ${approvalMode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : approvalMode === 'approve' ? <><Check className="w-5 h-5" /> Approve</> : <><XIcon className="w-5 h-5" /> Reject</>}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  function PaymentModal() {
    const requiredDP = (selectedClient?.paymentInfo?.totalAmount || 0) * ((selectedClient?.paymentInfo?.downPaymentPercentage || 30) / 100);
    
    return (
      <Modal title="💰 Record Down Payment" onClose={closeModal}>
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
          <p className="text-sm"><strong>Client:</strong> {selectedClient?.name}</p>
          <p className="text-sm"><strong>Required DP:</strong> <strong className="text-[#005670]">${requiredDP.toLocaleString()}</strong></p>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Input label="Payment Amount ($)" type="number" value={paymentData.amount} onChange={(v) => setPaymentData({...paymentData, amount: parseFloat(v)})} min="0" step="0.01" required />
          <Input label="Payment Date" type="date" value={paymentData.date} onChange={(v) => setPaymentData({...paymentData, date: v})} required />
          <Select 
            label="Payment Method" 
            value={paymentData.method} 
            onChange={(v) => setPaymentData({...paymentData, method: v})} 
            options={[
              { value: 'bank-transfer', label: 'Bank Transfer' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'check', label: 'Check' },
              { value: 'cash', label: 'Cash' },
              { value: 'other', label: 'Other' }
            ]}
            required 
          />
          <Input label="Transaction Reference" value={paymentData.reference} onChange={(v) => setPaymentData({...paymentData, reference: v})} placeholder="Optional" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 resize-none"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} disabled={formLoading} className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={formLoading} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2">
              {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Recording...</> : <><DollarSign className="w-5 h-5" /> Record Payment</>}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  function PaymentDetailsModal() {
    const client = selectedClient;
    if (!client) return null;

    const requiredDP = (client.paymentInfo?.totalAmount || 0) * ((client.paymentInfo?.downPaymentPercentage || 30) / 100);
    const amountPaid = client.paymentInfo?.amountPaid || 0;
    const balance = (client.paymentInfo?.totalAmount || 0) - amountPaid;

    return (
      <Modal title="📊 Payment Details" onClose={closeModal} size="large">
        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div><p className="text-sm text-gray-600">Client</p><p className="font-bold">{client.name}</p></div>
          <div><p className="text-sm text-gray-600">Unit</p><p className="font-bold">{client.unitNumber}</p></div>
          <div><p className="text-sm text-gray-600">Code</p><p className="font-bold">{client.clientCode || '-'}</p></div>
          <div><p className="text-sm text-gray-600">Floor Plan</p><p className="font-bold">{client.floorPlan || '-'}</p></div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 mb-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Payment Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Total Amount:</span><span className="font-bold">${(client.paymentInfo?.totalAmount || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Required DP ({client.paymentInfo?.downPaymentPercentage || 30}%):</span><span className="font-bold">${requiredDP.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount Paid:</span><span className="font-bold text-emerald-600">${amountPaid.toLocaleString()}</span></div>
            <div className="flex justify-between pt-3 border-t border-blue-300"><span className="text-gray-600">Remaining Balance:</span><span className="font-bold text-red-600">${balance.toLocaleString()}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-600">Status:</span>{getBadge(client.paymentInfo?.downPaymentStatus, 'payment')}</div>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">📋 Payment History</h4>
          {client.paymentInfo?.payments?.length > 0 ? (
            <div className="space-y-3">
              {client.paymentInfo.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map((payment, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg">${(payment.amount || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Paid</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div><span className="text-gray-600">Method:</span> <span className="font-medium capitalize">{(payment.paymentMethod || '-').replace('-', ' ')}</span></div>
                    {payment.transactionReference && <div><span className="text-gray-600">Ref:</span> <span className="font-medium">{payment.transactionReference}</span></div>}
                  </div>
                  {payment.notes && <p className="text-sm text-gray-600 mt-2 pt-2 border-t"><strong>Notes:</strong> {payment.notes}</p>}
                  <p className="text-xs text-gray-500 mt-2">Recorded by: {payment.recordedBy || 'System'} • {new Date(payment.recordedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500"><Receipt className="w-12 h-12 mx-auto mb-2 text-gray-400" /><p>No payment history</p></div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={closeModal} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium">Close</button>
        </div>
      </Modal>
    );
  }

  function JourneyModal() {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center rounded-t-3xl z-10">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3"><Sparkles className="w-8 h-8" /> Journey Manager</h2>
              <p className="text-white/80 text-sm mt-1">{selectedClient?.name} • Unit {selectedClient?.unitNumber}</p>
            </div>
            <button onClick={closeModal} className="p-3 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <AdminJourneyManager clientId={selectedClient?._id} clientName={selectedClient?.name} />
          </div>
        </div>
      </div>
    );
  }
};

// ==================== UTILITY COMPONENTS ====================
const Modal = ({ title, children, onClose, headerClass = 'from-[#005670] to-[#007a9a]', size = 'default' }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className={`bg-white rounded-3xl ${size === 'large' ? 'max-w-4xl' : 'max-w-2xl'} w-full max-h-[90vh] overflow-auto shadow-2xl animate-[slideUp_0.3s_ease-out]`}>
      <div className={`sticky top-0 bg-gradient-to-r ${headerClass} text-white p-6 flex justify-between items-center rounded-t-3xl z-10`}>
        <h3 className="text-2xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, value, onChange, error, type = 'text', required = false, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-all"
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, error, required = false }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white transition-all"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const ActionButton = ({ icon: Icon, color, onClick, title, size = 'md' }) => {
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
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

const Alert = ({ type, message }) => {
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
};

const ViewMode = ({ client }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase">Name</label><p className="text-lg font-bold">{client?.name}</p></div>
      <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase">Email</label><p className="text-lg">{client?.email}</p></div>
      <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase">Unit</label><p className="text-lg font-bold text-[#005670]">{client?.unitNumber}</p></div>
      {client?.phoneNumber && <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase">Phone</label><p className="text-lg">{client.phoneNumber}</p></div>}
      <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase">Registered</label><p className="text-lg">{new Date(client?.createdAt).toLocaleDateString()}</p></div>
    </div>
    
    {client?.questionnaire && (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
        <h4 className="text-lg font-bold mb-4">📋 Questionnaire</h4>
        <div className="space-y-3 text-sm">
          {client.questionnaire.designStyle?.length > 0 && <div><span className="font-semibold">Design:</span> {client.questionnaire.designStyle.join(', ')}</div>}
          {client.questionnaire.colorPalette?.length > 0 && <div><span className="font-semibold">Colors:</span> {client.questionnaire.colorPalette.join(', ')}</div>}
        </div>
      </div>
    )}
  </div>
);

export default ClientManagement;