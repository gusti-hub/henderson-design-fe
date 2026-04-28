// AdminOrderList.jsx — ✅ REDESIGNED v3
//   - Action buttons: icon-only dengan tooltip, lebih clean
//   - Client name: lighter (font-medium)
//   - Hapus "Order Details" 
//   - Status pill di-klik → inline dropdown untuk ganti status
//   - ActionMenu: portal dropdown dengan auto-flip (atas/bawah)

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Loader2, Download, FileText, Edit2, ArrowLeft, X, Check,
  Search, ChevronDown, BarChart2, BookOpen,
  ShoppingCart, TrendingUp, Eye,
} from 'lucide-react';
import { backendServer } from '../utils/info';
import AreaCustomization from '../components/design-flow/AreaCustomization';
import LibraryFloorPlanEditor from '../components/LibraryFloorPlanEditor';
import CustomProductManager from '../components/CustomProductManager';
import POVendorSelector from '../components/POVendorSelector';
import COGReportViewer from '../components/COGReportViewer';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
    <div className="bg-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
      <Loader2 className="w-6 h-6 animate-spin text-[#005670]" />
      <span className="text-sm font-medium text-gray-700">Processing...</span>
    </div>
  </div>
);

const SuccessToast = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-xl shadow-xl">
    <Check className="w-4 h-4" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-1 hover:opacity-70"><X className="w-4 h-4" /></button>
  </div>
);

const STATUS_OPTIONS = ['ongoing', 'review', 'confirmed', 'completed', 'cancelled'];
const STATUS_CONFIG = {
  completed: { label: 'Completed', dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ongoing:   { label: 'Ongoing',   dot: 'bg-blue-500',    cls: 'bg-blue-50 text-blue-700 border-blue-200'         },
  confirmed: { label: 'Confirmed', dot: 'bg-indigo-500',  cls: 'bg-indigo-50 text-indigo-700 border-indigo-200'   },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',     cls: 'bg-red-50 text-red-600 border-red-200'            },
  review:    { label: 'Review',    dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-700 border-amber-200'      },
};

// ─── Inline status changer ────────────────────────────────────────────────────
const StatusChanger = ({ order, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const cfg = STATUS_CONFIG[order?.status] || { label: order?.status || 'Unknown', dot: 'bg-gray-400', cls: 'bg-gray-50 text-gray-600 border-gray-200' };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (newStatus) => {
    if (newStatus === order.status) { setOpen(false); return; }
    setSaving(true); setOpen(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onStatusChange(order._id, newStatus);
    } catch (_) {}
    setSaving(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${cfg.cls} hover:shadow-sm`}
      >
        {saving
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />}
        {cfg.label}
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-xl z-50 py-1 overflow-hidden">
          {STATUS_OPTIONS.map(s => {
            const c = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors
                  ${s === order.status ? 'bg-gray-50 font-semibold text-gray-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                {c.label}
                {s === order.status && <Check className="w-3 h-3 ml-auto text-gray-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Icon button with tooltip ─────────────────────────────────────────────────
const IconBtn = ({ icon: Icon, label, onClick, color = 'text-gray-500', hoverBg = 'hover:bg-gray-100', disabled = false }) => (
  <div className="relative group">
    <button onClick={onClick} disabled={disabled} aria-label={label}
      className={`p-2 rounded-lg transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : `${color} ${hoverBg}`}`}>
      <Icon className="w-4 h-4" />
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md
      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  </div>
);

const PackageBadge = ({ packageType, floorPlan }) => {
  if (packageType === 'custom' && floorPlan === 'Custom Project')
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Custom</span>;
  const cfg = { investor:{label:'Nalu',cls:'bg-blue-100 text-blue-700'}, custom:{label:'Lani',cls:'bg-purple-100 text-purple-700'}, library:{label:'Library',cls:'bg-teal-100 text-teal-700'} }[packageType] || {label:'Nalu',cls:'bg-blue-100 text-blue-700'};
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Portal dropdown hook ─────────────────────────────────────────────────────
const usePortalDropdown = (triggerRef, open) => {
  const [pos, setPos] = useState({ top: 0, right: 0, openUpward: false });
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const calculate = () => {
      const r = triggerRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || 320;
      const spaceBelow = window.innerHeight - r.bottom;
      const openUpward = spaceBelow < menuHeight + 10;

      setPos({
        top: openUpward
          ? r.top + window.scrollY - menuHeight - 6
          : r.bottom + window.scrollY + 6,
        right: window.innerWidth - r.right,
        openUpward,
      });
    };

    const raf = requestAnimationFrame(calculate);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return { pos, menuRef };
};

// ─── Action dropdown menu ─────────────────────────────────────────────────────
const ActionMenu = ({ order, onEdit, onView, onProposal, onInstallBinder, onDownload, onCOGExcel, onCOGPdf, onPO }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { pos, menuRef } = usePortalDropdown(triggerRef, open);
  const canEdit = order.status === 'ongoing';

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const Item = ({ icon: Icon, label, onClick, color = 'text-gray-700' }) => (
    <button
      onClick={() => { onClick(); setOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${color} hover:bg-gray-50 transition-colors text-left`}
    >
      <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
      <span>{label}</span>
    </button>
  );

  const Sep = () => <div className="my-1 border-t border-gray-100" />;
  const Group = ({ label }) => (
    <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
  );

  return (
    <div ref={triggerRef} className="relative flex items-center gap-1.5 justify-end">
      {/* Primary: Edit */}
      <button
        onClick={onEdit}
        disabled={!canEdit}
        title={canEdit ? 'Edit order' : 'Only ongoing orders can be edited'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${canEdit ? 'bg-[#005670] text-white hover:bg-[#004558] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>

      {/* More actions trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`p-1.5 rounded-lg border transition-all
          ${open ? 'bg-gray-100 border-gray-300 text-gray-900' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300'}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" />
        </svg>
      </button>

      {/* Portal dropdown — keluar dari overflow:hidden tabel, auto-flip atas/bawah */}
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
            transition: 'opacity 0.08s ease',
          }}
          className="w-52 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden py-1"
        >
          <Group label="View" />
          <Item icon={Eye}          label="View Client Summary Order"         onClick={onView}                              color="text-gray-700" />
          <Sep />
          <Group label="Documents" />
          <Item icon={FileText}     label="Proposal Editor"    onClick={onProposal}                          color="text-blue-600" />
          <Item icon={BookOpen}     label="Install Binder"     onClick={onInstallBinder}                     color="text-green-600" />
          <Sep />
          <Item icon={Download}     label="View Client Summary Order (Excel)"    onClick={() => onDownload('summary')}         color="text-gray-700" />
          <Item icon={TrendingUp}   label="Status Report"      onClick={() => onDownload('status-report')}   color="text-teal-600" />
          <Item icon={BarChart2}    label="COG Report (Excel)" onClick={onCOGExcel}                          color="text-purple-600" />
          {/* <Item icon={Eye}          label="COG Report (PDF)"   onClick={onCOGPdf}                            color="text-violet-600" /> */}
          <Sep />
          <Item icon={ShoppingCart} label="Purchase Orders"    onClick={onPO}                                color="text-amber-600" />
        </div>,
        document.body
      )}
    </div>
  );
};


const ProposalModal = ({ isOpen, onClose, onConfirm, isLoading, notes, setNotes }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-5 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-base font-semibold">Generate New Proposal Version</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version Notes <span className="text-red-500">*</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the changes..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm" rows={3} />
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading} className="px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading || !notes.trim()}
            className="px-5 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const AdminOrderList = ({ onOrderClick }) => {
  const [orders, setOrders]                             = useState([]);
  const [loading, setLoading]                           = useState(false);
  const [downloading, setDownloading]                   = useState(false);
  const [searchTerm, setSearchTerm]                     = useState('');
  const [filterStatus, setFilterStatus]                 = useState('all');
  const [currentPage, setCurrentPage]                   = useState(1);
  const [totalPages, setTotalPages]                     = useState(1);
  const itemsPerPage = 10;
  const [editingOrder, setEditingOrder]                 = useState(null);
  const [showProposalModal, setShowProposalModal]       = useState(false);
  const [selectedOrderId, setSelectedOrderId]           = useState(null);
  const [generatingProposal, setGeneratingProposal]     = useState(false);
  const [proposalNotes, setProposalNotes]               = useState('');
  const [successMessage, setSuccessMessage]             = useState(null);
  const [showPOModal, setShowPOModal]                   = useState(false);
  const [selectedPOOrderId, setSelectedPOOrderId]       = useState(null);
  const [selectedPOClientInfo, setSelectedPOClientInfo] = useState(null);
  const [cogOrderId, setCogOrderId]                     = useState(null);

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 4000); };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders((data.orders || []).filter(o => o && o.selectedPlan));
      setTotalPages(data.totalPages || 1);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [currentPage, filterStatus]);
  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchOrders(); }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Optimistic status update
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    showSuccess(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
  };

  const handleDownload = async (orderId, type) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}/${type}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const ext = res.headers.get('content-type')?.includes('sheet') ? 'xlsx' : 'pdf';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `order-${type}-${orderId}.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { alert('Failed to download. Please try again.'); } finally { setDownloading(false); }
  };

  const handleCOGDownload = async (orderId, clientName) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}/cog-report`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const safeName = (clientName || 'client').replace(/[^a-zA-Z0-9]/g, '_');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `COG_${safeName}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      showSuccess('COG Report downloaded');
    } catch { alert('Failed to generate COG Report. Please try again.'); } finally { setDownloading(false); }
  };

  const handleGenerateProposal = async () => {
    if (!proposalNotes.trim()) return;
    setGeneratingProposal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${selectedOrderId}/proposal`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: proposalNotes }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `proposal-${selectedOrderId}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setShowProposalModal(false); setProposalNotes('');
      showSuccess('Proposal generated');
    } catch { alert('Failed to generate proposal.'); } finally { setGeneratingProposal(false); }
  };

  const handleEdit = (order) => {
    if (order.status !== 'ongoing') return;
    if (!order.selectedPlan) { alert('Cannot edit: No floor plan selected'); return; }
    setEditingOrder({ ...order, packageType: order.packageType || 'investor',
      selectedPlan: { ...order.selectedPlan, id: order.selectedPlan?.id || 'investor-a', image: order.selectedPlan?.image || `/floorplans/${order.selectedPlan?.id}.png` } });
  };

  if (editingOrder) {
    const isLibrary = editingOrder.packageType === 'library';
    const isCustom  = editingOrder.packageType === 'custom';
    return (
      <div className="space-y-4">
        {!isLibrary && !isCustom && (
          <div className="p-4 bg-white border-b border-gray-200">
            <button onClick={() => { setEditingOrder(null); fetchOrders(); }}
              className="inline-flex items-center text-[#005670] hover:text-[#005670]/80 text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </button>
          </div>
        )}
        {isCustom ? (
          <CustomProductManager order={editingOrder} onSave={() => {}} onBack={() => { setEditingOrder(null); fetchOrders(); }} />
        ) : isLibrary ? (
          <LibraryFloorPlanEditor order={editingOrder} onSave={() => fetchOrders()} onBack={() => { setEditingOrder(null); fetchOrders(); }} />
        ) : (
          <AreaCustomization selectedPlan={editingOrder.selectedPlan} floorPlanImage={editingOrder.selectedPlan?.image}
            existingOrder={editingOrder} clientInfo={editingOrder.clientInfo} currentStep={editingOrder.step || 2}
            checkExistingOrder={fetchOrders} onComplete={() => fetchOrders()} />
        )}
      </div>
    );
  }

  if (cogOrderId) return <COGReportViewer orderId={cogOrderId} onClose={() => setCogOrderId(null)} />;

  return (
    <div className="space-y-5">
      {downloading && <LoadingOverlay />}
      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Order Management</h1>
        <p className="text-sm text-gray-400">{orders?.length || 0} orders</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-3.5 border border-gray-200">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by client name..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-colors" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white appearance-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-colors min-w-[130px]">
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#005670]" /></div>
      ) : (orders?.length ?? 0) === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders || []).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {((order.clientInfo?.name || 'C') || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm leading-tight">{order.clientInfo?.name || 'Unknown Client'}</p>
                        {order.clientInfo?.unitNumber && (
                          <p className="text-xs text-gray-400 mt-0.5">Unit {order.clientInfo.unitNumber}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <PackageBadge packageType={order.packageType} floorPlan={order.clientInfo?.floorPlan} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{order.selectedPlan?.title || '—'}</td>
                  <td className="px-4 py-3.5">
                    {order && <StatusChanger order={order} onStatusChange={handleStatusChange} />}
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionMenu
                      order={order}
                      onEdit={() => handleEdit(order)}
                      onView={() => onOrderClick && onOrderClick(order._id)}
                      onProposal={() => window.open(`/admin/proposal/${order._id}`, '_blank')}
                      onInstallBinder={() => window.open(`/admin/install-binder/${order._id}`, '_blank')}
                      onDownload={(type) => handleDownload(order._id, type)}
                      onCOGExcel={() => handleCOGDownload(order._id, order.clientInfo?.name)}
                      onCOGPdf={() => setCogOrderId(order._id)}
                      onPO={() => { setSelectedPOOrderId(order._id); setSelectedPOClientInfo(order.clientInfo); setShowPOModal(true); }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 p-4 border-t border-gray-100">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">‹</button>
              {Array.from({ length: totalPages || 0 }, (_, i) => i+1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage===page ? 'bg-[#005670] text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">›</button>
            </div>
          )}
        </div>
      )}

      <ProposalModal isOpen={showProposalModal} onClose={() => { setShowProposalModal(false); setProposalNotes(''); }}
        onConfirm={handleGenerateProposal} isLoading={generatingProposal} notes={proposalNotes} setNotes={setProposalNotes} />

      <POVendorSelector isOpen={showPOModal}
        onClose={() => { setShowPOModal(false); setSelectedPOOrderId(null); setSelectedPOClientInfo(null); }}
        orderId={selectedPOOrderId} orderClientInfo={selectedPOClientInfo} />
    </div>
  );
};

export default AdminOrderList;