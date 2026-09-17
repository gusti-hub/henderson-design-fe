// pages/LogisticOrderTracker.jsx
// Logistic Order Tracker — all editable fields as columns, inline cell editing
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, RefreshCw, Filter, X, Download, Loader2, Pencil, ChevronsUpDown, ChevronUp, ChevronDown, Lock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { backendServer } from '../utils/info';

const STAGE_COLORS = {
  0: { bg: '#FF0000', text: '#fff', label: '0%'   },
  1: { bg: '#FFE599', text: '#333', label: '20%'  },
  2: { bg: '#FFFF00', text: '#333', label: '40%'  },
  3: { bg: '#D9EAD3', text: '#333', label: '60%'  },
  4: { bg: '#B6D7A8', text: '#333', label: '80%'  },
  5: { bg: '#6AA84F', text: '#fff', label: '100%' },
};

const StageBadge = ({ value }) => {
  const cfg = STAGE_COLORS[value ?? 0] || STAGE_COLORS[0];
  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold min-w-[36px] text-center"
    >
      {cfg.label}
    </span>
  );
};

// Colored select used directly in stage cells when editing
const StageCell = ({ value, onChange }) => {
  const cfg = STAGE_COLORS[value ?? 0] || STAGE_COLORS[0];
  return (
    <select
      value={value ?? 0}
      onChange={e => onChange(Number(e.target.value))}
      onClick={e => e.stopPropagation()}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
      className="w-[68px] px-1 py-0.5 rounded text-xs font-bold text-center border border-gray-300/60 cursor-pointer focus:outline-none"
    >
      {[0, 1, 2, 3, 4, 5].map(n => (
        <option key={n} value={n}>{n} — {STAGE_COLORS[n].label}</option>
      ))}
    </select>
  );
};

const PO_STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  received:  'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

const PoStatusBadge = ({ status }) => {
  const cls = PO_STATUS_STYLES[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
};

const STAGE_COLS = [
  { key: 'logDrawing',    label: 'Drawing'   },
  { key: 'logMachining',  label: 'Machining' },
  { key: 'logAssembly',   label: 'Assembly'  },
  { key: 'logFinishing',  label: 'Finishing' },
  { key: 'logQcChecking', label: 'QC'        },
  { key: 'logPacking',    label: 'Packing'   },
];

const NUMERIC_COLS = new Set([
  'poQuantity','shippedQuantity','balanceQuantity','unitPrice','totalPrice',
  'logDrawing','logMachining','logAssembly','logFinishing','logQcChecking','logPacking',
]);

const inputCls = 'w-full px-1.5 py-0.5 border border-[#005670]/40 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#005670]/40 bg-white';
const PAGE_SIZE = 100;

// ─── Component ───────────────────────────────────────────────────────────────
const LogisticOrderTracker = () => {
  const [rows, setRows]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [displayPage, setDisplayPage] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusCategories, setStatusCategories] = useState([]);
  const [poStatuses,       setPoStatuses]       = useState([]);

  // Inline edit
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [savingRow, setSavingRow]   = useState(false);
  const [rowError, setRowError]     = useState('');
  const [isDirty, setIsDirty]       = useState(false);
  const [toast, setToast]           = useState(null); // { type: 'success'|'error', msg }
  const editRowRef                  = useRef(null);
  const autoSaveRef                 = useRef(null); // always points to latest handleSave

  // Sort — default by PO number ascending
  const [sortCol, setSortCol] = useState('poNumber');
  const [sortDir, setSortDir] = useState('asc');

  // Filters
  const [filterProjectCode,    setFilterProjectCode]    = useState('');
  const [filterVendor,         setFilterVendor]         = useState('');
  const [filterStatusCategory, setFilterStatusCategory] = useState('');
  const [filterPoStatus,       setFilterPoStatus]       = useState('');
  const [filterArrivalDate,    setFilterArrivalDate]    = useState('');
  const [filterItemName,       setFilterItemName]       = useState('');
  const [search,               setSearch]               = useState('');
  const [searchInput,          setSearchInput]          = useState('');

  const token = localStorage.getItem('token');

  // Export
  const [showExportModal,     setShowExportModal]     = useState(false);
  const [exportClients,       setExportClients]       = useState([]);
  const [exportSelected,      setExportSelected]      = useState(new Set());
  const [exportClientSearch,  setExportClientSearch]  = useState('');
  const [exporting,           setExporting]           = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const r = await fetch(`${backendServer}/api/logistic/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) { const d = await r.json(); setStatusCategories(d.statusCategories || []); setPoStatuses(d.poStatuses || []); }
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); setDisplayPage(1); }, [search, filterProjectCode, filterVendor, filterStatusCategory, filterPoStatus, filterArrivalDate, filterItemName]);

  const fetchRows = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams();
      if (search)               p.set('search',              search);
      if (filterProjectCode)    p.set('projectCode',         filterProjectCode);
      if (filterVendor)         p.set('vendor',              filterVendor);
      if (filterStatusCategory) p.set('statusCategory',      filterStatusCategory);
      if (filterPoStatus)       p.set('poStatus',            filterPoStatus);
      if (filterArrivalDate)    p.set('expectedArrivalDate', filterArrivalDate);
      p.set('page', String(page)); p.set('limit', '10000');
      const r = await fetch(`${backendServer}/api/logistic?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error((await r.json()).message || 'Fetch failed');
      const d = await r.json();
      setRows(d.data || []); setTotal(d.total ?? 0); setTotalPages(d.totalPages ?? 1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, search, filterProjectCode, filterVendor, filterStatusCategory, filterPoStatus, filterArrivalDate, page]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { fetchRows(); },  [fetchRows]);
  useEffect(() => { setEditingKey(null); setEditForm({}); setIsDirty(false); }, [displayPage]);

  // Auto-save on click outside editing row
  useEffect(() => {
    if (!editingKey) return;
    const handler = (e) => {
      if (savingRow) return;
      if (editRowRef.current && !editRowRef.current.contains(e.target)) {
        autoSaveRef.current?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingKey]); // re-subscribe only when editing row changes

  const clearFilters = () => {
    setFilterProjectCode(''); setFilterVendor(''); setFilterStatusCategory('');
    setFilterPoStatus(''); setFilterArrivalDate(''); setFilterItemName('');
    setSearchInput(''); setSearch(''); setPage(1);
  };
  const hasFilters = filterProjectCode || filterVendor || filterStatusCategory || filterPoStatus || filterArrivalDate || search || filterItemName;

  // ─── Sort ────────────────────────────────────────────────────────────────
  const handleSort = (col) => {
    setDisplayPage(1);
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filteredRows = useMemo(() => {
    if (!filterItemName) return rows;
    const q = filterItemName.toLowerCase();
    return rows.filter(r => r.itemName?.toLowerCase().includes(q));
  }, [rows, filterItemName]);

  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      let av = a[sortCol] ?? '';
      let bv = b[sortCol] ?? '';
      if (NUMERIC_COLS.has(sortCol)) {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filteredRows, sortCol, sortDir]);

  // ─── Stage auto-note (computed, not stored) ────────────────────────────
  const STAGE_PCTS = ['0%', '20%', '40%', '60%', '80%', '100%'];
  const STAGE_NOTE_LABELS = {
    logDrawing:    'DRAWING',
    logMachining:  'MACHINING',
    logAssembly:   'ASSEMBLY',
    logFinishing:  'FINISHING',
    logQcChecking: 'QC CHECKING',
    logPacking:    'PACKING',
  };
  const stageAutoNote = (row) =>
    STAGE_COLS.map(s => `${STAGE_NOTE_LABELS[s.key]} - ${STAGE_PCTS[row[s.key]] || '0%'}`).join('\n');

  const displayTotalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () => sortedRows.slice((displayPage - 1) * PAGE_SIZE, displayPage * PAGE_SIZE),
    [sortedRows, displayPage]
  );

  // ─── Inline edit ─────────────────────────────────────────────────────────
  const getKey = (row, idx) => `${row.orderId}_${row.productId}_${idx}`;

  const openEdit = (row, key) => {
    if (savingRow) return; // don't open new row while current save is in-flight
    setEditingKey(key);
    setEditForm({ ...row, packingListQty: 0 }); // always start packing batch at 0
    setRowError('');
    setIsDirty(false);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingKey(null); setEditForm({}); setRowError(''); setIsDirty(false);
  };

  const setF = (key) => (val) => {
    setEditForm(f => ({ ...f, [key]: val }));
    setIsDirty(true);
  };

  const showError = (msg) => { setRowError(msg); if (msg) setToast({ type: 'error', msg }); };

  const handleSave = async (e) => {
    e?.stopPropagation?.();
    if (!isDirty) { setEditingKey(null); setEditForm({}); setRowError(''); return; }
    const batchQty    = Number(editForm.packingListQty ?? 0);
    const balance     = editForm.balanceQuantity ?? 0;
    const newPoQty    = Number(editForm.poQuantity ?? 0);
    const alreadyShipped = editForm.shippedQuantity ?? 0;

    // Validate: PO QTY must not be less than already-shipped qty
    if (newPoQty < alreadyShipped) {
      showError(`PO QTY (${newPoQty}) cannot be less than already shipped (${alreadyShipped})`);
      return;
    }
    // Validate: packing batch must not exceed current balance
    if (batchQty > balance) {
      showError(`Packing qty (${batchQty}) exceeds available balance (${balance})`);
      return;
    }
    setSavingRow(true); setRowError('');
    try {
      const url = `${backendServer}/api/logistic/${editForm.orderId}/${editForm.productId}`;
      const r = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectCode:         editForm.projectCode,
          poQuantity:          newPoQty,
          cargoReadyDate:      editForm.cargoReadyDate,
          shipmentDate:        editForm.shipmentDate,
          logDrawing:          editForm.logDrawing,
          logMachining:        editForm.logMachining,
          logAssembly:         editForm.logAssembly,
          logFinishing:        editForm.logFinishing,
          logQcChecking:       editForm.logQcChecking,
          logPacking:          editForm.logPacking,
          packingList:         batchQty,
          location:            editForm.location,
          containerNumber:     editForm.containerNumber,
          statusCategory:      editForm.statusCategory,
          expectedShipDate:    editForm.expectedShipDate,
          expectedArrivalDate: editForm.expectedArrivalDate,
          remark:              editForm.remark,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Save failed');
      // Always use backend-returned quantities — never fall back to stale editForm/row values
      const updatedPoQty      = data.poQuantity      ?? editForm.poQuantity;
      const updatedShipped    = data.shippedQuantity ?? 0;
      const updatedBalance    = data.balanceQuantity ?? Math.max(0, updatedPoQty - updatedShipped);
      setRows(prev => prev.map(row =>
        row.orderId === editForm.orderId && row.productId === editForm.productId
          && row.poProductId === editForm.poProductId
          ? {
              ...row,
              ...editForm,
              poQuantity:      updatedPoQty,
              shippedQuantity: updatedShipped,
              balanceQuantity: updatedBalance,
              ...(batchQty > 0 ? { packingList: batchQty } : {}),
              ...(data.dateInspected ? { dateInspected: data.dateInspected } : {}),
            }
          : row
      ));
      setIsDirty(false);
      setEditingKey(null); setEditForm({});
      setToast({ type: 'success', msg: 'Saved' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      // Keep edit open so user can retry or cancel
      showError(err.message);
      showError(`Save failed: ${err.message}`);
    }
    finally { setSavingRow(false); }
  };

  // Keep autoSaveRef pointing to latest handleSave (after definition to avoid TDZ)
  autoSaveRef.current = handleSave;

  // ─── Sort header helper ───────────────────────────────────────────────────
  const thCls = (active) =>
    `px-2 py-2.5 text-left font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none transition-colors ${
      active ? 'bg-gray-100' : 'hover:bg-gray-100'
    }`;

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-300 inline ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-[#005670] inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 text-[#005670] inline ml-0.5" />;
  };

  // ─── Export ───────────────────────────────────────────────────────────────
  const STAGE_LABEL = v => ({ 0:'0%',1:'20%',2:'40%',3:'60%',4:'80%',5:'100%' }[v??0]??'0%');

  const openExportModal = async () => {
    try {
      const r = await fetch(`${backendServer}/api/logistic/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) { const d = await r.json(); setExportClients(d.clients || []); }
    } catch { /* ignore */ }
    setExportSelected(new Set()); setExportClientSearch(''); setShowExportModal(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await fetch(`${backendServer}/api/logistic?${new URLSearchParams({ limit: '10000' })}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Fetch failed');
      let data = (await r.json()).data || [];
      if (exportSelected.size > 0) data = data.filter(row => exportSelected.has(row.clientName));

      const headers = [
        'PO Number','Project Code','Unit #','Client','Item Name','SKU','Vendor',
        'PO Qty','Shipped','Balance','Unit Price','Total Price',
        'Drawing','Machining','Assembly','Finishing','QC Checking','Packing',
        'Status','Cargo Ready','Shipment Date','Exp. Ship Date','Exp. Arrival Date',
        'Container #','Packing List','Location','Remark',
      ];
      const wsData = [headers, ...data.map(row => [
        row.poNumber||'', row.projectCode||'', row.unitNumber||'', row.clientName||'',
        row.itemName||'', row.skuNo||'', row.vendor||'',
        row.poQuantity??0, row.shippedQuantity??0, row.balanceQuantity??0,
        row.unitPrice??0, row.totalPrice??0,
        STAGE_LABEL(row.logDrawing), STAGE_LABEL(row.logMachining), STAGE_LABEL(row.logAssembly),
        STAGE_LABEL(row.logFinishing), STAGE_LABEL(row.logQcChecking), STAGE_LABEL(row.logPacking),
        row.statusCategory||'', row.cargoReadyDate||'', row.shipmentDate||'',
        row.expectedShipDate||'', row.expectedArrivalDate||'',
        row.containerNumber||'', row.packingList||'', row.location||'', row.remark||'',
      ])];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        {wch:18},{wch:14},{wch:8},{wch:20},{wch:28},{wch:22},{wch:22},
        {wch:8},{wch:8},{wch:8},{wch:10},{wch:12},
        {wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:10},
        {wch:16},{wch:14},{wch:14},{wch:14},{wch:16},{wch:18},{wch:16},{wch:16},{wch:24},
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Logistic Tracker');
      const clientPart = exportSelected.size===1
        ? `_${[...exportSelected][0].replace(/[^a-zA-Z0-9]/g,'-')}`
        : exportSelected.size>1 ? `_${exportSelected.size}-clients` : '_All';
      XLSX.writeFile(wb, `Logistic-Tracker${clientPart}_${new Date().toISOString().slice(0,10)}.xlsx`);
      setShowExportModal(false);
    } catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* ── Toast notification ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logistic Order Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${sortedRows.length} entries · Click a row to edit, click outside to save`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openExportModal} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={fetchRows} className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter className="w-4 h-4" /> Filters
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search item, PO#, vendor…" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30" />
          </div>
          <input type="text" placeholder="Item Name" value={filterItemName} onChange={e => setFilterItemName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30" />
          <input type="text" placeholder="Project Code" value={filterProjectCode} onChange={e => setFilterProjectCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30" />
          <input type="text" placeholder="Vendor" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30" />
          <select value={filterStatusCategory} onChange={e => setFilterStatusCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 bg-white">
            <option value="">All Status Categories</option>
            {statusCategories.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPoStatus} onChange={e => setFilterPoStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 bg-white">
            <option value="">All PO Statuses</option>
            {poStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Expected Arrival:</label>
          <input type="date" value={filterArrivalDate} onChange={e => setFilterArrivalDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#005670]" /> Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            {hasFilters ? 'No entries match the current filters.' : 'No logistic entries found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {/* Read-only sortable columns */}
                  <th onClick={() => handleSort('poNumber')}     className={thCls(sortCol==='poNumber')     + ' text-gray-600'}>PO# <SortIcon col="poNumber" /></th>
                  <th onClick={() => handleSort('poStatus')}     className={thCls(sortCol==='poStatus')     + ' text-gray-600'}>PO Status <SortIcon col="poStatus" /></th>
                  <th onClick={() => handleSort('unitNumber')}   className={thCls(sortCol==='unitNumber')   + ' text-gray-600'}>Unit # <SortIcon col="unitNumber" /></th>
                  <th onClick={() => handleSort('itemName')}     className={thCls(sortCol==='itemName')     + ' text-gray-600'}>Item Name <SortIcon col="itemName" /></th>
                  <th onClick={() => handleSort('skuNo')}        className={thCls(sortCol==='skuNo')        + ' text-gray-600'}>SKU <SortIcon col="skuNo" /></th>
                  <th onClick={() => handleSort('vendor')}       className={thCls(sortCol==='vendor')       + ' text-gray-600'}>Vendor <SortIcon col="vendor" /></th>
                  <th onClick={() => handleSort('poQuantity')}   className={thCls(sortCol==='poQuantity')   + ' text-gray-600'}>PO Qty <SortIcon col="poQuantity" /></th>
                  <th onClick={() => handleSort('shippedQuantity')} className={thCls(sortCol==='shippedQuantity') + ' text-gray-600'}>Shipped <SortIcon col="shippedQuantity" /></th>
                  <th onClick={() => handleSort('balanceQuantity')} className={thCls(sortCol==='balanceQuantity') + ' text-gray-600'}>Balance <SortIcon col="balanceQuantity" /></th>
                  {/* Editable sortable columns */}
                  <th onClick={() => handleSort('projectCode')}      className={thCls(sortCol==='projectCode')      + ' text-[#005670]'}>Project Code <SortIcon col="projectCode" /></th>
                  {/* Location — read-only, still sortable */}
                  <th onClick={() => handleSort('location')}         className={thCls(sortCol==='location')         + ' text-gray-600'}>Location <SortIcon col="location" /></th>
                  {/* Stage columns */}
                  {STAGE_COLS.map(c => (
                    <th key={c.key} onClick={() => handleSort(c.key)} className={thCls(sortCol===c.key) + ' text-center text-[#005670]'}>
                      {c.label} <SortIcon col={c.key} />
                    </th>
                  ))}
                  <th onClick={() => handleSort('statusCategory')}      className={thCls(sortCol==='statusCategory')      + ' text-[#005670]'}>Status <SortIcon col="statusCategory" /></th>
                  <th onClick={() => handleSort('cargoReadyDate')}      className={thCls(sortCol==='cargoReadyDate')      + ' text-[#005670]'}>Cargo Ready <SortIcon col="cargoReadyDate" /></th>
                  <th onClick={() => handleSort('shipmentDate')}        className={thCls(sortCol==='shipmentDate')        + ' text-[#005670]'}>Ship Date <SortIcon col="shipmentDate" /></th>
                  <th onClick={() => handleSort('expectedShipDate')}    className={thCls(sortCol==='expectedShipDate')    + ' text-[#005670]'}>Exp. Ship <SortIcon col="expectedShipDate" /></th>
                  <th onClick={() => handleSort('expectedArrivalDate')} className={thCls(sortCol==='expectedArrivalDate') + ' text-[#005670]'}>Exp. Arrival <SortIcon col="expectedArrivalDate" /></th>
                  <th onClick={() => handleSort('containerNumber')}     className={thCls(sortCol==='containerNumber')     + ' text-[#005670]'}>Container # <SortIcon col="containerNumber" /></th>
                  <th onClick={() => handleSort('packingList')}         className={thCls(sortCol==='packingList')         + ' text-[#005670]'}>Packing List <SortIcon col="packingList" /></th>
                  <th onClick={() => handleSort('remark')}              className={thCls(sortCol==='remark')              + ' text-[#005670]'}>Remark <SortIcon col="remark" /></th>
                  {/* Actions */}
                  <th className="px-2 py-2.5 text-center font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
                {/* Stage legend row */}
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <td colSpan={10} />
                  <td className="px-2 pb-1.5 text-[10px] text-[#005670]/60 italic">editable ↓</td>
                  <td colSpan={6} className="pb-1.5">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {Object.entries(STAGE_COLORS).map(([k, v]) => (
                        <span key={k} style={{ background: v.bg, color: v.text }} className="px-1 py-0.5 rounded text-[10px] font-bold">{k}={v.label}</span>
                      ))}
                    </div>
                  </td>
                  <td colSpan={9} />
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, idx) => {
                  const key       = getKey(row, idx);
                  const isEditing = editingKey === key;
                  const readOnly  = !!row._readOnly;

                  return (
                    <tr
                      key={key}
                      ref={isEditing ? editRowRef : undefined}
                      onClick={!isEditing && !readOnly ? () => openEdit(row, key) : undefined}
                      className={`border-b transition-colors ${
                        isEditing
                          ? 'bg-[#005670]/5 border-[#005670]/20'
                          : readOnly
                            ? 'border-gray-100 bg-gray-50/40 opacity-70'
                            : 'border-gray-100 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {/* ── Read-only cells ── */}
                      <td className="px-2 py-2 font-mono text-gray-700 whitespace-nowrap">{row.poNumber || '—'}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {row.poStatus ? <PoStatusBadge status={row.poStatus} /> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{row.unitNumber || '—'}</td>
                      <td className="px-2 py-2 max-w-[220px]">
                        <div className="font-medium text-gray-800 truncate" title={row.itemName || ''}>{row.itemName || '—'}</div>
                      </td>
                      <td className="px-2 py-2 max-w-[100px]">
                        <div className="text-gray-500 font-mono text-xs truncate">{row.skuNo || '—'}</div>
                      </td>
                      <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{row.vendor || '—'}</td>
                      <td className="px-2 py-2 text-center font-medium text-gray-700">
                        {isEditing
                          ? <input type="number" min="0" value={editForm.poQuantity || ''}
                              onChange={e => {
                                const raw = e.target.value;
                                setF('poQuantity')(raw === '' ? '' : parseInt(raw, 10) || 0);
                              }}
                              onClick={e => e.stopPropagation()}
                              className={inputCls + ' w-[70px] text-center'} />
                          : row.poQuantity}
                      </td>
                      <td className="px-2 py-2 text-center text-green-700 font-medium">{row.shippedQuantity}</td>
                      <td className="px-2 py-2 text-center text-orange-600 font-medium">{row.balanceQuantity}</td>

                      {/* ── Project Code ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="text" value={editForm.projectCode ?? ''} placeholder="Project Code"
                              onChange={e => setF('projectCode')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[100px]'} />
                          : <span className="text-gray-700">{row.projectCode || '—'}</span>}
                      </td>

                      {/* ── Location ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="text" value={editForm.location ?? ''} placeholder="Location"
                              onChange={e => setF('location')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[90px]'} />
                          : <span className="text-gray-600">{row.location || '—'}</span>}
                      </td>

                      {/* ── Stage cells ── */}
                      {STAGE_COLS.map(c => (
                        <td key={c.key} className="px-1.5 py-2 text-center">
                          {isEditing
                            ? <StageCell value={editForm[c.key]} onChange={setF(c.key)} />
                            : <StageBadge value={row[c.key]} />}
                        </td>
                      ))}

                      {/* ── Status Category ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <select value={editForm.statusCategory ?? ''}
                              onChange={e => setF('statusCategory')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[120px]'}>
                              <option value="">—</option>
                              {statusCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          : row.statusCategory
                            ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{row.statusCategory}</span>
                            : <span className="text-gray-300">—</span>}
                      </td>

                      {/* ── Cargo Ready Date ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="date" value={editForm.cargoReadyDate ?? ''}
                              onChange={e => setF('cargoReadyDate')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[130px]'} />
                          : <span className="text-gray-600">{row.cargoReadyDate || '—'}</span>}
                      </td>

                      {/* ── Shipment Date ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="date" value={editForm.shipmentDate ?? ''}
                              onChange={e => setF('shipmentDate')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[130px]'} />
                          : <span className="text-gray-600">{row.shipmentDate || '—'}</span>}
                      </td>

                      {/* ── Expected Ship Date ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="date" value={editForm.expectedShipDate ?? ''}
                              onChange={e => setF('expectedShipDate')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[130px]'} />
                          : <span className="text-gray-600">{row.expectedShipDate || '—'}</span>}
                      </td>

                      {/* ── Expected Arrival Date ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="date" value={editForm.expectedArrivalDate ?? ''}
                              onChange={e => setF('expectedArrivalDate')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[130px]'} />
                          : <span className="text-gray-600">{row.expectedArrivalDate || '—'}</span>}
                      </td>

                      {/* ── Container # ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <input type="text" value={editForm.containerNumber ?? ''} placeholder="Container #"
                              onChange={e => setF('containerNumber')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[110px] font-mono'} />
                          : <span className="font-mono text-gray-600">{row.containerNumber || '—'}</span>}
                      </td>

                      {/* ── Packing List ── */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {isEditing
                          ? <div onClick={e => e.stopPropagation()}>
                              <input type="number" min="0" max={editForm.balanceQuantity ?? undefined}
                                value={editForm.packingListQty || ''}
                                placeholder="0"
                                onChange={e => {
                                  const raw = e.target.value;
                                  const v = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                                  setF('packingListQty')(v);
                                  if (v > (editForm.balanceQuantity ?? Infinity)) {
                                    showError(`Packing qty exceeds balance (${editForm.balanceQuantity ?? 0})`);
                                  } else {
                                    setRowError('');
                                  }
                                }}
                                className={inputCls + ' w-[80px] text-center'} />
                              <div className="text-xs text-gray-400 mt-0.5 text-center">of {editForm.balanceQuantity ?? 0}</div>
                            </div>
                          : <span className="text-gray-600">{row.packingList > 0 ? row.packingList : '—'}</span>}
                      </td>

                      {/* ── Remark ── */}
                      <td className="px-2 py-2">
                        {isEditing
                          ? <input type="text" value={editForm.remark ?? ''} placeholder="Additional notes..."
                              onChange={e => setF('remark')(e.target.value)} onClick={e => e.stopPropagation()}
                              className={inputCls + ' min-w-[150px]'} />
                          : <div className="max-w-[220px]">
                              <div
                                className="text-[9px] text-[#005670]/70 font-mono leading-tight truncate"
                                title={stageAutoNote(row)}
                              >
                                {STAGE_COLS.map(s => `${STAGE_NOTE_LABELS[s.key].replace('QC CHECKING','QC').split(' ')[0]}: ${STAGE_PCTS[row[s.key]??0]}`).join(' | ')}
                              </div>
                              {row.remark && <span className="text-gray-500 block text-xs mt-0.5 truncate">{row.remark}</span>}
                            </div>}
                      </td>

                      {/* ── Actions ── */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5">
                              {savingRow
                                ? <Loader2 className="w-4 h-4 animate-spin text-[#005670]" title="Saving..." />
                                : isDirty
                                  ? <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" title="Unsaved changes" />
                                  : null}
                              <button
                                onClick={cancelEdit}
                                disabled={savingRow}
                                className="px-2 py-0.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                            <p className="text-[9px] text-gray-300 leading-tight">click outside to save</p>
                          </div>
                        ) : readOnly ? (
                          <Lock className="w-3 h-3 text-gray-300 mx-auto" title="Linked to PO — no matching CPM product" />
                        ) : (
                          <Pencil className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && sortedRows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {sortedRows.length} entries · page {displayPage} of {displayTotalPages}
          </p>
          {displayTotalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDisplayPage(p => Math.max(1, p - 1))}
                disabled={displayPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: displayTotalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === displayTotalPages || Math.abs(p - displayPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setDisplayPage(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        p === displayPage ? 'bg-[#005670] text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }
              <button
                onClick={() => setDisplayPage(p => Math.min(displayTotalPages, p + 1))}
                disabled={displayPage === displayTotalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Export Modal ─────────────────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Export Excel</h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Client {exportSelected.size > 0 && <span className="ml-2 text-xs text-[#005670] font-semibold">{exportSelected.size} selected</span>}
                </label>
                <div className="flex gap-3 text-xs">
                  <button type="button" onClick={() => setExportSelected(new Set(exportClients))} className="text-[#005670] hover:underline">Select all</button>
                  <button type="button" onClick={() => setExportSelected(new Set())} className="text-gray-400 hover:underline">Clear</button>
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={exportClientSearch} onChange={e => setExportClientSearch(e.target.value)} placeholder="Search client…"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/20" />
              </div>
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200 mb-1">
                <input type="checkbox" checked={exportSelected.size===0} onChange={() => setExportSelected(new Set())} className="accent-[#005670]" />
                <span className="text-sm font-medium text-gray-700">All Clients</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {exportClients
                  .filter(c => !exportClientSearch || c.toLowerCase().includes(exportClientSearch.toLowerCase()))
                  .map(c => (
                    <label key={c} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={exportSelected.has(c)}
                        onChange={() => setExportSelected(prev => { const n=new Set(prev); n.has(c)?n.delete(c):n.add(c); return n; })}
                        className="accent-[#005670]" />
                      <span className="text-sm text-gray-700">{c}</span>
                    </label>
                  ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {exportSelected.size===0?'Exporting all clients':`Exporting ${exportSelected.size} client(s)`} — all columns included.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-2 px-5 py-2 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors disabled:opacity-60">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Generating…' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticOrderTracker;
