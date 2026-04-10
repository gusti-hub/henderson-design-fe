import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, X, Loader2, Check, XIcon, Eye, FileText,
  Search, Filter, Sparkles, AlertCircle, Mail, Phone,
  User, Building2, CheckCircle, Clock, ClipboardList, MapPin, TrendingUp,
  Calendar, Activity, ChevronLeft, ChevronRight, ClipboardCheck,
  ShoppingBag, Download, Users, Edit3 // Tambahkan ini
} from 'lucide-react';
import { backendServer } from '../utils/info';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import AdminJourneyManager from '../components/AdminJourneyManager';
import QuestionnaireModal from '../components/QuestionnaireModal';


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

const TEAM_OPTIONS = {
  designer: ['Joanna Staniszewski', 'Janelle Balci', 'Ash Agustin'],
  projectManager: ['Madeline Clifford', 'Daiki Matsumaru', 'Savanna Gonzales'],
  projectManagerAssistant: ['Haley Spitz', 'Florence Sosrita'],
  designerAssistant: ['Benny Kristanto']
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

// AFTER
const PRICING_TABLE = {
  'Nalu Foundation Collection': { '1': 2500, '2': 3500, '3': 4500, '1B': 2500, '2B': 3500, '3B': 4500 },
  'Nalu Collection':            { '1': 5000, '2': 7500,  '3': 10000, '1B': 5000, '2B': 7500,  '3B': 10000 },
  'Nalu (Developer)':           { '1': 5000, '2': 7500,  '3': 10000, '1B': 5000, '2B': 7500,  '3B': 10000 },
  'Lani (Developer)':           { '1': 10000, '2': 15000, '3': 20000, '1B': 10000, '2B': 15000, '3B': 20000 },
};

// TAMBAH BARIS INI
const CUSTOM_COLLECTIONS = ['Custom']; // hanya pure Custom yang tidak butuh floor plan
const CLIENT_COLLECTIONS = ['Nalu (Client)', 'Lani (Client)']; // butuh floor plan, tidak butuh bedroom/harga
const DEVELOPER_COLLECTIONS = ['Nalu (Developer)', 'Lani (Developer)'];

const COLLECTIONS = Object.keys(PRICING_TABLE);
const BEDROOM_OPTIONS = [
  { value: '1', label: '1 Bedroom + Den' },
  { value: '2', label: '2 Bedroom + Den' },
  { value: '3', label: '3 Bedroom + Den' },
  { value: '1B', label: '1 Bedroom' },
  { value: '2B', label: '2 Bedroom' },
  { value: '3B', label: '3 Bedroom' },
  { value: 'custom', label: 'Custom (Input Qty)' },
];


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
  // 2️⃣ ADD STATE FOR SHOWING FILL MODAL
  const [showFillQuestionnaireModal, setShowFillQuestionnaireModal] = useState(false);
  const [clientForQuestionnaire, setClientForQuestionnaire] = useState(null);
  const [exporting, setExporting] = useState(false);

  // 3️⃣ ADD HANDLER FUNCTIONS
  const openFillQuestionnaireModal = useCallback((client) => {
    setClientForQuestionnaire(client);
    setShowFillQuestionnaireModal(true);
  }, []);

  const handleQuestionnaireComplete = () => {
    setShowFillQuestionnaireModal(false);
    setClientForQuestionnaire(null);
    fetchClients(); // Refresh data
  };

  const handleCloseQuestionnaire = () => {
    if (window.confirm('Close without saving? All progress will be lost.')) {
      setShowFillQuestionnaireModal(false);
      setClientForQuestionnaire(null);
    }
  };

  
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
    calculatedAmount: 0,
    designer: '',
    projectManager: '',
    projectManagerAssistant: '',
    designerAssistant: '',
    unitNumber2: '', floorPlan2: '',
    unitNumber3: '', floorPlan3: '',
    unitNumber4: '', floorPlan4: '',
    unitNumber5: '', floorPlan5: '',
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [approvalMode, setApprovalMode] = useState('approve');
  const [approvalData, setApprovalData] = useState({ clientCode: '', floorPlan: '', rejectionReason: '' });
  const [bedroomMode, setBedroomMode] = useState(''); // '1' | '2' | '3' | 'custom' | ''

  const handleExportExcel = useCallback(async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${backendServer}/api/clients/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) throw new Error('Export failed');
  
      const blob        = await res.blob();
      const now         = new Date();
      const dateStr     = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
      const url         = window.URL.createObjectURL(blob);
      const a           = document.createElement('a');
      a.href            = url;
      a.download        = `HDG_ClientReport_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  }, []);


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
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeModal]);

  useEffect(() => {
    if (formData.collection) {
      let autoPackageType = 'investor'; // default
      
      if (formData.collection === 'Nalu Foundation Collection') {
        autoPackageType = 'library';
      } else if (CUSTOM_COLLECTIONS.includes(formData.collection) || CLIENT_COLLECTIONS.includes(formData.collection) ||  DEVELOPER_COLLECTIONS.includes(formData.collection)) {
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
    if (formData.email && !formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    // Email wajib hanya untuk create mode
    const emailOptionalTypes = ['Design Hold Fee', 'Developer'];
    if (modalMode === 'create' && !formData.email && !emailOptionalTypes.includes(formData.propertyType)) {
      newErrors.email = 'Required';
    }
    if (!formData.unitNumber) newErrors.unitNumber = 'Required';
    if (!formData.propertyType) newErrors.propertyType = 'Required';
    
    // ✅ Floor plan TIDAK required untuk Custom package
    if (CUSTOM_COLLECTIONS.includes(formData.collection) === false && !formData.floorPlan) {
      newErrors.floorPlan = 'Required';
    }
    
    // ✅ Collection dan bedroom HANYA untuk CREATE mode
    if (modalMode === 'create') {
      // Collection required untuk create dan edit
      if (!formData.collection) newErrors.collection = 'Required';

      // Bedroom count tidak required untuk Custom atau Library
      if (formData.packageType !== 'library' && formData.packageType !== 'custom') {
        if (!formData.bedroomCount) {
          newErrors.bedroomCount = 'Required';
        } else {
          const VALID_BEDROOM_OPTIONS = ['1', '2', '3', '1B', '2B', '3B'];
          const n = Number(formData.bedroomCount);
          if (!VALID_BEDROOM_OPTIONS.includes(formData.bedroomCount) && (!Number.isFinite(n) || n < 1)) {
            newErrors.bedroomCount = 'Must be a positive number';
          }
        }
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
      unitNumber2: '',
      floorPlan2: '',
      unitNumber3: '',
      floorPlan3: '',
      unitNumber4: '',
      floorPlan4: '',
      unitNumber5: '',
      floorPlan5: '',                  
      propertyType: 'Lock 2025 Pricing',
      collection: '',
      bedroomCount: '',
      packageType: 'investor', // ✅ ADD THIS
      calculatedAmount: 0
    });
    setApprovalData({ clientCode: '', floorPlan: '', rejectionReason: '' });
    setErrors({});
    setShowPasswordField(false);
    setBedroomMode('');
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
        unitNumber2: client.unitNumber2 || '',
        floorPlan2: client.floorPlan2 || '',
        unitNumber3: client.unitNumber3 || '',
        floorPlan3: client.floorPlan3 || '',
        unitNumber4: client.unitNumber4 || '',
        floorPlan4: client.floorPlan4 || '',
        unitNumber5: client.unitNumber5 || '',
        floorPlan5: client.floorPlan5 || '',                                
        propertyType: client.propertyType || 'Lock 2025 Pricing',
        password: '',
        collection: client.collection || '',
        bedroomCount: client.bedroomCount ? String(client.bedroomCount) : '',
        packageType: client.packageType || 'investor',
        calculatedAmount: client.paymentInfo?.totalAmount || 0,
        designer: client.teamAssignment?.designer || '',
        projectManager: client.teamAssignment?.projectManager || '',
        projectManagerAssistant: client.teamAssignment?.projectManagerAssistant || '',
        designerAssistant: client.teamAssignment?.designerAssistant || ''
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
        unitNumber2: formData.unitNumber2 || '',
        floorPlan2: formData.floorPlan2 || '',
        unitNumber3: formData.unitNumber3 || '',
        floorPlan3: formData.floorPlan3 || '',
        unitNumber4: formData.unitNumber4 || '',
        floorPlan4: formData.floorPlan4 || '',
        unitNumber5: formData.unitNumber5 || '',
        floorPlan5: formData.floorPlan5 || '',
        propertyType: formData.propertyType,
        packageType: formData.packageType,
        floorPlan: CUSTOM_COLLECTIONS.includes(formData.collection)
        ? 'Custom Project'
        : formData.floorPlan,
        collection: formData.collection,  // ✅ selalu kirim, create & edit
        teamAssignment: {
          designer: formData.designer || '',
          projectManager: formData.projectManager || '',
          projectManagerAssistant: formData.projectManagerAssistant || '',
          designerAssistant: formData.designerAssistant || ''
        }
      };

      const isClientCollection = CLIENT_COLLECTIONS.includes(formData.collection);

      if (formData.packageType !== 'library' && 
          formData.bedroomCount &&
          (!CUSTOM_COLLECTIONS.includes(formData.collection) || isClientCollection)) {
        submitData.bedroomCount = formData.bedroomCount;
      }

      // Custom notes untuk custom package
      if (formData.packageType === 'custom' && formData.customNotes) {
        submitData.customNotes = formData.customNotes;
      }

      // Password handling
      if (modalMode === 'create') {
        submitData.password = formData.password;
      } else if (showPasswordField && formData.password) {
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
      
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* ── Download Report ── */}
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="group flex items-center gap-2 px-5 py-2.5 border-2 border-[#005670] text-[#005670] rounded-xl hover:bg-[#005670] hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              title="Export all clients to Excel"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  <span className="font-semibold">Download Report</span>
                </>
              )}
            </button>
      
            {/* ── Add Client ── */}
            <button
              onClick={() => openFormModal('create')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-semibold">Add Client</span>
            </button>
          </div>
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
          onOpenFillQuestionnaireModal={openFillQuestionnaireModal} 
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
          bedroomMode={bedroomMode}
          setBedroomMode={setBedroomMode}
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
        <QuestionnaireModalCheck selectedClient={selectedClient} onClose={closeModal} />
      )}

      {activeModal === 'orders' && selectedClient && (
        <OrdersModal selectedClient={selectedClient} onClose={closeModal} />
      )}

      {showFillQuestionnaireModal && clientForQuestionnaire && (
        <QuestionnaireModal 
          onComplete={handleQuestionnaireComplete}
          onClose={handleCloseQuestionnaire} // ✅ ADD THIS - admin bisa close
          userData={clientForQuestionnaire}
          isAdminMode={true} // ✅ ADD THIS - flag untuk admin mode
        />
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
    onOpenOrdersModal,
    onOpenFillQuestionnaireModal // ✅ ADD THIS PROP
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
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Team Assignment</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Journey Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Last Modified</th>
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
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate text-left">{client.name}</p>
                          <p className="text-xs text-gray-500 text-left">{client.clientCode || 'No code'}</p>
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
                      {[
                        { un: client.unitNumber, fp: client.floorPlan, primary: true },
                        { un: client.unitNumber2, fp: client.floorPlan2 },
                        { un: client.unitNumber3, fp: client.floorPlan3 },
                        { un: client.unitNumber4, fp: client.floorPlan4 },
                        { un: client.unitNumber5, fp: client.floorPlan5 },
                      ].filter(u => u.un).map((u, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <div>
                            <span className={`text-sm font-medium ${i === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                              Unit {u.un}
                            </span>
                            {u.primary && i === 0 && (
                              <span className="ml-1 text-xs text-[#005670] font-bold">★</span>
                            )}
                            <p className="text-xs text-gray-500">
                              {(CLIENT_COLLECTIONS.includes(client.collection) || DEVELOPER_COLLECTIONS.includes(client.collection))
                                ? `${client.collection} • ${u.fp || '-'}`
                                : u.fp || '-'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                    {/* ✅ NEW: Team Assignment Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {client.teamAssignment?.designer && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{client.teamAssignment.designer}</span>
                          </div>
                        )}
                        {client.teamAssignment?.projectManager && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{client.teamAssignment.projectManager}</span>
                          </div>
                        )}
                        {!client.teamAssignment?.designer && !client.teamAssignment?.projectManager && (
                          <span className="text-xs text-gray-400 italic">No team assigned</span>
                        )}
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

                             {/* ✅ EXISTING BUTTON - VIEW QUESTIONNAIRE */}
                            <ActionButton
                              icon={hasQuest ? ClipboardCheck : ClipboardList}
                              color={hasQuest ? 'green' : 'amber'}
                              onClick={() => onOpenQuestionnaireModal(client)}
                              title={hasQuest ? "View Questionnaire ✓" : "View Questionnaire"}
                              size="sm"
                              pulse={!hasQuest}
                            />

                            {/* ✅ NEW BUTTON - FILL QUESTIONNAIRE */}
                            {!hasQuest && (
                              <ActionButton
                                icon={Edit3}  // ✅ Changed icon
                                color="purple"
                                onClick={() => onOpenFillQuestionnaireModal(client)}
                                title="Fill Questionnaire for Client"
                                size="sm"
                              />
                            )}

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
const FloorPlanAutocomplete = ({ value, onChange, error, opts }) => {
  const [fpQuery, setFpQuery] = React.useState(value || '');
  const [fpOpen, setFpOpen] = React.useState(false);

  React.useEffect(() => { setFpQuery(value || ''); }, [value]);

  const filtered = fpQuery
    ? opts.filter(fp => fp.toLowerCase().includes(fpQuery.toLowerCase()))
    : opts;

  return (
    <div className="relative">
      <input
        type="text"
        value={fpQuery}
        onChange={e => { setFpQuery(e.target.value); setFpOpen(true); }}
        onFocus={() => setFpOpen(true)}
        onBlur={() => setTimeout(() => setFpOpen(false), 150)}
        placeholder="Search floor plan..."
        autoComplete="off"
        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {fpOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filtered.map(fp => (
            <button key={fp} type="button"
              onMouseDown={() => { onChange(fp); setFpQuery(fp); setFpOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#005670]/10 transition-colors ${value === fp ? 'bg-[#005670]/10 text-[#005670] font-semibold' : 'text-gray-700'}`}>
              {fp}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

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
    onSubmit,
    bedroomMode,
    setBedroomMode
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
                label={
                  ['Design Hold Fee', 'Developer'].includes(formData.propertyType)
                    ? 'Email (Optional)'
                    : 'Email'
                }
                type="email"
                value={formData.email}
                onChange={(v) => setFormData((prev) => ({ ...prev, email: v }))}
                error={errors.email}
                required={!['Design Hold Fee', 'Developer'].includes(formData.propertyType)}
                placeholder={
                  ['Design Hold Fee', 'Developer'].includes(formData.propertyType)
                    ? 'Optional'
                    : 'Enter client email'
                }
              />
              {(() => {
                const opts = ['Lock 2025 Pricing', 'Design Hold Fee', 'Developer'];
                const [q, setQ] = React.useState(formData.propertyType || '');
                const [open, setOpen] = React.useState(false);
                React.useEffect(() => { setQ(formData.propertyType || ''); }, [formData.propertyType]);
                const filtered = q ? opts.filter(o => o.toLowerCase().includes(q.toLowerCase())) : opts;
                return (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type <span className="text-red-500">*</span></label>
                    <input type="text" value={q}
                      onChange={e => { setQ(e.target.value); setOpen(true); }}
                      onFocus={() => setOpen(true)}
                      onBlur={() => setTimeout(() => setOpen(false), 150)}
                      placeholder="Select property type..." autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]" />
                    {open && filtered.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filtered.map(o => (
                          <button key={o} type="button"
                            onMouseDown={() => { setFormData(prev => ({ ...prev, propertyType: o })); setQ(o); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#005670]/10 ${formData.propertyType === o ? 'bg-[#005670]/10 text-[#005670] font-semibold' : 'text-gray-700'}`}>
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Units Manager */}
            {(() => {
              const FLOOR_PLAN_OPTS = [
                "Residence 00A", "Residence 00B",
                "Residence 01A", "Residence 01B",
                "Residence 02A", "Residence 02B",
                "Residence 03A", "Residence 03B",
                "Residence 04A", "Residence 04B",
                "Residence 05A", "Residence 05B",
                "Residence 06A", "Residence 06B",
                "Residence 07A", "Residence 07B",
                "Residence 08A", "Residence 08B",
                "Residence 09A", "Residence 09B",
                "Residence 10A", "Residence 10B",
                "Residence 11A", "Residence 11B",
                "Residence 12A", "Residence 12B",
                "Residence 13A", "Residence 13B",
                "Residence 14A", "Residence 14B",
                "Residence 15A", "Residence 15B",
                "Residence 16A", "Residence 16B",
                "Residence 17A", "Residence 17B",
                "Residence 08", "Residence 10A/12A", "Residence 10/12"
              ];

              const unitFields = [
                { un: 'unitNumber', fp: 'floorPlan', label: '★ Primary' },
                { un: 'unitNumber2', fp: 'floorPlan2', label: 'Unit 2' },
                { un: 'unitNumber3', fp: 'floorPlan3', label: 'Unit 3' },
                { un: 'unitNumber4', fp: 'floorPlan4', label: 'Unit 4' },
                { un: 'unitNumber5', fp: 'floorPlan5', label: 'Unit 5' },
              ];

              const [visibleCount, setVisibleCount] = React.useState(() => {
                let count = 1;
                for (let i = 1; i < 5; i++) {
                  if (formData[unitFields[i].un]) count = i + 1;
                }
                return count;
              });

              const isCustom = CUSTOM_COLLECTIONS.includes(formData.collection);

              return (
                <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#005670]" />
                      <span className="text-sm font-semibold text-gray-700">Unit Details</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{visibleCount}/5</span>
                    </div>
                    {visibleCount < 5 && (
                      <button type="button" onClick={() => setVisibleCount(v => v + 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005670] bg-[#005670]/10 hover:bg-[#005670]/20 rounded-lg transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add Unit
                      </button>
                    )}
                  </div>

                  {unitFields.slice(0, visibleCount).map((f, idx) => (
                    <div key={idx} className={`relative p-4 rounded-xl border-2 ${idx === 0 ? 'border-[#005670]/40 bg-[#005670]/5' : 'border-dashed border-gray-300 bg-white'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-600'}`}>{f.label}</span>
                        {idx > 0 && (
                          <button type="button" onClick={() => {
                          // Shift semua unit di atas idx ke bawah, clear yang terakhir
                          setFormData(prev => {
                            const next = { ...prev };
                            const fields = [
                              { un: 'unitNumber', fp: 'floorPlan' },
                              { un: 'unitNumber2', fp: 'floorPlan2' },
                              { un: 'unitNumber3', fp: 'floorPlan3' },
                              { un: 'unitNumber4', fp: 'floorPlan4' },
                              { un: 'unitNumber5', fp: 'floorPlan5' },
                            ];
                            // Geser ke atas mulai dari posisi idx
                            for (let i = idx; i < visibleCount - 1; i++) {
                              next[fields[i].un] = prev[fields[i + 1].un];
                              next[fields[i].fp] = prev[fields[i + 1].fp];
                            }
                            // Clear yang terakhir
                            next[fields[visibleCount - 1].un] = '';
                            next[fields[visibleCount - 1].fp] = '';
                            return next;
                          });
                          setVisibleCount(v => v - 1);
                        }} className="p-1 text-red-400 hover:text-red-600 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className={`grid gap-3 ${isCustom ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Unit Number{idx === 0 ? ' *' : ''}</label>
                          <input type="text" value={formData[f.un]} onChange={e => setFormData(prev => ({ ...prev, [f.un]: e.target.value }))}
                            placeholder="e.g. 1201"
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] ${errors[f.un] ? 'border-red-400' : 'border-gray-300'}`} />
                          {errors[f.un] && <p className="text-red-500 text-xs mt-1">{errors[f.un]}</p>}
                        </div>
                        {!isCustom && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Floor Plan{idx === 0 ? ' *' : ''}</label>
                            <FloorPlanAutocomplete
                              value={formData[f.fp]}
                              onChange={(v) => setFormData(prev => ({ ...prev, [f.fp]: v }))}
                              error={errors[f.fp]}
                              opts={FLOOR_PLAN_OPTS}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ✅ NEW: Team Assignment Section */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Team Assignment (Optional)
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Designer"
                  value={formData.designer}
                  onChange={(v) => setFormData(prev => ({ ...prev, designer: v }))}
                  options={[
                    { value: '', label: '-- Select Designer --' },
                    ...TEAM_OPTIONS.designer.map(name => ({ value: name, label: name }))
                  ]}
                />
                
                <Select
                  label="Project Manager"
                  value={formData.projectManager}
                  onChange={(v) => setFormData(prev => ({ ...prev, projectManager: v }))}
                  options={[
                    { value: '', label: '-- Select PM --' },
                    ...TEAM_OPTIONS.projectManager.map(name => ({ value: name, label: name }))
                  ]}
                />

                <Select
                  label="Designer Assistant"
                  value={formData.designerAssistant}
                  onChange={(v) => setFormData(prev => ({ ...prev, designerAssistant: v }))}
                  options={[
                    { value: '', label: '-- Select Designer Assistant --' },
                    ...TEAM_OPTIONS.designerAssistant.map(name => ({ value: name, label: name }))
                  ]}
                />
                
                <Select
                  label="PM Assistant"
                  value={formData.projectManagerAssistant}
                  onChange={(v) => setFormData(prev => ({ ...prev, projectManagerAssistant: v }))}
                  options={[
                    { value: '', label: '-- Select PM Assistant --' },
                    ...TEAM_OPTIONS.projectManagerAssistant.map(name => ({ value: name, label: name }))
                  ]}
                />
                
              </div>
            </div>

            {modalMode !== 'view' && (
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
                      bedroomCount: (CUSTOM_COLLECTIONS.includes(v) || CLIENT_COLLECTIONS.includes(v)) ? '' : prev.bedroomCount,
                      floorPlan: CUSTOM_COLLECTIONS.includes(v) ? '' : prev.floorPlan  // Client collections tetap simpan floor plan
                    }))}
                    options={[
                      // { value: 'Nalu Foundation Collection', label: 'Nalu Foundation Collection' },
                      { value: 'Nalu (Client)', label: 'Nalu (Client)' },
                      { value: 'Lani (Client)', label: 'Lani (Client)' },
                      { value: 'Nalu (Developer)', label: 'Nalu (Developer)' },
                      { value: 'Lani (Developer)', label: 'Lani (Developer)' },
                      { value: 'Custom', label: '✨ Custom (Manual Input)' }
                    ]}
                    error={errors.collection}
                    required
                  />
                </div>

                {/* ✅ CONDITIONAL RENDERING */}
                {(CUSTOM_COLLECTIONS.includes(formData.collection) || CLIENT_COLLECTIONS.includes(formData.collection)) ? (
                  // ========================================
                  // TAMPILAN UNTUK CUSTOM PACKAGE
                  // ========================================
                  <div className="space-y-4">
                  {CUSTOM_COLLECTIONS.includes(formData.collection) && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900 mb-1">
                            🎨 Custom Package Selected
                          </p>
                          <p className="text-xs text-purple-700 leading-relaxed">
                            • The designer will manually input the items<br/>
                            • No floor plan selection is required<br/>
                            • Images, links, and detailed specifications can be added
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                    {/* Bedroom Count (1/2/3/custom) */}
                    <Select
                      label="Bedroom Count"
                      value={
                        bedroomMode
                          ? bedroomMode
                          : (['1', '2', '3', '1B', '2B', '3B'].includes(String(formData.bedroomCount))
                              ? String(formData.bedroomCount)
                              : '')
                      }
                      onChange={(v) => {
                        setBedroomMode(v);
                        if (v === 'custom') {
                          setFormData(prev => ({ ...prev, bedroomCount: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, bedroomCount: v }));
                        }
                      }}
                      options={BEDROOM_OPTIONS}
                      error={errors.bedroomCount}
                      required
                    />

                    {/* Custom bedroom input */}
                    {bedroomMode === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bedroom Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.bedroomCount || ''}
                          onChange={(e) => {
                            const val = e.target.value; // string
                            // ✅ tetap pakai existing field bedroomCount
                            setFormData(prev => ({ ...prev, bedroomCount: val }));
                          }}
                          placeholder="e.g. 4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Bedroom + Den
                        </p>
                      </div>
                    )}

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

const QuestionnaireModalCheck = React.memo(({ selectedClient, onClose }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    homeUse: true,
    entertaining: false,
    design: false,
    bedrooms: false,
    art: false,
    misc: false,
    closet: false,
    window: false,
    av: false,
    greenery: false,
    kitchen: false,
    likedDesigns: false,
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
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Format any value: array → joined string, boolean → Yes/No, blank → "—"
  const fmt = (v) => {
    if (v === null || v === undefined) return '—';
    if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    const s = String(v).trim();
    return s !== '' ? s : '—';
  };

  const imageToBase64 = async (src) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = img.naturalWidth > MAX_WIDTH ? MAX_WIDTH / img.naturalWidth : 1;
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const pdfStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
    header: { backgroundColor: '#005670', padding: 15, marginBottom: 20, borderRadius: 5 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
    headerSubtitle: { fontSize: 10, color: '#ffffff' },
    infoBox: { backgroundColor: '#f0f8ff', padding: 12, marginBottom: 15, borderRadius: 5, borderLeft: '4px solid #005670' },
    infoTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    infoRow: { fontSize: 9, marginBottom: 3 },
    section: { marginBottom: 15 },
    sectionHeader: { backgroundColor: '#005670', color: '#ffffff', padding: 8, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    addonSectionHeader: { backgroundColor: '#005670', color: '#ffffff', padding: 8, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    fieldRow: { flexDirection: 'row', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' },
    fieldLabel: { width: '40%', fontWeight: 'bold', fontSize: 9, color: '#4b5563' },
    fieldValue: { width: '60%', fontSize: 9, color: '#1f2937' },
    fieldValueBlank: { width: '60%', fontSize: 9, color: '#9ca3af', fontStyle: 'italic' },
    footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af' },
  });

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { Document, Page, Text, View, Image } = await import('@react-pdf/renderer');

      const likedDesignBase64Map = {};
      if (questionnaire.likedDesigns && questionnaire.likedDesigns.length > 0) {
        await Promise.all(
          questionnaire.likedDesigns.map(async (designId) => {
            const imgPath = DESIGN_IMAGES[designId];
            if (imgPath) {
              const base64 = await imageToBase64(imgPath);
              if (base64) likedDesignBase64Map[designId] = base64;
            }
          })
        );
      }

      // PDF row — always renders, shows "Not answered" in gray if blank
      const PdfRow = ({ label, value }) => {
        const display = fmt(value);
        const isBlank = display === '—';
        return (
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>{label}:</Text>
            <Text style={isBlank ? pdfStyles.fieldValueBlank : pdfStyles.fieldValue}>
              {isBlank ? 'Not answered' : display}
            </Text>
          </View>
        );
      };

      const MyDocument = (
        <Document>
          <Page size="A4" style={pdfStyles.page}>

            {/* HEADER */}
            <View style={pdfStyles.header}>
              <Text style={pdfStyles.headerTitle}>Design Questionnaire</Text>
              <Text style={pdfStyles.headerSubtitle}>Client: {selectedClient.name}</Text>
            </View>

            {/* CLIENT INFO */}
            <View style={pdfStyles.infoBox}>
              <Text style={pdfStyles.infoTitle}>Client Information</Text>
              <Text style={pdfStyles.infoRow}>Name: {selectedClient.name}</Text>
              <Text style={pdfStyles.infoRow}>Email: {selectedClient.email}</Text>
              <Text style={pdfStyles.infoRow}>Unit: {selectedClient.unitNumber}</Text>
              <Text style={pdfStyles.infoRow}>
                Submitted: {questionnaire.submittedAt
                  ? new Date(questionnaire.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A'}
              </Text>
            </View>

            {/* 1. HOME USE & LIFESTYLE */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>1. HOME USE &amp; LIFESTYLE</Text>
              <PdfRow label="Purpose of Residence" value={questionnaire.purpose_of_residence} />
              <PdfRow label="Who Will Use"          value={questionnaire.who_will_use} />
              <PdfRow label="Family Members"        value={questionnaire.family_members} />
              <PdfRow label="Children Ages"         value={questionnaire.children_ages} />
              <PdfRow label="Living Envision"       value={questionnaire.living_envision} />
              <PdfRow label="Home Feeling"          value={questionnaire.home_feeling} />
            </View>

            {/* 2. ENTERTAINING & DAILY USE */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>2. ENTERTAINING &amp; DAILY USE</Text>
              <PdfRow label="Work From Home"      value={questionnaire.work_from_home} />
              <PdfRow label="Entertain Frequency" value={questionnaire.entertain_frequency} />
              <PdfRow label="Gathering Types"     value={questionnaire.gathering_types} />
              <PdfRow label="Outdoor/Lanai Use"   value={questionnaire.outdoor_lanai_use} />
            </View>

            {/* 3. DESIGN AESTHETIC */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>3. DESIGN AESTHETIC &amp; COLOR PREFERENCES</Text>
              <PdfRow label="Unit Options"          value={questionnaire.unit_options} />
              <PdfRow label="Preferred Collection"  value={questionnaire.preferred_collection} />
              <PdfRow label="Style Direction"       value={questionnaire.style_direction} />
              <PdfRow label="Main Upholstery Color" value={questionnaire.main_upholstery_color} />
              <PdfRow label="Accent Fabric Color"   value={questionnaire.accent_fabric_color} />
              <PdfRow label="Metal Tone"            value={questionnaire.metal_tone} />
              <PdfRow label="Tone Preference"       value={questionnaire.tone_preference} />
              <PdfRow label="Colors to Avoid"       value={questionnaire.colors_to_avoid} />
            </View>

            {/* 4. BEDROOMS & COMFORT */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>4. BEDROOMS &amp; COMFORT</Text>
              <PdfRow label="Bed Sizes"               value={questionnaire.bed_sizes} />
              <PdfRow label="Mattress Firmness"       value={questionnaire.mattress_firmness} />
              <PdfRow label="Bedding Type"            value={questionnaire.bedding_type} />
              <PdfRow label="Bedding Material/Color"  value={questionnaire.bedding_material_color} />
              <PdfRow label="Lighting Mood"           value={questionnaire.lighting_mood} />
            </View>

            {/* 5. ART & ACCESSORIES */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>5. ART, ACCESSORIES &amp; FINISHING TOUCHES</Text>
              <PdfRow label="Art Style"           value={questionnaire.art_style} />
              <PdfRow label="Art Coverage"        value={questionnaire.art_coverage} />
              <PdfRow label="Accessories Styling" value={questionnaire.accessories_styling} />
              <PdfRow label="Decorative Pillows"  value={questionnaire.decorative_pillows} />
            </View>

            {/* 6. ADDITIONAL NOTES */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>6. ADDITIONAL DESIGN NOTES</Text>
              <PdfRow label="Special Zones"       value={questionnaire.special_zones} />
              <PdfRow label="Existing Furniture"  value={questionnaire.existing_furniture} />
              <PdfRow label="Furniture Details"   value={questionnaire.existing_furniture_details} />
              <PdfRow label="Additional Notes"    value={questionnaire.additional_notes} />
            </View>

            {/* 7. ADD-ON: CLOSET */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.addonSectionHeader}>7. ADD-ON: CUSTOMIZED CLOSET SOLUTIONS</Text>
              <PdfRow label="Closet Use"        value={questionnaire.closet_use} />
              <PdfRow label="Organization Style" value={questionnaire.organization_style} />
              <PdfRow label="Additional Needs"  value={questionnaire.closet_additional_needs} />
              <PdfRow label="Finish"            value={questionnaire.closet_finish} />
              <PdfRow label="Locations"         value={questionnaire.closet_locations} />
            </View>

            {/* 8. ADD-ON: WINDOW */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.addonSectionHeader}>8. ADD-ON: WINDOW COVERINGS</Text>
              <PdfRow label="Treatment Preference" value={questionnaire.window_treatment} />
              <PdfRow label="Operation"            value={questionnaire.window_operation} />
              <PdfRow label="Light Quality"        value={questionnaire.light_quality} />
              <PdfRow label="Shade Material"       value={questionnaire.shade_material} />
              <PdfRow label="Shade Style"          value={questionnaire.shade_style} />
              <PdfRow label="Locations"            value={questionnaire.window_locations} />
              <PdfRow label="Other Area"           value={questionnaire.window_other_area} />
            </View>

            {/* 9. ADD-ON: AV */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.addonSectionHeader}>9. ADD-ON: AUDIO/VISUAL</Text>
              <PdfRow label="AV Usage Level" value={questionnaire.av_usage} />
              <PdfRow label="Areas to Equip" value={questionnaire.av_areas} />
            </View>

            {/* 10. ADD-ON: GREENERY */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.addonSectionHeader}>10. ADD-ON: GREENERY / PLANTS</Text>
              <PdfRow label="Plant Type" value={questionnaire.plant_type} />
              <PdfRow label="Areas"      value={questionnaire.plant_areas} />
            </View>

            {/* 11. ADD-ON: KITCHEN */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.addonSectionHeader}>11. ADD-ON: KITCHEN &amp; HOUSEHOLD ESSENTIALS</Text>
              <PdfRow label="Selected Items" value={questionnaire.kitchen_essentials} />
            </View>

            {/* 12. LIKED DESIGNS */}
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeader}>12. VISUAL INSPIRATION (LIKED DESIGNS)</Text>
              {questionnaire.likedDesigns && questionnaire.likedDesigns.length > 0 ? (
                <>
                  <View style={pdfStyles.fieldRow}>
                    <Text style={pdfStyles.fieldLabel}>Total Selected:</Text>
                    <Text style={pdfStyles.fieldValue}>{questionnaire.likedDesigns.length} design(s)</Text>
                  </View>
                  {Array.from(
                    { length: Math.ceil(questionnaire.likedDesigns.length / 2) },
                    (_, rowIdx) => {
                      const pair = questionnaire.likedDesigns.slice(rowIdx * 2, rowIdx * 2 + 2);
                      return (
                        <View key={rowIdx} style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                          {pair.map((designId) => {
                            const base64 = likedDesignBase64Map[designId];
                            const title = DESIGN_TITLES[designId] || `Design ${designId}`;
                            return (
                              <View key={designId} style={{ width: '48%' }}>
                                {base64 ? (
                                  <Image src={base64} style={{ width: '100%', height: 130 }} />
                                ) : (
                                  <View style={{ width: '100%', height: 130, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 8, color: '#9ca3af' }}>Image not available</Text>
                                  </View>
                                )}
                                <View style={{ marginTop: 4, paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#005670' }}>
                                  <Text style={{ fontSize: 8, color: '#ffffff', fontWeight: 'bold' }}>
                                    {title} (#{designId})
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                          {pair.length === 1 && <View style={{ width: '48%' }} />}
                        </View>
                      );
                    }
                  )}
                </>
              ) : (
                <View style={pdfStyles.fieldRow}>
                  <Text style={pdfStyles.fieldLabel}>Liked Designs:</Text>
                  <Text style={pdfStyles.fieldValueBlank}>Not answered</Text>
                </View>
              )}
            </View>

            {/* FOOTER */}
            <View style={pdfStyles.footer} fixed>
              <Text>Generated on {new Date().toLocaleDateString('en-US')}</Text>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>

          </Page>
        </Document>
      );

      const blob = await pdf(MyDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Questionnaire_${selectedClient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
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
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 mb-2">Next Steps</p>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex items-start gap-2"><span className="text-amber-600">•</span><span>Send a reminder email to the client</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-600">•</span><span>Follow up via phone to discuss their preferences</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-600">•</span><span>Questionnaire must be completed before proceeding with design</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // UI Row — always renders, gray italic if blank
  const Row = ({ label, value }) => {
    const display = fmt(value);
    const isBlank = display === '—';
    return (
      <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
        <span className="w-2/5 text-sm font-semibold text-gray-500 flex-shrink-0">{label}</span>
        <span className={`w-3/5 text-sm break-words ${isBlank ? 'text-gray-300 italic' : 'text-gray-800'}`}>
          {isBlank ? '—' : display}
        </span>
      </div>
    );
  };

  return (
    <Modal title="📋 Client Questionnaire" onClose={onClose} size="large">
      {downloadingPDF && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#005670]" />
            <span className="text-sm font-medium text-gray-700">Generating PDF...</span>
          </div>
        </div>
      )}

      <div className="space-y-4">

        {/* Status Badge + Download */}
        <div className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Status: <span className="text-blue-600">Submitted</span></p>
              <p className="text-sm text-gray-600">
                Submitted: {questionnaire.submittedAt ? new Date(questionnaire.submittedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>

        {/* ─── 1. HOME USE & LIFESTYLE ─── */}
        <CollapsibleSection icon="🏠" title="Home Use & Lifestyle"
          isExpanded={expandedSections.homeUse} onToggle={() => toggleSection('homeUse')}>
          <Row label="Purpose of Residence" value={questionnaire.purpose_of_residence} />
          <Row label="Who Will Use"          value={questionnaire.who_will_use} />
          <Row label="Family Members"        value={questionnaire.family_members} />
          <Row label="Children Ages"         value={questionnaire.children_ages} />
          <Row label="Living Envision"       value={questionnaire.living_envision} />
          <Row label="Home Feeling"          value={questionnaire.home_feeling} />
        </CollapsibleSection>

        {/* ─── 2. ENTERTAINING & DAILY USE ─── */}
        <CollapsibleSection icon="🥂" title="Entertaining & Daily Use"
          isExpanded={expandedSections.entertaining} onToggle={() => toggleSection('entertaining')}>
          <Row label="Work From Home"      value={questionnaire.work_from_home} />
          <Row label="Entertain Frequency" value={questionnaire.entertain_frequency} />
          <Row label="Gathering Types"     value={questionnaire.gathering_types} />
          <Row label="Outdoor/Lanai Use"   value={questionnaire.outdoor_lanai_use} />
        </CollapsibleSection>

        {/* ─── 3. DESIGN AESTHETIC ─── */}
        <CollapsibleSection icon="🎨" title="Design Aesthetic & Color Preferences"
          isExpanded={expandedSections.design} onToggle={() => toggleSection('design')}>
          <Row label="Unit Options"           value={questionnaire.unit_options} />
          <Row label="Preferred Collection"   value={questionnaire.preferred_collection} />
          <Row label="Style Direction"        value={questionnaire.style_direction} />
          <Row label="Main Upholstery Color"  value={questionnaire.main_upholstery_color} />
          <Row label="Accent Fabric Color"    value={questionnaire.accent_fabric_color} />
          <Row label="Metal Tone"             value={questionnaire.metal_tone} />
          <Row label="Tone Preference"        value={questionnaire.tone_preference} />
          <Row label="Colors to Avoid"        value={questionnaire.colors_to_avoid} />
        </CollapsibleSection>

        {/* ─── 4. BEDROOMS & COMFORT ─── */}
        <CollapsibleSection icon="🛏️" title="Bedrooms & Comfort"
          isExpanded={expandedSections.bedrooms} onToggle={() => toggleSection('bedrooms')}>
          <Row label="Bed Sizes"               value={questionnaire.bed_sizes} />
          <Row label="Mattress Firmness"       value={questionnaire.mattress_firmness} />
          <Row label="Bedding Type"            value={questionnaire.bedding_type} />
          <Row label="Bedding Material/Color"  value={questionnaire.bedding_material_color} />
          <Row label="Lighting Mood"           value={questionnaire.lighting_mood} />
        </CollapsibleSection>

        {/* ─── 5. ART & ACCESSORIES ─── */}
        <CollapsibleSection icon="🖼️" title="Art, Accessories & Finishing Touches"
          isExpanded={expandedSections.art} onToggle={() => toggleSection('art')}>
          <Row label="Art Style"           value={questionnaire.art_style} />
          <Row label="Art Coverage"        value={questionnaire.art_coverage} />
          <Row label="Accessories Styling" value={questionnaire.accessories_styling} />
          <Row label="Decorative Pillows"  value={questionnaire.decorative_pillows} />
        </CollapsibleSection>

        {/* ─── 6. ADDITIONAL NOTES ─── */}
        <CollapsibleSection icon="📝" title="Additional Design Notes"
          isExpanded={expandedSections.misc} onToggle={() => toggleSection('misc')}>
          <Row label="Special Zones"       value={questionnaire.special_zones} />
          <Row label="Existing Furniture"  value={questionnaire.existing_furniture} />
          <Row label="Furniture Details"   value={questionnaire.existing_furniture_details} />
          <Row label="Additional Notes"    value={questionnaire.additional_notes} />
        </CollapsibleSection>

        {/* ─── 7. ADD-ON: CLOSET ─── */}
        <CollapsibleSection icon="🚪" title="Add-On: Customized Closet Solutions"
          isExpanded={expandedSections.closet} onToggle={() => toggleSection('closet')}>
          <Row label="Closet Use"          value={questionnaire.closet_use} />
          <Row label="Organization Style"  value={questionnaire.organization_style} />
          <Row label="Additional Needs"    value={questionnaire.closet_additional_needs} />
          <Row label="Finish"              value={questionnaire.closet_finish} />
          <Row label="Locations"           value={questionnaire.closet_locations} />
        </CollapsibleSection>

        {/* ─── 8. ADD-ON: WINDOW ─── */}
        <CollapsibleSection icon="🪟" title="Add-On: Window Coverings"
          isExpanded={expandedSections.window} onToggle={() => toggleSection('window')}>
          <Row label="Treatment Preference" value={questionnaire.window_treatment} />
          <Row label="Operation"            value={questionnaire.window_operation} />
          <Row label="Light Quality"        value={questionnaire.light_quality} />
          <Row label="Shade Material"       value={questionnaire.shade_material} />
          <Row label="Shade Style"          value={questionnaire.shade_style} />
          <Row label="Locations"            value={questionnaire.window_locations} />
          <Row label="Other Area"           value={questionnaire.window_other_area} />
        </CollapsibleSection>

        {/* ─── 9. ADD-ON: AV ─── */}
        <CollapsibleSection icon="📺" title="Add-On: Audio/Visual"
          isExpanded={expandedSections.av} onToggle={() => toggleSection('av')}>
          <Row label="AV Usage Level" value={questionnaire.av_usage} />
          <Row label="Areas to Equip" value={questionnaire.av_areas} />
        </CollapsibleSection>

        {/* ─── 10. ADD-ON: GREENERY ─── */}
        <CollapsibleSection icon="🌿" title="Add-On: Greenery / Plants"
          isExpanded={expandedSections.greenery} onToggle={() => toggleSection('greenery')}>
          <Row label="Plant Type" value={questionnaire.plant_type} />
          <Row label="Areas"      value={questionnaire.plant_areas} />
        </CollapsibleSection>

        {/* ─── 11. ADD-ON: KITCHEN ─── */}
        <CollapsibleSection icon="🍳" title="Add-On: Kitchen & Household Essentials"
          isExpanded={expandedSections.kitchen} onToggle={() => toggleSection('kitchen')}>
          <Row label="Selected Items" value={questionnaire.kitchen_essentials} />
        </CollapsibleSection>

        {/* ─── 12. LIKED DESIGNS ─── */}
        <CollapsibleSection icon="⭐" title="Visual Inspiration (Liked Designs)"
          isExpanded={expandedSections.likedDesigns} onToggle={() => toggleSection('likedDesigns')}>
          {questionnaire.likedDesigns && questionnaire.likedDesigns.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-3">
                Client selected <span className="font-bold text-[#005670]">{questionnaire.likedDesigns.length}</span> design image(s)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {questionnaire.likedDesigns.map((designId, index) => {
                  const imageUrl = DESIGN_IMAGES[designId];
                  const designTitle = DESIGN_TITLES[designId] || `Design ${designId}`;
                  if (!imageUrl) return null;
                  return (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#005670] transition-all cursor-pointer shadow-sm hover:shadow-lg"
                      onClick={() => setLightbox({ isOpen: true, imageUrl, designId, designTitle })}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={designTitle}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white font-bold text-xs">{designTitle}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-[#005670] text-white rounded-full text-xs font-bold shadow">
                          #{designId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-300 italic py-2">—</p>
          )}
        </CollapsibleSection>

      </div>

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
        {/* ✅ NEW: Team Assignment Display */}
    {(client?.teamAssignment?.designer || client?.teamAssignment?.projectManager) && (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> Team Assignment
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {client.teamAssignment.designer && (
            <div>
              <span className="font-medium text-gray-700">Designer:</span>
              <span className="ml-2 text-gray-900">{client.teamAssignment.designer}</span>
            </div>
          )}
          {client.teamAssignment.projectManager && (
            <div>
              <span className="font-medium text-gray-700">Project Manager:</span>
              <span className="ml-2 text-gray-900">{client.teamAssignment.projectManager}</span>
            </div>
          )}
          {client.teamAssignment.projectManagerAssistant && (
            <div>
              <span className="font-medium text-gray-700">PM Assistant:</span>
              <span className="ml-2 text-gray-900">{client.teamAssignment.projectManagerAssistant}</span>
            </div>
          )}
          {client.teamAssignment.designerAssistant && (
            <div>
              <span className="font-medium text-gray-700">Designer Assistant:</span>
              <span className="ml-2 text-gray-900">{client.teamAssignment.designerAssistant}</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
));

export default ClientManagement;