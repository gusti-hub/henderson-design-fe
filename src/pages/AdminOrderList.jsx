// AdminOrderList.jsx — v4
// Changes vs v3:
//   1. wrapT bug fix noted (backend)
//   2. Two views: "Projects" (card/table as-is) and "All Products" (searchable flat list)
//   3. Download All Report button (per-product breakdown with costs)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Loader2, Download, FileText, Edit2, ArrowLeft, X, Check,
  Search, ChevronDown, BarChart2, BookOpen,
  ShoppingCart, TrendingUp, Eye, LayoutList, FolderOpen,
  Package, DollarSign, Filter, CheckSquare, Square, Printer, Plus, ArrowRightLeft, BookMarked,
} from 'lucide-react';
import { toJsDelivrUrl } from '../utils/imageUrl';
import { backendServer } from '../utils/info';
import AreaCustomization from '../components/design-flow/AreaCustomization';
import LibraryFloorPlanEditor from '../components/LibraryFloorPlanEditor';
import CustomProductManager from '../components/CustomProductManager';
import COGReportViewer from '../components/COGReportViewer';
import ProjectSummaryEditorModal from '../components/ProjectSummaryEditorModal';

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

// ─── Status Changer ───────────────────────────────────────────────────────────
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
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${cfg.cls} hover:shadow-sm`}>
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />}
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

const PackageBadge = ({ packageType }) => {
  const cfg = { investor:{label:'Nalu',cls:'bg-blue-100 text-blue-700'}, custom:{label:'Lani',cls:'bg-purple-100 text-purple-700'}, library:{label:'Library',cls:'bg-teal-100 text-teal-700'} }[packageType] || {label:'Nalu',cls:'bg-blue-100 text-blue-700'};
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Portal dropdown ──────────────────────────────────────────────────────────
const usePortalDropdown = (triggerRef, open) => {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 320;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUpward = spaceBelow < menuHeight + 10;
    setPos({
      top: openUpward ? r.top + window.scrollY - menuHeight - 6 : r.bottom + window.scrollY + 6,
      right: window.innerWidth - r.right,
    });
  }, [open]);
  return { pos, menuRef };
};

// ─── Action Menu ──────────────────────────────────────────────────────────────
const ActionMenu = ({ order, onEdit, onView, onProposal, onInstallBinder, onInstallBinderExcel, onDownload, onCOGExcel, onCOGWithBill, onPO, onProjectSummary }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { pos, menuRef } = usePortalDropdown(triggerRef, open);
  const canEdit = order.status === 'ongoing';

  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const Item = ({ icon: Icon, label, onClick, color = 'text-gray-700' }) => (
    <button onClick={() => { onClick(); setOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${color} hover:bg-gray-50 transition-colors text-left`}>
      <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
      <span className="flex-1">{label}</span>
    </button>
  );
  const Sep = () => <div className="my-1 border-t border-gray-100" />;
  const Group = ({ label }) => <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>;

  return (
    <div ref={triggerRef} className="relative flex items-center gap-1.5 justify-end">
      <button onClick={onEdit} disabled={!canEdit}
        title={canEdit ? 'Edit order' : 'Only ongoing orders can be edited'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${canEdit ? 'bg-[#005670] text-white hover:bg-[#004558] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={() => setOpen(o => !o)}
        className={`p-1.5 rounded-lg border transition-all
          ${open ? 'bg-gray-100 border-gray-300 text-gray-900' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300'}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" />
        </svg>
      </button>
      {open && ReactDOM.createPortal(
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-56 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden py-1">
          <Group label="View" />
          <Item icon={Eye}          label="View Client Summary"           onClick={onView} />
          <Sep />
          <Group label="Documents" />
          <Item icon={Download}     label="Install Binder (PDF)"          onClick={onInstallBinder}         color="text-green-600" />
          <Item icon={Download}     label="Install Binder (Excel)"        onClick={onInstallBinderExcel}    color="text-emerald-600" />
          <Sep />
          <Item icon={Download}     label="Order Summary (Excel)"         onClick={() => onDownload('summary', 'Order Summary')} />
          <Item icon={TrendingUp}   label="Status Report"                 onClick={() => onDownload('status-report', 'Status Report')} color="text-teal-600" />
          <Item icon={BarChart2}    label="COG Report (Excel)"            onClick={onCOGExcel}              color="text-purple-600" />
          <Item icon={BarChart2}    label="COG + Bill Comparison"         onClick={onCOGWithBill}           color="text-indigo-600" />
          <Sep />
          <Item icon={TrendingUp}   label="Project Summary"               onClick={onProjectSummary}        color="text-teal-600" />
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── All Products View ────────────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 50;

const AllProductsView = ({ orders, searchTerm, setSearchTerm, onDownloadAllReport, downloading }) => {
  const [vendorFilter, setVendorFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Flatten all products across all orders
  const allProducts = React.useMemo(() => {
    const flat = [];
    (orders || []).forEach(order => {
      (order.selectedProducts || []).forEach(p => {
        flat.push({
          ...p,
          _orderId:       order._id,
          _clientName:    order.clientInfo?.name || '—',
          _clientUnit:    order.clientInfo?.unitNumber || '',
          _orderStatus:   order.status,
          _proposalNum:   order.proposalNumber ? `#${order.proposalNumber}` : '',
          _orderNum:      order.orderNumber    ? `Order ${order.orderNumber}` : '',
          _vendorName:    (p.vendor && typeof p.vendor === 'object') ? p.vendor.name : 'HDG Inventory',
        });
      });
    });
    return flat;
  }, [orders]);

  const clients = React.useMemo(() => [...new Set(allProducts.map(p => p._clientName))].sort(), [allProducts]);
  const vendors = React.useMemo(() => [...new Set(allProducts.map(p => p._vendorName))].sort(), [allProducts]);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [searchTerm, clientFilter, vendorFilter]);

  const filtered = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allProducts.filter(p => {
      const matchSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.product_id?.toLowerCase().includes(q) ||
        p._clientName?.toLowerCase().includes(q) ||
        p._vendorName?.toLowerCase().includes(q) ||
        p._proposalNum?.toLowerCase().includes(q) ||
        p.selectedOptions?.room?.toLowerCase().includes(q) ||
        p.selectedOptions?.finish?.toLowerCase().includes(q) ||
        p.selectedOptions?.fabric?.toLowerCase().includes(q) ||
        p.selectedOptions?.specifications?.toLowerCase().includes(q) ||
        p.selectedOptions?.poNumber?.toLowerCase().includes(q) ||
        p.selectedOptions?.vendorOrderNumber?.toLowerCase().includes(q) ||
        p.selectedOptions?.trackingInfo?.toLowerCase().includes(q);
      const matchClient = clientFilter === 'all' || p._clientName === clientFilter;
      const matchVendor = vendorFilter === 'all' || p._vendorName === vendorFilter;
      return matchSearch && matchClient && matchVendor;
    });
  }, [allProducts, searchTerm, clientFilter, vendorFilter]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const fmt = (n) => isNaN(n) ? '—' : `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const getNetCost = (p) => {
    const opts = p.selectedOptions || {};
    if (opts.netCostOverride != null && opts.netCostOverride !== '') return parseFloat(opts.netCostOverride);
    const msrp = parseFloat(opts.msrp) || 0;
    const disc = parseFloat(opts.discountPercent) || 0;
    return msrp * (1 - disc / 100);
  };
  const getSellPrice = (p) => {
    const opts = p.selectedOptions || {};
    const msrp = parseFloat(opts.msrp) || 0;
    const markup = parseFloat(opts.markupPercent) || 0;
    return msrp * (1 + markup / 100);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by SKU, product name, client, vendor, PO #, room, tracking..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-colors" />
        </div>
        <div className="relative">
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 appearance-none focus:ring-2 focus:ring-[#005670]/20 min-w-[150px]">
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 appearance-none focus:ring-2 focus:ring-[#005670]/20 min-w-[150px]">
            <option value="all">All Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        <button onClick={onDownloadAllReport} disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex-shrink-0">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download All Report
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: filtered.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Clients', value: new Set(filtered.map(p => p._clientName)).size, icon: FolderOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Net Cost', value: fmt(filtered.reduce((s, p) => s + getNetCost(p) * (p.quantity || 1), 0)), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Sell Price', value: fmt(filtered.reduce((s, p) => s + getSellPrice(p) * (p.quantity || 1), 0)), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {['Client','Proposal #','Vendor','Product Name','SKU','Room','Qty','Net Cost','Sell Price','PO #'].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-gray-400 text-sm">No products found</td></tr>

              ) : paginated.map((p, i) => {
                const netCost = getNetCost(p);
                const sellPrice = getSellPrice(p);
                const qty = p.quantity || 1;
                return (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 min-w-[130px]">
                      <p className="font-medium text-gray-800 text-xs whitespace-nowrap">{p._clientName}</p>
                      {p._clientUnit && <p className="text-[11px] text-gray-400">Unit {p._clientUnit}</p>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {p._proposalNum
                        ? <span className="inline-block px-2 py-0.5 rounded-full bg-[#005670]/10 text-[#005670] text-[11px] font-semibold">{p._proposalNum}</span>
                        : <span className="text-[11px] text-gray-300">—</span>}
                      {p._orderNum && <p className="text-[10px] text-gray-400 mt-0.5">{p._orderNum}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{p._vendorName}</td>
                    <td className="px-3 py-2.5 min-w-[160px]">
                      <p className="font-medium text-gray-800 text-xs">{p.name || '—'}</p>
                      {p.selectedOptions?.specifications && (
                        <p className="text-[11px] text-gray-400 max-w-[200px] truncate">{p.selectedOptions.specifications}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#005670] font-mono whitespace-nowrap font-semibold">{p.product_id || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{p.selectedOptions?.room || p.category || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-center text-gray-700">{qty}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">
                      <p>{fmt(netCost)}</p>
                      <p className="text-[11px] text-gray-400">× {qty} = {fmt(netCost * qty)}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">
                      <p>{fmt(sellPrice)}</p>
                      <p className="text-[11px] text-gray-400">× {qty} = {fmt(sellPrice * qty)}</p>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-gray-500 whitespace-nowrap">{p.selectedOptions?.poNumber || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Pagination — always outside the table container */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500">
          Showing {Math.min((page-1)*PRODUCTS_PER_PAGE+1, filtered.length)}–{Math.min(page*PRODUCTS_PER_PAGE, filtered.length)} of {filtered.length} products
        </p>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
            className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pg;
            if (totalPages <= 7) pg = i + 1;
            else if (page <= 4) pg = i + 1;
            else if (page >= totalPages - 3) pg = totalPages - 6 + i;
            else pg = page - 3 + i;
            return (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page===pg ? 'bg-[#005670] text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {pg}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">›</button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const AdminOrderList = ({ onOrderClick }) => {
  const [orders, setOrders]         = useState([]);
  const [allOrders, setAllOrders]   = useState([]); // for all-products view
  const [loading, setLoading]       = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [view, setView]                 = useState('projects'); // 'projects' | 'products'
  const itemsPerPage = 10;
  const [editingOrder, setEditingOrder]     = useState(null);
  const [clientOrdersView, setClientOrdersView] = useState(null); // { clientId, clientInfo, orders, loading }
  const [addingNewOrder, setAddingNewOrder] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [moveSourceId, setMoveSourceId] = useState('');
  const [moveTargetId, setMoveTargetId] = useState('');
  const [moveSelectedIds, setMoveSelectedIds] = useState(new Set());
  const [movingItems, setMovingItems] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cogOrderId, setCogOrderId]         = useState(null);
  const [projectSummaryClientId, setProjectSummaryClientId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [vendorModal, setVendorModal] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [proposalSelectModal, setProposalSelectModal] = useState(false);
  const [proposalVersionsData, setProposalVersionsData] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersionRefs, setSelectedVersionRefs] = useState(new Set());
  // Client-level view: { userId, clientInfo }
  const [selectedClient, setSelectedClient] = useState(null);

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 4000); };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/orders?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setOrders((data.orders || []).filter(o => o && o.selectedPlan));
      setTotalPages(data.totalPages || 1);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [currentPage, filterStatus, searchTerm]);

  // For all-products view: fetch all orders (no pagination)
  const fetchAllOrders = useCallback(async () => {
    if (allOrders.length > 0) return; // already loaded
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders?page=1&limit=500&status=all&groupByClient=false`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAllOrders((data.orders || []).filter(o => o && o.selectedProducts?.length > 0));
    } catch (err) { console.error(err); }
  }, [allOrders.length]);

  useEffect(() => { fetchOrders(); }, [currentPage, filterStatus]);

  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchOrders(); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (view === 'products') fetchAllOrders();
  }, [view]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    showSuccess(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
  };

  // ── Download helpers ──────────────────────────────────────────────────────
  const handleDownload = async (orderId, type, clientName, label, ext = 'xlsx') => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}/${type}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const safeClient = (clientName || 'Client').replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const filename = `${safeClient} - ${label || type}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert('Failed to download. Please try again.'); }
    finally { setDownloading(false); }
  };

  const handleCOGDownload = async (orderId, clientName) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}/cog-report`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const safeClient = (clientName || 'Client').replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${safeClient} - COG Report.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('COG Report downloaded');
    } catch { alert('Failed to generate COG Report.'); }
    finally { setDownloading(false); }
  };

  const handleCOGWithBillDownload = async (orderId, clientName) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}/cog-report-with-bill`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const safeClient = (clientName || 'Client').replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${safeClient} - COG Bill Comparison.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('COG Bill Comparison downloaded');
    } catch { alert('Failed to generate COG Bill Comparison.'); }
    finally { setDownloading(false); }
  };

  // ── Toggle selection ──────────────────────────────────────────────────────
  const toggleOrder = (orderId) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map(o => o._id)));
    }
  };

  // ── Bulk Excel export ─────────────────────────────────────────────────────
  const handleBulkExcel = async () => {
    if (selectedOrderIds.size === 0) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/bulk-export`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrderIds) }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `Alia - Combined Export - ${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Combined Excel exported');
    } catch { alert('Failed to export. Please try again.'); }
    finally { setDownloading(false); }
  };

  // ── Bulk PDF — open vendor picker first ──────────────────────────────────
  const handleBulkPdfOpen = async () => {
    if (selectedOrderIds.size === 0) return;
    setLoadingVendors(true);
    setVendorModal(true);
    setSelectedVendorId('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/bulk-po-vendors`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrderIds) }),
      });
      const data = await res.json();
      setVendorList(data.vendors || []);
    } catch { setVendorModal(false); alert('Failed to load vendors.'); }
    finally { setLoadingVendors(false); }
  };

  const handleBulkPdfGenerate = async () => {
    if (!selectedVendorId) return;
    setVendorModal(false);
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/bulk-po`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrderIds), vendorId: selectedVendorId }),
      });
      if (!res.ok) throw new Error();
      const html = await res.text();
      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch { alert('Failed to generate PDF. Please try again.'); }
    finally { setDownloading(false); }
  };

  // ── Bulk Proposal print ───────────────────────────────────────────────────
  const handleBulkProposals = async () => {
    if (selectedOrderIds.size === 0) return;
    setLoadingVersions(true);
    setProposalSelectModal(true);
    setProposalVersionsData([]);
    setSelectedVersionRefs(new Set());
    try {
      const token = localStorage.getItem('token');
      const results = await Promise.all(
        Array.from(selectedOrderIds).map(async (id) => {
          const res = await fetch(`${backendServer}/api/proposals/${id}/versions/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const r = await res.json();
          return { orderId: id, versions: r.success ? (r.data || []) : [] };
        })
      );
      const orderMap = new Map(orders.map(o => [o._id, o]));
      const data = results.map(({ orderId, versions }) => {
        const order = orderMap.get(orderId);
        const clientName = order?.clientInfo?.name || '—';
        const unit = order?.clientInfo?.unitNumber ? `Unit ${order.clientInfo.unitNumber}` : '';
        const orderLabel = [clientName, unit].filter(Boolean).join(' · ');
        return { orderId, orderLabel, versions };
      });
      setProposalVersionsData(data);
      const allRefs = new Set();
      data.forEach(({ orderId, versions }) => {
        if (versions.length === 0) {
          allRefs.add(`${orderId}:latest`);
        } else {
          versions.forEach(v => allRefs.add(`${orderId}:${v.version}`));
        }
      });
      setSelectedVersionRefs(allRefs);
    } catch (e) {
      alert('Failed to load proposal versions.');
      setProposalSelectModal(false);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleConfirmBulkProposals = () => {
    if (selectedVersionRefs.size === 0) return;
    const refs = Array.from(selectedVersionRefs).join(',');
    window.open(`/admin/bulk-print?refs=${refs}`, '_blank');
    setProposalSelectModal(false);
  };

  // ── Download ALL products report (across all clients) ─────────────────────
  const handleDownloadAllReport = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/all-products-report`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `HDG - All Products Report - ${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('All Products Report downloaded');
    } catch { alert('Failed to generate report.'); }
    finally { setDownloading(false); }
  };

  const handleEdit = async (order) => {
    if (order.status !== 'ongoing') return;
    const clientId = typeof order.user === 'object' ? (order.user?._id || order.user?.id) : order.user;
    setClientOrdersView({ clientId, clientInfo: order.clientInfo, orders: [], loading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/client/${clientId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClientOrdersView(prev => prev ? { ...prev, orders: data.orders || [], loading: false } : null);
    } catch {
      setClientOrdersView(null);
      alert('Failed to load orders for this client.');
    }
  };

  const handleManageProducts = (order) => {
    setEditingOrder({
      ...order,
      packageType: order.packageType || 'investor',
      selectedPlan: {
        ...order.selectedPlan,
        id: order.selectedPlan?.id || 'investor-a',
        image: order.selectedPlan?.image || `/floorplans/${order.selectedPlan?.id}.png`,
      },
    });
  };

  const handleNewOrderFromTable = async () => {
    if (!clientOrdersView?.clientId || addingNewOrder) return;
    setAddingNewOrder(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/client/${clientOrdersView.clientId}/new-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const refetch = await fetch(`${backendServer}/api/orders/client/${clientOrdersView.clientId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await refetch.json();
      setClientOrdersView(prev => prev ? { ...prev, orders: data.orders || [] } : null);
    } catch {
      alert('Failed to create new order.');
    } finally {
      setAddingNewOrder(false);
    }
  };

  const openMoveModal = () => {
    const orders = clientOrdersView?.orders || [];
    if (orders.length < 2) return;
    const firstId = orders[0]._id;
    const secondId = orders[1]._id;
    setMoveSourceId(firstId);
    setMoveTargetId(secondId);
    setMoveSelectedIds(new Set());
    setMoveModal(true);
  };

  const handleMoveProducts = async () => {
    if (!moveSourceId || !moveTargetId || moveSelectedIds.size === 0) return;
    setMovingItems(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/move-products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceOrderId: moveSourceId,
          targetOrderId: moveTargetId,
          productIds: [...moveSelectedIds],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed');
      }
      const refetch = await fetch(`${backendServer}/api/orders/client/${clientOrdersView.clientId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await refetch.json();
      setClientOrdersView(prev => prev ? { ...prev, orders: data.orders || [] } : null);
      setMoveModal(false);
      setSuccessMessage(`Moved ${moveSelectedIds.size} item(s) successfully`);
    } catch (err) {
      alert(err.message || 'Failed to move items.');
    } finally {
      setMovingItems(false);
    }
  };

  const handleBack = () => {
    setEditingOrder(null);
    if (clientOrdersView) {
      const token = localStorage.getItem('token');
      fetch(`${backendServer}/api/orders/client/${clientOrdersView.clientId}`,
        { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setClientOrdersView(prev => prev ? { ...prev, orders: data.orders || [], loading: false } : null))
        .catch(() => {});
    } else {
      fetchOrders();
    }
  };

  if (editingOrder) {
    const isLibrary = editingOrder.packageType === 'library';
    const isCustom  = editingOrder.packageType === 'custom';
    return (
      <div className="space-y-4">
        {!isLibrary && !isCustom && (
          <div className="p-4 bg-white border-b border-gray-200">
            <button onClick={handleBack}
              className="inline-flex items-center text-[#005670] hover:text-[#005670]/80 text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {clientOrdersView ? 'Back to Client Orders' : 'Back to Orders'}
            </button>
          </div>
        )}
        {isCustom ? (
          <CustomProductManager
            key={editingOrder._id}
            order={editingOrder}
            onSave={() => {}}
            onBack={handleBack}
          />
        ) : isLibrary ? (
          <LibraryFloorPlanEditor order={editingOrder} onSave={() => fetchOrders()} onBack={handleBack} />
        ) : (
          <AreaCustomization selectedPlan={editingOrder.selectedPlan} floorPlanImage={editingOrder.selectedPlan?.image}
            existingOrder={editingOrder} clientInfo={editingOrder.clientInfo} currentStep={editingOrder.step || 2}
            checkExistingOrder={fetchOrders} onComplete={handleBack} />
        )}
      </div>
    );
  }

  if (clientOrdersView && !editingOrder) {
    const { clientInfo, orders: clientOrders, loading: loadingClientOrders } = clientOrdersView;
    return (
      <div className="space-y-5">
        {/* Header bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => { setClientOrdersView(null); fetchOrders(); }}
            className="flex items-center gap-1.5 text-sm font-medium text-[#005670] hover:text-[#004558] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(clientInfo?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">{clientInfo?.name || 'Unknown Client'}</p>
              {clientInfo?.unitNumber && <p className="text-xs text-gray-400">Unit {clientInfo.unitNumber}</p>}
            </div>
          </div>
        </div>

        {/* Orders table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">All Orders</h3>
            <div className="flex items-center gap-2">
              {clientOrders.length >= 2 && (
                <button
                  onClick={openMoveModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Move Items
                </button>
              )}
              <button
                onClick={handleNewOrderFromTable}
                disabled={addingNewOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005670] text-white text-xs font-semibold rounded-lg hover:bg-[#004558] transition-colors disabled:opacity-50"
              >
                {addingNewOrder
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Plus className="w-3.5 h-3.5" />}
                New Order
              </button>
            </div>
          </div>

          {loadingClientOrders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#005670]" />
            </div>
          ) : clientOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientOrders.map((order) => {
                  const rawLabel = order.orderLabel?.trim();
                  const phaseMatch = rawLabel?.match(/^phase\s*(\d+)$/i);
                  const displayName = phaseMatch
                    ? `Order ${phaseMatch[1]}`
                    : rawLabel || (order.orderNumber ? `Order ${order.orderNumber}` : 'Order');
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800 text-sm">{displayName}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-500">{order.selectedProducts?.length || 0} items</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusChanger
                          order={order}
                          onStatusChange={(orderId, newStatus) => {
                            setClientOrdersView(prev => prev ? {
                              ...prev,
                              orders: prev.orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o),
                            } : null);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {order.updatedAt
                          ? new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleManageProducts(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#005670] text-white text-xs font-semibold rounded-lg hover:bg-[#004558] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Manage Products
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Move Items Modal ───────────────────────────────────── */}
        {moveModal && (() => {
          const orders = clientOrders;
          const sourceOrder = orders.find(o => o._id === moveSourceId);
          const sourceProducts = sourceOrder?.selectedProducts || [];
          const allChecked = sourceProducts.length > 0 && sourceProducts.every(p => moveSelectedIds.has(p._id));

          const orderLabel = (o) => {
            const raw = o.orderLabel?.trim();
            return raw || (o.orderNumber ? `Order ${o.orderNumber}` : 'Order');
          };

          return (
            <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#005670] text-white px-6 py-4 rounded-t-xl flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    <h3 className="font-semibold text-base">Move Items Between Orders</h3>
                  </div>
                  <button onClick={() => setMoveModal(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                  {/* From / To selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From</label>
                      <select
                        value={moveSourceId}
                        onChange={e => {
                          setMoveSourceId(e.target.value);
                          setMoveSelectedIds(new Set());
                          if (e.target.value === moveTargetId) {
                            const other = orders.find(o => o._id !== e.target.value);
                            if (other) setMoveTargetId(other._id);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                      >
                        {orders.map(o => (
                          <option key={o._id} value={o._id}>{orderLabel(o)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To</label>
                      <select
                        value={moveTargetId}
                        onChange={e => {
                          setMoveTargetId(e.target.value);
                          if (e.target.value === moveSourceId) {
                            const other = orders.find(o => o._id !== e.target.value);
                            if (other) setMoveSourceId(other._id);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                      >
                        {orders.filter(o => o._id !== moveSourceId).map(o => (
                          <option key={o._id} value={o._id}>{orderLabel(o)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product list */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Select items to move ({moveSelectedIds.size} selected)
                      </p>
                      {sourceProducts.length > 0 && (
                        <button
                          onClick={() => setMoveSelectedIds(allChecked ? new Set() : new Set(sourceProducts.map(p => p._id)))}
                          className="text-xs text-[#005670] font-medium hover:underline"
                        >
                          {allChecked ? 'Deselect all' : 'Select all'}
                        </button>
                      )}
                    </div>
                    {sourceProducts.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No products in this order</p>
                    ) : (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {sourceProducts.map(p => {
                          const imgUrl = toJsDelivrUrl(
                            p.selectedOptions?.uploadedImages?.[0]?.url ||
                            p.selectedOptions?.image || p.imageUrl || null
                          );
                          const checked = moveSelectedIds.has(p._id);
                          return (
                            <label
                              key={p._id}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                checked ? 'bg-[#005670]/5 border-[#005670]/30' : 'border-gray-100 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#005670] flex-shrink-0"
                                checked={checked}
                                onChange={() => {
                                  setMoveSelectedIds(prev => {
                                    const next = new Set(prev);
                                    next.has(p._id) ? next.delete(p._id) : next.add(p._id);
                                    return next;
                                  });
                                }}
                              />
                              {imgUrl ? (
                                <img src={imgUrl} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0 bg-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{p.name || 'Untitled'}</p>
                                <p className="text-xs text-gray-400">{p.selectedOptions?.room || '—'}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                  <button
                    onClick={() => setMoveModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMoveProducts}
                    disabled={moveSelectedIds.size === 0 || movingItems}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {movingItems
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <ArrowRightLeft className="w-4 h-4" />}
                    Move {moveSelectedIds.size > 0 ? `${moveSelectedIds.size} Item${moveSelectedIds.size > 1 ? 's' : ''}` : 'Items'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  if (cogOrderId) return <COGReportViewer orderId={cogOrderId} onClose={() => setCogOrderId(null)} />;

  return (
    <div className="space-y-5">
      {downloading && <LoadingOverlay />}
      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />}

      {/* Vendor picker modal for bulk PDF */}
      {vendorModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="bg-[#005670] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="font-semibold text-base">Select Vendor for PDF</h3>
              <button onClick={() => setVendorModal(false)} className="hover:bg-white/20 rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              {loadingVendors ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading vendors…
                </div>
              ) : vendorList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No POs found for the selected units.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {vendorList.map(v => (
                    <button
                      key={v.vendorId}
                      onClick={() => setSelectedVendorId(v.vendorId)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        selectedVendorId === v.vendorId
                          ? 'border-[#005670] bg-[#005670]/5 text-[#005670]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {v.vendorName}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setVendorModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleBulkPdfGenerate}
                  disabled={!selectedVendorId || loadingVendors}
                  className="flex-1 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-[#004558]"
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal version selection modal */}
      {proposalSelectModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="bg-[#005670] text-white px-6 py-4 rounded-t-xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5" />
                <h3 className="font-semibold text-base">Select Proposals to Print</h3>
              </div>
              <button onClick={() => setProposalSelectModal(false)} className="hover:bg-white/20 rounded-lg p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {loadingVersions ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading versions…
                </div>
              ) : proposalVersionsData.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No proposal data found.</p>
              ) : (
                proposalVersionsData.map(({ orderId, orderLabel, versions }) => {
                  const allSelected = versions.length === 0
                    ? selectedVersionRefs.has(`${orderId}:latest`)
                    : versions.every(v => selectedVersionRefs.has(`${orderId}:${v.version}`));
                  const toggleAll = () => {
                    setSelectedVersionRefs(prev => {
                      const next = new Set(prev);
                      if (versions.length === 0) {
                        allSelected ? next.delete(`${orderId}:latest`) : next.add(`${orderId}:latest`);
                      } else {
                        versions.forEach(v => {
                          allSelected ? next.delete(`${orderId}:${v.version}`) : next.add(`${orderId}:${v.version}`);
                        });
                      }
                      return next;
                    });
                  };
                  return (
                    <div key={orderId} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">{orderLabel}</span>
                        <button onClick={toggleAll} className="text-xs text-[#005670] font-medium hover:underline">
                          {allSelected ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      {versions.length === 0 ? (
                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#005670]"
                            checked={selectedVersionRefs.has(`${orderId}:latest`)}
                            onChange={() => {
                              setSelectedVersionRefs(prev => {
                                const next = new Set(prev);
                                const ref = `${orderId}:latest`;
                                next.has(ref) ? next.delete(ref) : next.add(ref);
                                return next;
                              });
                            }}
                          />
                          <span className="text-sm text-gray-700">Latest (no saved versions)</span>
                        </label>
                      ) : (
                        versions.map(v => {
                          const ref = `${orderId}:${v.version}`;
                          const checked = selectedVersionRefs.has(ref);
                          const statusCls = v.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                            : v.status === 'sent' ? 'bg-blue-100 text-blue-700'
                            : v.status === 'rejected' ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500';
                          return (
                            <label key={ref} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${checked ? 'bg-[#005670]/5' : 'hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#005670] flex-shrink-0"
                                checked={checked}
                                onChange={() => {
                                  setSelectedVersionRefs(prev => {
                                    const next = new Set(prev);
                                    next.has(ref) ? next.delete(ref) : next.add(ref);
                                    return next;
                                  });
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-800">Version {v.version}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>{v.status || 'draft'}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{v.proposalNumber || '—'}</p>
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : ''}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-gray-500">{selectedVersionRefs.size} proposal{selectedVersionRefs.size !== 1 ? 's' : ''} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setProposalSelectModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkProposals}
                  disabled={selectedVersionRefs.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Open Print Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{view === 'projects' ? `${orders?.length || 0} orders` : `${allOrders?.length || 0} projects loaded`}</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 gap-1">
          <button onClick={() => setView('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${view === 'projects' ? 'bg-[#005670] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FolderOpen className="w-4 h-4" /> Projects
          </button>
          <button onClick={() => setView('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${view === 'products' ? 'bg-[#005670] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <LayoutList className="w-4 h-4" /> All Products
          </button>
        </div>
      </div>

      {/* ── Products view ── */}
      {view === 'products' ? (
        allOrders.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
          </div>
        ) : (
          <AllProductsView
            orders={allOrders}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onDownloadAllReport={handleDownloadAllReport}
            downloading={downloading}
          />
        )
      ) : (
        /* ── Projects view ── */
        <>
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
                  className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white appearance-none focus:ring-2 focus:ring-[#005670]/20 min-w-[130px]">
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Bulk export bar ── */}
          {selectedOrderIds.size > 0 && (
            <div className="flex items-center justify-between bg-[#005670] text-white rounded-xl px-5 py-3 shadow-sm">
              <div>
                <span className="text-sm font-semibold">{selectedOrderIds.size} unit{selectedOrderIds.size !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Proposal */}
                <button
                  onClick={handleBulkProposals}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  <BookMarked className="w-4 h-4" />
                  Print Proposals
                </button>
                <div className="w-px h-6 bg-white/30" />
                {/* PO */}
                <button
                  onClick={handleBulkExcel}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#005670] rounded-lg text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PO Excel
                </button>
                <button
                  onClick={handleBulkPdfOpen}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 disabled:opacity-50"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  PO PDF
                </button>
                <button
                  onClick={() => setSelectedOrderIds(new Set())}
                  className="p-2 hover:bg-white/20 rounded-lg"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

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
                    <th className="px-3 py-3 w-8">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#005670]">
                        {selectedOrderIds.size === orders.length && orders.length > 0
                          ? <CheckSquare className="w-4 h-4 text-[#005670]" />
                          : <Square className="w-4 h-4" />
                        }
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modified By</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(orders || []).map((order) => (
                    <tr key={order._id} className={`hover:bg-gray-50/50 transition-colors ${selectedOrderIds.has(order._id) ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-3 py-3.5 w-8">
                        <button onClick={() => toggleOrder(order._id)} className="text-gray-400 hover:text-[#005670]">
                          {selectedOrderIds.has(order._id)
                            ? <CheckSquare className="w-4 h-4 text-[#005670]" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {(order.clientInfo?.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm leading-tight">{order.clientInfo?.name || 'Unknown Client'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {order.clientInfo?.unitNumber && <span className="text-xs text-gray-400">Unit {order.clientInfo.unitNumber}</span>}
                              {order.orderLabel && <span className="text-xs text-gray-500 font-medium">{order.orderLabel}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><PackageBadge packageType={order.packageType} /></td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{order.selectedPlan?.title || '—'}</td>
                      <td className="px-4 py-3.5">
                        {order && <StatusChanger order={order} onStatusChange={handleStatusChange} />}
                      </td>
                      <td className="px-4 py-3.5">
                        {order.updatedBy?.name ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-[#005670]/15 flex items-center justify-center text-[9px] text-[#005670] font-bold flex-shrink-0">
                              {order.updatedBy.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-[100px]">{order.updatedBy.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionMenu
                          order={order}
                          onEdit={() => handleEdit(order)}
                          onView={() => onOrderClick && onOrderClick(order._id)}
                          onInstallBinder={() => handleDownload(order._id, 'install-binder', order.clientInfo?.name, 'Install Binder', 'pdf')}
                          onInstallBinderExcel={() => handleDownload(order._id, 'install-binder-excel', order.clientInfo?.name, 'Install Binder')}
                          onDownload={(type, label) => handleDownload(order._id, type, order.clientInfo?.name, label)}
                          onCOGExcel={() => handleCOGDownload(order._id, order.clientInfo?.name)}
                          onCOGWithBill={() => handleCOGWithBillDownload(order._id, order.clientInfo?.name)}
                          onCOGPdf={() => setCogOrderId(order._id)}
                          onProjectSummary={() => {
                            const cid = typeof order.user === 'object' ? order.user?._id : order.user;
                            setProjectSummaryClientId(cid || null);
                          }}
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
        </>
      )}

      {projectSummaryClientId && (
        <ProjectSummaryEditorModal
          clientId={projectSummaryClientId}
          onClose={() => setProjectSummaryClientId(null)}
        />
      )}
    </div>
  );
};

export default AdminOrderList;