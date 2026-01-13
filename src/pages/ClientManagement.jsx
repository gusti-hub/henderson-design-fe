import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, X, Loader2, Check, XIcon, Eye, FileText,
  Search, Filter, Sparkles, AlertCircle, Mail, Phone,
  User, Building2, CheckCircle, Clock, ClipboardList, MapPin, TrendingUp,
  Calendar, Activity, ChevronLeft, ChevronRight, ClipboardCheck,
  ShoppingBag, Download // Tambahkan ini
} from 'lucide-react';
import { backendServer } from '../utils/info';
import AdminJourneyManager from '../components/AdminJourneyManager';

const DESIGN_IMAGES = {
  1: '/images/collections/1.jpg',
  2: '/images/collections/2.jpg',
  3: '/images/collections/3.jpg',
  4: '/images/collections/4.jpg',
  5: '/images/collections/5.jpg',
  7: '/images/collections/7.jpg',
  8: '/images/collections/8.jpg',
  10: '/images/collections/10.jpg',
  11: '/images/collections/11.jpg',
  12: '/images/collections/12.jpg',
  13: '/images/collections/13.jpg',
  15: '/images/collections/15.jpg',
  16: '/images/collections/16.jpg',
  17: '/images/collections/17.jpg',
  18: '/images/collections/18.jpg',
  19: '/images/collections/19.jpg',
  21: '/images/collections/21.jpg',
  26: '/images/collections/26.jpg',
  27: '/images/collections/27.jpg',
  28: '/images/collections/28.jpg',
};

const DESIGN_TITLES = {
  1: 'Design 1',
  2: 'Design 2',
  3: 'Design 3',
  4: 'Design 4',
  7: 'Design 5',
  8: 'Design 6',
  10: 'Design 7',
  11: 'Design 8',
  12: 'Design 9',
  13: 'Design 10',
  15: 'Design 11',
  16: 'Design 12',
};

const PRICING_TABLE = {
  'Nalu Foundation Collection': { '1': 2500, '2': 3500, '3': 4500 },
  'Nalu Collection': { '1': 5000, '2': 7500, '3': 10000 },
  'Lani': { '1': 10000, '2': 15000, '3': 20000 }
};

const COLLECTIONS = Object.keys(PRICING_TABLE);
const BEDROOM_OPTIONS = ['1', '2', '3'];

// ==================== IMAGE LIGHTBOX COMPONENT ====================
const ImageLightbox = ({ isOpen, onClose, imageUrl, designId, designTitle }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all group"
      >
        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">{designTitle || `Design ${designId}`}</p>
              <p className="text-sm text-white/70">Design #{designId}</p>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative max-w-6xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={imageUrl}
            alt={designTitle || `Design ${designId}`}
            className="w-full h-full object-contain max-h-[85vh]"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          />
          
        <div className="absolute bottom-4 right-4">
          <a
            href={imageUrl}
            download={`design-${designId}.jpg`}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#007a9a] text-white rounded-lg transition-all shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-medium">Download</span>
          </a>
        </div>

        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white text-sm">
          Press <kbd className="px-2 py-1 bg-white/20 rounded mx-1 font-mono">ESC</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
};

// ==================== ORDERS MODAL COMPONENT ====================
const OrdersModal = React.memo(({ selectedClient, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchClientOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${backendServer}/api/orders/client/${selectedClient._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching client orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedClient) {
      fetchClientOrders();
    }
  }, [selectedClient]);

  const handleDownload = async (orderId, type) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download ${type}`);
      }
      
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      const fileExtension = contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ongoing' },
      confirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Confirmed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      review: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Review' }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.ongoing;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        <CheckCircle className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Client Orders
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {selectedClient?.name} • Unit {selectedClient?.unitNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {downloading && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                <Loader2 className="w-6 h-6 animate-spin text-[#005670]" />
                <span className="text-sm font-medium text-gray-700">Downloading...</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">
                This client hasn't created any orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#005670] transition-all"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.selectedPlan?.title || 'Order'}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {order.selectedPlan?.bedrooms || 'N/A'} BR
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Order ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900">
                        {order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  {order.selections && Object.keys(order.selections).length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                        Selected Areas
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(order.selections).map(([areaName, items]) => (
                          <div key={areaName} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#005670] rounded-full" />
                            <span className="text-sm text-gray-700">
                              {areaName} ({items.length})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                      <p className="text-xs font-bold text-blue-900 mb-1">Admin Notes</p>
                      <p className="text-sm text-blue-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDownload(order._id, 'summary')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download Summary
                    </button>
                    <button
                      onClick={() => window.open(`/admin/orders/${order._id}`, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#005670] to-[#007a9a] rounded-xl hover:shadow-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
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
});

// ==================== MAIN COMPONENT ====================

const ClientManagement = () => {
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

  const [clientJourneys, setClientJourneys] = useState({});

  const [activeModal, setActiveModal] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    unitNumber: '',
    floorPlan: '',
    propertyType: 'Lock 2025 Pricing',
    collection: '',
    bedroomCount: '',
    packageType: 'investor', // ✅ ADD THIS NEW FIELD
    calculatedAmount: 0
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [approvalMode, setApprovalMode] = useState('approve');
  const [approvalData, setApprovalData] = useState({ clientCode: '', floorPlan: '', rejectionReason: '' });

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
        setTotalPages(data.totalPages || Math.ceil((data.count || 0) / itemsPerPage) || 1);
        
        (data.data || []).forEach(client => {
          fetchClientJourney(client._id);
        });
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

  const fetchClientJourney = useCallback(async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      
      const journeyRes = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let journeyData = {};
      if (journeyRes.ok) {
        journeyData = await journeyRes.json();
      }

      console.log('12345');
      
      const questionnaireRes = await fetch(`${backendServer}/api/questionnaires/client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let hasQuestionnaire = false;
      let questionnaireData = null;
      if (questionnaireRes.ok) {
        const qData = await questionnaireRes.json();
        if (qData.success && qData.questionnaire) {
          if (qData.questionnaire.submittedAt || qData.questionnaire.isFirstTimeComplete) {
            hasQuestionnaire = true;
            questionnaireData = qData.questionnaire;
          }
        }
      }
      
      setClientJourneys(prev => ({
        ...prev,
        [clientId]: {
          ...journeyData,
          hasQuestionnaire,
          questionnaire: questionnaireData
        }
      }));
    } catch (error) {
      console.error(`Error fetching data for client ${clientId}:`, error);
    }
  }, []);

  useEffect(() => {
    if (activeModal === 'journey') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
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

  useEffect(() => {
    fetchClients();
    fetchFloorPlans();
    fetchPendingCount();
  }, [fetchClients, fetchFloorPlans, fetchPendingCount]);

  useEffect(() => {
    if (activeModal) return;
    fetchClients();
  }, [currentPage, statusFilter, activeModal, fetchClients]);

  useEffect(() => {
    if (activeModal) return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchClients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeModal, fetchClients]);

  useEffect(() => {
    if (formData.collection) {
      let autoPackageType = 'investor'; // default
      
      if (formData.collection === 'Nalu Foundation Collection') {
        autoPackageType = 'library';
      } else if (formData.collection === 'Nalu Collection') {
        autoPackageType = 'investor';
      } else if (formData.collection === 'Lani') {
        autoPackageType = 'custom';
      } else if (formData.collection === 'Custom') { // ✅ TAMBAH INI
        autoPackageType = 'custom';
      }
      
      setFormData(prev => ({ ...prev, packageType: autoPackageType }));
    }

    // ✅ Calculate pricing (skip untuk library dan custom)
    if (formData.packageType === 'library' || formData.packageType === 'custom') {
      setFormData(prev => ({ ...prev, calculatedAmount: 0 }));
      return;
    }
    
    if (formData.collection && formData.bedroomCount) {
      const amount = PRICING_TABLE[formData.collection][formData.bedroomCount] || 0;
      setFormData(prev => ({ ...prev, calculatedAmount: amount }));
    } else {
      setFormData(prev => ({ ...prev, calculatedAmount: 0 }));
    }
  }, [formData.collection, formData.bedroomCount, formData.packageType]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Basic required fields
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (!formData.unitNumber) newErrors.unitNumber = 'Required';
    if (!formData.propertyType) newErrors.propertyType = 'Required';
    
    // ✅ Floor plan TIDAK required untuk Custom package
    if (formData.packageType !== 'custom' && !formData.floorPlan) {
      newErrors.floorPlan = 'Required';
    }
    
    // ✅ Collection dan bedroom HANYA untuk CREATE mode
    if (modalMode === 'create') {
      if (!formData.collection) newErrors.collection = 'Required';
      
      // ✅ Bedroom count TIDAK required untuk Custom atau Library
      if (formData.packageType !== 'library' && formData.packageType !== 'custom') {
        if (!formData.bedroomCount) newErrors.bedroomCount = 'Required';
      }
    }
    
    // Password validation
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Required';
    }
    
    if (showPasswordField && modalMode === 'edit' && formData.password?.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, modalMode, showPasswordField]);

  const resetFormState = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '12345678',
      unitNumber: '',
      floorPlan: '',
      propertyType: 'Lock 2025 Pricing',
      collection: '',
      bedroomCount: '',
      packageType: 'investor', // ✅ ADD THIS
      calculatedAmount: 0
    });
    setApprovalData({ clientCode: '', floorPlan: '', rejectionReason: '' });
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
        name: client.name || '',
        email: client.email || '',
        unitNumber: client.unitNumber || '',
        floorPlan: client.floorPlan || '',
        propertyType: client.propertyType || 'Lock 2025 Pricing',
        password: '',
        collection: '',
        bedroomCount: '',
        packageType: client.packageType || 'investor',
        calculatedAmount: client.paymentInfo?.totalAmount || 0
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

  const openJourneyModal = useCallback((client) => {
    setSelectedClient(client);
    setActiveModal('journey');
  }, []);

  const openQuestionnaireModal = useCallback((client) => {
    setSelectedClient(client);
    setActiveModal('questionnaire');
  }, []);

  // ✅ NEW: Open Orders Modal
  const openOrdersModal = useCallback((client) => {
    setSelectedClient(client);
    setActiveModal('orders');
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

  const getPackageTypeBadge = useCallback((packageType) => {
    const badges = {
      investor: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nalu' },
      custom: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Lani' },
      library: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Library' },
    };

    const badge = badges[packageType] || badges.investor;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create'
        ? `${backendServer}/api/clients`
        : `${backendServer}/api/clients/${selectedClient._id}`;

      // ✅ BASE SUBMIT DATA - ONLY required fields
      const submitData = {
        name: formData.name,
        email: formData.email,
        unitNumber: formData.unitNumber,
        propertyType: formData.propertyType,
        packageType: formData.packageType,
        floorPlan: formData.packageType === 'custom' ? 'Custom Project' : formData.floorPlan,
      };

      if (modalMode === 'create') {
        // Password required for create
        submitData.password = formData.password;
        
        // Collection required for create
        submitData.collection = formData.collection;
        
        // ✅ ONLY add bedroomCount if:
        // 1. NOT custom package
        // 2. NOT library package
        // 3. bedroomCount has actual value
        if (formData.packageType !== 'custom' && 
            formData.packageType !== 'library' && 
            formData.bedroomCount) {
          submitData.bedroomCount = formData.bedroomCount;
        }
        
        // ✅ Add customNotes if custom package
        if (formData.packageType === 'custom' && formData.customNotes) {
          submitData.customNotes = formData.customNotes;
        }
      } else if (showPasswordField && formData.password) {
        // Update mode - only if changing password
        submitData.password = formData.password;
      }

      console.log('📤 Submitting client data:', submitData);

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
      
      if (modalMode === 'create') {
        alert('✅ Client created and journey initialized successfully!');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setFormLoading(false);
    }
  };

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

  const paginationPages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6">
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
        </div>
      </div>

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
          clientJourneys={clientJourneys}
          getBadge={getBadge}
          getPackageTypeBadge={getPackageTypeBadge}
          onOpenFormModal={openFormModal}
          onOpenApprovalModal={openApprovalModal}
          onDeleteClient={handleDelete}
          onOpenJourneyModal={openJourneyModal}
          onOpenQuestionnaireModal={openQuestionnaireModal}
          onOpenOrdersModal={openOrdersModal}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
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
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

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

      {activeModal === 'journey' && selectedClient && (
        <JourneyModal selectedClient={selectedClient} onClose={closeModal} />
      )}

      {activeModal === 'questionnaire' && selectedClient && (
        <QuestionnaireModal selectedClient={selectedClient} onClose={closeModal} />
      )}

      {activeModal === 'orders' && selectedClient && (
        <OrdersModal selectedClient={selectedClient} onClose={closeModal} />
      )}
    </div>
  );
};

// ==================== CLIENT TABLE ====================

const ClientTable = React.memo(
  ({
    clients,
    clientJourneys,
    getBadge,
    getPackageTypeBadge, // ✅ ADD THIS
    onOpenFormModal,
    onOpenApprovalModal,
    onDeleteClient,
    onOpenJourneyModal,
    onOpenQuestionnaireModal,
    onOpenOrdersModal
  }) => {
    
    const getJourneyStatus = (clientId) => {
      const journey = clientJourneys[clientId];
      if (!journey || !journey.steps) {
        return { step: '-', stage: 'Not Started', status: 'not-started' };
      }
      
      const completedSteps = journey.steps.filter(s => s.status === 'completed');
      if (completedSteps.length === 0) {
        return { step: '1', stage: journey.steps[0]?.stage || 'Starting', status: 'in-progress' };
      }
      
      const lastCompleted = completedSteps[completedSteps.length - 1];
      return {
        step: lastCompleted.step,
        stage: lastCompleted.stage,
        status: 'completed'
      };
    };
    
    const hasQuestionnaire = (clientId) => {
      return clientJourneys[clientId]?.hasQuestionnaire || false;
    };
    
    const formatLastLogin = (lastLogin) => {
      if (!lastLogin) return 'Never';
      
      const date = new Date(lastLogin);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Journey Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Property Type</th> 
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => {
                const journeyStatus = getJourneyStatus(client._id);
                const hasQuest = hasQuestionnaire(client._id);
                
                return (
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors">
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

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </p>
                        {client.phoneNumber && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            {client.phoneNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          Unit {client.unitNumber}
                        </p>
                        <p className="text-xs text-gray-500">{client.floorPlan || '-'}</p>
                      </div>
                    </td>


                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-[#005670] flex-shrink-0" />
                          <span className="text-sm font-bold text-[#005670]">
                            Step {journeyStatus.step}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate max-w-[180px]">
                          {journeyStatus.stage}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className={`text-xs font-medium ${
                          client.lastLogin ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {formatLastLogin(client.lastLogin)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          {client.propertyType}
                        </p>
                      </div>
                    </td>

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

                            <ActionButton
                              icon={FileText}
                              color="purple"
                              onClick={() => onOpenJourneyModal(client)}
                              title="Manage Journey"
                              size="sm"
                            />

                            <ActionButton
                              icon={hasQuest ? ClipboardCheck : ClipboardList}
                              color={hasQuest ? 'green' : 'amber'}
                              onClick={() => onOpenQuestionnaireModal(client)}
                              title={hasQuest ? "View Questionnaire ✓" : "Questionnaire Pending"}
                              size="sm"
                              pulse={!hasQuest}
                            />

                            {/* <ActionButton
                              icon={ShoppingBag}
                              color="indigo"
                              onClick={() => onOpenOrdersModal(client)}
                              title="View Orders"
                              size="sm"
                            /> */}

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
                );
              })}
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
              {/* ✅ FLOOR PLAN - HIDE UNTUK CUSTOM PACKAGE */}
              {formData.collection !== 'Custom' && (
                <Select
                  label="Floor Plan"
                  value={formData.floorPlan}
                  onChange={(v) => setFormData(prev => ({ ...prev, floorPlan: v }))}
                  options={floorPlans.map((fp) => ({ value: fp, label: fp }))}
                  error={errors.floorPlan}
                  required
                />
              )}
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

            {modalMode === 'create' && (
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Pricing Information
                </h4>
                
                {/* ✅ COLLECTION DROPDOWN - TAMBAH OPTION CUSTOM */}
                <div className="mb-4">
                  <Select
                    label="Collection"
                    value={formData.collection}
                    onChange={(v) => setFormData(prev => ({ 
                      ...prev, 
                      collection: v,
                      // ✅ Reset bedroom count kalau pilih Custom
                      bedroomCount: v === 'Custom' ? '' : prev.bedroomCount,
                      // ✅ Reset floor plan kalau pilih Custom
                      floorPlan: v === 'Custom' ? '' : prev.floorPlan
                    }))}
                    options={[
                      { value: 'Nalu Foundation Collection', label: 'Nalu Foundation Collection' },
                      { value: 'Nalu Collection', label: 'Nalu Collection' },
                      { value: 'Lani', label: 'Lani' },
                      { value: 'Custom', label: '✨ Custom (Manual Input)' } // ✅ BARU
                    ]}
                    error={errors.collection}
                    required
                  />
                </div>

                {/* ✅ CONDITIONAL RENDERING */}
                {formData.collection === 'Custom' ? (
                  // ========================================
                  // TAMPILAN UNTUK CUSTOM PACKAGE
                  // ========================================
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900 mb-1">
                            🎨 Custom Package Selected
                          </p>
                          <p className="text-xs text-purple-700 leading-relaxed">
                            • Designer akan input barang secara manual<br/>
                            • Tidak perlu pilih floor plan<br/>
                            • Bisa input gambar, link, dan spesifikasi detail
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Optional Custom Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Notes (Optional)
                      </label>
                      <textarea
                        value={formData.customNotes || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          customNotes: e.target.value 
                        }))}
                        placeholder="Contoh: Client ingin furniture tema minimalis modern..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  // ========================================
                  // TAMPILAN UNTUK PACKAGE BIASA (Nalu/Lani)
                  // ========================================
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Select
                        label="Bedroom Count"
                        value={formData.bedroomCount}
                        onChange={(v) => setFormData(prev => ({ ...prev, bedroomCount: v }))}
                        options={BEDROOM_OPTIONS.map(b => ({ 
                          value: b, 
                          label: `${b} Bedroom` 
                        }))}
                        error={errors.bedroomCount}
                        required
                      />
                    </div>
                    
                    {formData.calculatedAmount > 0 && (
                      <div className="mt-4 p-4 bg-white rounded-xl border-2 border-emerald-300">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Total Amount:</span>
                          <span className="text-2xl font-black text-emerald-600">
                            ${formData.calculatedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Package Type Badge */}
                {formData.collection && (
                  <div className="mt-4 p-3 bg-white rounded-xl border-2 border-emerald-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Package Type:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        formData.packageType === 'library' ? 'bg-teal-100 text-teal-800' :
                        formData.packageType === 'custom' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {formData.packageType === 'library' ? '🎨 Library (Drag & Drop)' :
                        formData.packageType === 'custom' ? '✨ Custom Package' :
                        '📦 Nalu Package'}
                      </span>
                    </div>
                    {formData.packageType === 'custom' && (
                      <p className="text-xs text-purple-600 mt-2">
                        💡 Floor plan tidak diperlukan untuk custom package
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg font-bold flex items-center gap-2 transition-all"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : modalMode === 'create' ? (
                  '✨ Create & Initialize'
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
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className={`px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 transition-all ${
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

const JourneyModal = React.memo(({ selectedClient, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
      <div className="flex-shrink-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Journey Manager
          </h2>
          <p className="text-white/90 text-xs mt-0.5">
            {selectedClient?.name} • Unit {selectedClient?.unitNumber}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50">
        <AdminJourneyManager
          clientId={selectedClient?._id}
          clientName={selectedClient?.name}
          onClose={onClose}
          hideHeader={true}
        />
      </div>
    </div>
  );
});

const QuestionnaireModal = React.memo(({ selectedClient, onClose }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    homeUse: true,
    design: false,
    entertaining: false,
    bedrooms: false,
    art: false,
    likedDesigns: false,
    addons: false
  });

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    imageUrl: '',
    designId: null,
    designTitle: ''
  });

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendServer}/api/questionnaires/client/${selectedClient._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.questionnaire) {
            // Check if questionnaire is actually filled (has submittedAt)
            if (data.questionnaire.submittedAt) {
              setQuestionnaire(data.questionnaire);
            } else {
              setQuestionnaire(null);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [selectedClient._id]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <Modal title="📋 Client Questionnaire" onClose={onClose} size="large">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      </Modal>
    );
  }

  // Updated: Check for questionnaire existence and submittedAt
  if (!questionnaire || !questionnaire.submittedAt) {
    return (
      <Modal title="📋 Client Questionnaire" onClose={onClose} size="large">
        <div className="text-center py-12">
          <div className="relative inline-block mb-6">
            <ClipboardList className="w-20 h-20 text-gray-300 mx-auto" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Questionnaire Not Completed</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            <strong>{selectedClient.name}</strong> has not completed their design questionnaire yet.
          </p>
          
          <div className="max-w-lg mx-auto space-y-4">
            {/* Info Box */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-xl text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-blue-900 mb-1">Client Information</p>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><strong>Name:</strong> {selectedClient.name}</p>
                    <p><strong>Email:</strong> {selectedClient.email}</p>
                    <p><strong>Unit:</strong> {selectedClient.unitNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Suggestions */}
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 mb-2">Next Steps</p>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Send a reminder email to the client</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Follow up via phone to discuss their preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Questionnaire must be completed before proceeding with design</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="📋 Client Questionnaire" onClose={onClose} size="large">
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">
              Status: <span className="text-blue-600">Submitted</span>
            </p>
            <p className="text-sm text-gray-600">
              Submitted: {questionnaire.submittedAt ? new Date(questionnaire.submittedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Home Use & Lifestyle */}
        <CollapsibleSection
          icon="🏠"
          title="Home Use & Lifestyle"
          isExpanded={expandedSections.homeUse}
          onToggle={() => toggleSection('homeUse')}
        >
          {questionnaire.purpose_of_residence && questionnaire.purpose_of_residence.length > 0 && (
            <DataRow label="Purpose of Residence" value={questionnaire.purpose_of_residence.join(', ')} />
          )}
          {questionnaire.who_will_use && questionnaire.who_will_use.length > 0 && (
            <DataRow label="Who Will Use" value={questionnaire.who_will_use.join(', ')} />
          )}
          {questionnaire.family_members && (
            <DataRow label="Family Members" value={questionnaire.family_members} />
          )}
          {questionnaire.children_ages && (
            <DataRow label="Children Ages" value={questionnaire.children_ages} />
          )}
          {questionnaire.living_envision && questionnaire.living_envision.length > 0 && (
            <DataRow label="Living Envision" value={questionnaire.living_envision.join(', ')} />
          )}
          {questionnaire.home_feeling && questionnaire.home_feeling.length > 0 && (
            <DataRow label="Home Feeling" value={questionnaire.home_feeling.join(', ')} />
          )}
          {questionnaire.has_pets && (
            <>
              <DataRow label="Has Pets" value="Yes" />
              {questionnaire.pet_details && (
                <DataRow label="Pet Details" value={questionnaire.pet_details} />
              )}
            </>
          )}
          {questionnaire.has_renters && (
            <DataRow label="Has Renters" value="Yes" />
          )}
        </CollapsibleSection>

        {/* Daily Living */}
        <CollapsibleSection
          icon="🏡"
          title="Daily Living & Entertaining"
          isExpanded={expandedSections.entertaining}
          onToggle={() => toggleSection('entertaining')}
        >
          {questionnaire.work_from_home && questionnaire.work_from_home.length > 0 && (
            <DataRow label="Work From Home" value={questionnaire.work_from_home.join(', ')} />
          )}
          {questionnaire.entertain_frequency && questionnaire.entertain_frequency.length > 0 && (
            <DataRow label="Entertain Frequency" value={questionnaire.entertain_frequency.join(', ')} />
          )}
          {questionnaire.gathering_types && questionnaire.gathering_types.length > 0 && (
            <DataRow label="Gathering Types" value={questionnaire.gathering_types.join(', ')} />
          )}
          {questionnaire.outdoor_lanai_use && questionnaire.outdoor_lanai_use.length > 0 && (
            <DataRow label="Outdoor/Lanai Use" value={questionnaire.outdoor_lanai_use.join(', ')} />
          )}
        </CollapsibleSection>

        {/* Design Aesthetic */}
        <CollapsibleSection
          icon="🎨"
          title="Design Aesthetic"
          isExpanded={expandedSections.design}
          onToggle={() => toggleSection('design')}
        >
          {questionnaire.unit_options && questionnaire.unit_options.length > 0 && (
            <DataRow label="Unit Options" value={questionnaire.unit_options.join(', ')} />
          )}
          {questionnaire.preferred_collection && questionnaire.preferred_collection.length > 0 && (
            <DataRow label="Preferred Collection" value={questionnaire.preferred_collection.join(', ')} />
          )}
          {questionnaire.style_direction && questionnaire.style_direction.length > 0 && (
            <DataRow label="Style Direction" value={questionnaire.style_direction.join(', ')} />
          )}
          {questionnaire.main_upholstery_color && questionnaire.main_upholstery_color.length > 0 && (
            <DataRow label="Main Upholstery Color" value={questionnaire.main_upholstery_color.join(', ')} />
          )}
          {questionnaire.accent_fabric_color && questionnaire.accent_fabric_color.length > 0 && (
            <DataRow label="Accent Fabric Color" value={questionnaire.accent_fabric_color.join(', ')} />
          )}
          {questionnaire.metal_tone && questionnaire.metal_tone.length > 0 && (
            <DataRow label="Metal Tone" value={questionnaire.metal_tone.join(', ')} />
          )}
          {questionnaire.tone_preference && questionnaire.tone_preference.length > 0 && (
            <DataRow label="Tone Preference" value={questionnaire.tone_preference.join(', ')} />
          )}
          {questionnaire.colors_to_avoid && (
            <DataRow label="Colors to Avoid" value={questionnaire.colors_to_avoid} />
          )}
        </CollapsibleSection>

        {/* Bedrooms & Comfort */}
        <CollapsibleSection
          icon="🛏️"
          title="Bedrooms & Comfort"
          isExpanded={expandedSections.bedrooms}
          onToggle={() => toggleSection('bedrooms')}
        >
          {questionnaire.bed_sizes && questionnaire.bed_sizes.length > 0 && (
            <DataRow label="Bed Sizes" value={questionnaire.bed_sizes.join(', ')} />
          )}
          {questionnaire.mattress_firmness && questionnaire.mattress_firmness.length > 0 && (
            <DataRow label="Mattress Firmness" value={questionnaire.mattress_firmness.join(', ')} />
          )}
          {questionnaire.bedding_type && questionnaire.bedding_type.length > 0 && (
            <DataRow label="Bedding Type" value={questionnaire.bedding_type.join(', ')} />
          )}
          {questionnaire.bedding_material_color && questionnaire.bedding_material_color.length > 0 && (
            <DataRow label="Bedding Material/Color" value={questionnaire.bedding_material_color.join(', ')} />
          )}
          {questionnaire.lighting_mood && questionnaire.lighting_mood.length > 0 && (
            <DataRow label="Lighting Mood" value={questionnaire.lighting_mood.join(', ')} />
          )}
        </CollapsibleSection>

        {/* Art & Accessories */}
        <CollapsibleSection
          icon="🖼️"
          title="Art & Accessories"
          isExpanded={expandedSections.art}
          onToggle={() => toggleSection('art')}
        >
          {questionnaire.art_style && questionnaire.art_style.length > 0 && (
            <DataRow label="Art Style" value={questionnaire.art_style.join(', ')} />
          )}
          {questionnaire.art_coverage && questionnaire.art_coverage.length > 0 && (
            <DataRow label="Art Coverage" value={questionnaire.art_coverage.join(', ')} />
          )}
          {questionnaire.accessories_styling && questionnaire.accessories_styling.length > 0 && (
            <DataRow label="Accessories Styling" value={questionnaire.accessories_styling.join(', ')} />
          )}
          {questionnaire.decorative_pillows && questionnaire.decorative_pillows.length > 0 && (
            <DataRow label="Decorative Pillows" value={questionnaire.decorative_pillows.join(', ')} />
          )}
          {questionnaire.special_zones && questionnaire.special_zones.length > 0 && (
            <DataRow label="Special Zones" value={questionnaire.special_zones.join(', ')} />
          )}
          {questionnaire.existing_furniture && questionnaire.existing_furniture.length > 0 && (
            <>
              <DataRow label="Existing Furniture" value={questionnaire.existing_furniture.join(', ')} />
              {questionnaire.existing_furniture_details && (
                <DataRow label="Furniture Details" value={questionnaire.existing_furniture_details} />
              )}
            </>
          )}
          {questionnaire.additional_notes && (
            <DataRow label="Additional Notes" value={questionnaire.additional_notes} />
          )}
        </CollapsibleSection>

        {/* Liked Designs - WITH LIGHTBOX MODAL */}
        {questionnaire.likedDesigns && questionnaire.likedDesigns.length > 0 && (
          <CollapsibleSection
            icon="⭐"
            title="Liked Designs"
            isExpanded={expandedSections.likedDesigns}
            onToggle={() => toggleSection('likedDesigns')}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-700 mb-3">
                Client selected <span className="font-bold text-[#005670]">{questionnaire.likedDesigns.length}</span> design image(s)
              </p>
              
              {/* Grid of Design Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {questionnaire.likedDesigns.map((designId, index) => {
                  const imageUrl = DESIGN_IMAGES[designId];
                  const designTitle = DESIGN_TITLES[designId] || `Design ${designId}`;
                  
                  if (!imageUrl) {
                    console.warn(`Design ID ${designId} not found in DESIGN_IMAGES`);
                    return null;
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#005670] transition-all cursor-pointer shadow-sm hover:shadow-lg"
                      onClick={() => {
                        // ✅ OPEN LIGHTBOX MODAL instead of new tab
                        setLightbox({
                          isOpen: true,
                          imageUrl: imageUrl,
                          designId: designId,
                          designTitle: designTitle
                        });
                      }}
                    >
                      {/* Design Image */}
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={designTitle}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Failed to load image for design ${designId}`);
                            e.target.src = '/images/placeholder-design.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Hover Overlay with Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-bold text-sm mb-1">{designTitle}</p>
                              <p className="text-white/80 text-xs">Click to view full size</p>
                            </div>
                            {/* Eye icon */}
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge nomor di corner kanan atas */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="px-2.5 py-1 bg-[#005670] text-white rounded-full text-xs font-bold shadow-lg">
                          #{designId}
                        </span>
                      </div>
                      
                      {/* Star icon di corner kiri atas */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Selection order badge */}
                      <div className="absolute bottom-2 left-2 z-10">
                        <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#005670] shadow-md">
                          {index + 1} of {questionnaire.likedDesigns.length}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary info */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Design Preferences Selected
                    </p>
                    <p className="text-xs text-blue-700">
                      Click on any image to view in modal. Press ESC or click outside to close.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Add-On Services */}
        {(questionnaire.closet_interested || 
          questionnaire.window_interested || 
          questionnaire.av_interested || 
          questionnaire.greenery_interested || 
          questionnaire.kitchen_interested) && (
          <CollapsibleSection
            icon="⚙️"
            title="Add-On Services"
            isExpanded={expandedSections.addons}
            onToggle={() => toggleSection('addons')}
          >
            {/* Closet Solutions */}
            {questionnaire.closet_interested && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="font-bold text-blue-900 mb-2">Closet Solutions</p>
                {questionnaire.closet_use && questionnaire.closet_use.length > 0 && (
                  <p className="text-sm text-gray-700">Use: {questionnaire.closet_use.join(', ')}</p>
                )}
                {questionnaire.organization_style && questionnaire.organization_style.length > 0 && (
                  <p className="text-sm text-gray-700">Style: {questionnaire.organization_style.join(', ')}</p>
                )}
                {questionnaire.closet_finish && questionnaire.closet_finish.length > 0 && (
                  <p className="text-sm text-gray-700">Finish: {questionnaire.closet_finish.join(', ')}</p>
                )}
                {questionnaire.closet_locations && questionnaire.closet_locations.length > 0 && (
                  <p className="text-sm text-gray-700">Locations: {questionnaire.closet_locations.join(', ')}</p>
                )}
              </div>
            )}

            {/* Window Coverings */}
            {questionnaire.window_interested && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="font-bold text-green-900 mb-2">Window Coverings</p>
                {questionnaire.window_treatment && questionnaire.window_treatment.length > 0 && (
                  <p className="text-sm text-gray-700">Treatment: {questionnaire.window_treatment.join(', ')}</p>
                )}
                {questionnaire.window_operation && questionnaire.window_operation.length > 0 && (
                  <p className="text-sm text-gray-700">Operation: {questionnaire.window_operation.join(', ')}</p>
                )}
                {questionnaire.shade_style && questionnaire.shade_style.length > 0 && (
                  <p className="text-sm text-gray-700">Style: {questionnaire.shade_style.join(', ')}</p>
                )}
              </div>
            )}

            {/* Audio/Visual */}
            {questionnaire.av_interested && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="font-bold text-purple-900 mb-2">Audio/Visual</p>
                {questionnaire.av_usage && questionnaire.av_usage.length > 0 && (
                  <p className="text-sm text-gray-700">Usage: {questionnaire.av_usage.join(', ')}</p>
                )}
                {questionnaire.av_areas && questionnaire.av_areas.length > 0 && (
                  <p className="text-sm text-gray-700">Areas: {questionnaire.av_areas.join(', ')}</p>
                )}
              </div>
            )}

            {/* Greenery */}
            {questionnaire.greenery_interested && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                <p className="font-bold text-emerald-900 mb-2">Greenery/Plants</p>
                {questionnaire.plant_type && questionnaire.plant_type.length > 0 && (
                  <p className="text-sm text-gray-700">Type: {questionnaire.plant_type.join(', ')}</p>
                )}
                {questionnaire.plant_areas && questionnaire.plant_areas.length > 0 && (
                  <p className="text-sm text-gray-700">Areas: {questionnaire.plant_areas.join(', ')}</p>
                )}
              </div>
            )}

            {/* Kitchen Essentials */}
            {questionnaire.kitchen_interested && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <p className="font-bold text-orange-900 mb-2">Kitchen Essentials</p>
                {questionnaire.kitchen_essentials && questionnaire.kitchen_essentials.length > 0 && (
                  <p className="text-sm text-gray-700">Items: {questionnaire.kitchen_essentials.join(', ')}</p>
                )}
              </div>
            )}
          </CollapsibleSection>
        )}
      </div>

      {/* ✅ ADD LIGHTBOX MODAL */}
      <ImageLightbox
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
        imageUrl={lightbox.imageUrl}
        designId={lightbox.designId}
        designTitle={lightbox.designTitle}
      />
    </Modal>
  );
});

// Helper Components
const CollapsibleSection = ({ icon, title, isExpanded, onToggle, children }) => (
  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
    </button>
    {isExpanded && (
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        {children}
      </div>
    )}
  </div>
);

const DataRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-2 border-b border-gray-100 last:border-0">
    <span className="font-medium text-gray-600 text-sm sm:w-1/3 flex-shrink-0">{label}:</span>
    <span className="text-gray-900 text-sm sm:w-2/3 break-words">{value}</span>
  </div>
);


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
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`bg-gradient-to-r ${headerClass} text-white p-6 flex justify-between items-center rounded-t-3xl`}>
        <h3 className="text-2xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  </div>
);

const Input = React.memo(
  ({ label, value, onChange, error, type = 'text', required = false, placeholder, ...props }) => {
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
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-all"
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#005670] transition-colors"
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

const ActionButton = React.memo(({ icon: Icon, color, onClick, title, size = 'md', pulse = false, disabled = false }) => {
  const colors = {
    green: 'text-emerald-600 hover:bg-emerald-50',
    red: 'text-red-600 hover:bg-red-50',
    blue: 'text-blue-600 hover:bg-blue-50',
    cyan: 'text-cyan-600 hover:bg-cyan-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    purple: 'text-purple-600 hover:bg-purple-50',
    indigo: 'text-indigo-600 hover:bg-indigo-50', // ✅ ADD THIS
    gray: 'text-gray-400 hover:bg-gray-50 cursor-not-allowed',
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2.5'
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${sizes[size]} ${colors[color]} rounded-lg transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
      } relative ${pulse ? 'animate-pulse' : ''}`}
      title={title}
      type="button"
    >
      <Icon className="w-4 h-4" />
      {pulse && !disabled && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
      )}
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
  </div>
));

export default ClientManagement;