// pages/LogisticOrderTracker.jsx
// Logistic Order Tracker — Developer Order (No Proposal) line-item list view
import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Filter, X, ChevronRight, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { backendServer } from '../utils/info';
import LogisticOrderDetail from './LogisticOrderDetail';

// ─── Production stage legend ─────────────────────────────────────────────────
// Legend 0-5 → color per spec
const STAGE_COLORS = {
  0: { bg: '#FF0000', text: '#fff', label: '0%' },
  1: { bg: '#FFE599', text: '#333', label: '20%' },
  2: { bg: '#FFFF00', text: '#333', label: '40%' },
  3: { bg: '#D9EAD3', text: '#333', label: '60%' },
  4: { bg: '#B6D7A8', text: '#333', label: '80%' },
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

const STAGE_COLS = [
  { key: 'logDrawing',    label: 'Drawing' },
  { key: 'logMachining',  label: 'Machining' },
  { key: 'logAssembly',   label: 'Assembly' },
  { key: 'logFinishing',  label: 'Finishing' },
  { key: 'logQcChecking', label: 'QC' },
  { key: 'logPacking',    label: 'Packing' },
];

const PAGE_SIZE = 50;

// ─── Component ───────────────────────────────────────────────────────────────
const LogisticOrderTracker = () => {
  const [rows, setRows]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedEntry, setSelected]  = useState(null);
  const [statusCategories, setStatusCategories] = useState([]);

  // Filters (all server-side)
  const [filterProjectCode,     setFilterProjectCode]     = useState('');
  const [filterVendor,          setFilterVendor]          = useState('');
  const [filterStatusCategory,  setFilterStatusCategory]  = useState('');
  const [filterArrivalDate,     setFilterArrivalDate]     = useState('');
  const [search,                setSearch]                = useState('');
  const [searchInput,           setSearchInput]           = useState(''); // debounced

  const token = localStorage.getItem('token');

  // ─── Export state ─────────────────────────────────────────────────────────
  const [showExportModal, setShowExportModal]   = useState(false);
  const [exportClients, setExportClients]       = useState([]); // all distinct clients
  const [exportSelected, setExportSelected]     = useState(new Set()); // empty = all
  const [exportClientSearch, setExportClientSearch] = useState('');
  const [exporting, setExporting]               = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const r = await fetch(`${backendServer}/api/logistic/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setStatusCategories(d.statusCategories || []);
      }
    } catch { /* ignore */ }
  }, [token]);

  // Debounce search input → update `search` after 400ms pause
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [search, filterProjectCode, filterVendor, filterStatusCategory, filterArrivalDate]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search)               params.set('search',             search);
      if (filterProjectCode)    params.set('projectCode',        filterProjectCode);
      if (filterVendor)         params.set('vendor',             filterVendor);
      if (filterStatusCategory) params.set('statusCategory',     filterStatusCategory);
      if (filterArrivalDate)    params.set('expectedArrivalDate', filterArrivalDate);
      params.set('page',  String(page));
      params.set('limit', String(PAGE_SIZE));

      const r = await fetch(`${backendServer}/api/logistic?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error((await r.json()).message || 'Fetch failed');
      const d = await r.json();
      setRows(d.data || []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, filterProjectCode, filterVendor, filterStatusCategory, filterArrivalDate, page]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { fetchRows(); },  [fetchRows]);

  const clearFilters = () => {
    setFilterProjectCode('');
    setFilterVendor('');
    setFilterStatusCategory('');
    setFilterArrivalDate('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const hasFilters = filterProjectCode || filterVendor || filterStatusCategory || filterArrivalDate || search;
  const visible = rows; // all filtering is now server-side

  // ─── Export helpers ───────────────────────────────────────────────────────
  const STAGE_LABEL = (v) => ({ 0:'0%', 1:'20%', 2:'40%', 3:'60%', 4:'80%', 5:'100%' }[v ?? 0] ?? '0%');

  const openExportModal = async () => {
    try {
      const r = await fetch(`${backendServer}/api/logistic/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setExportClients(d.clients || []);
      }
    } catch { /* ignore */ }
    setExportSelected(new Set());
    setExportClientSearch('');
    setShowExportModal(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ limit: '10000' });
      const r = await fetch(`${backendServer}/api/logistic?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Fetch failed');
      const d = await r.json();
      let data = d.data || [];

      // Filter by selected clients (empty set = all)
      if (exportSelected.size > 0) {
        data = data.filter(row => exportSelected.has(row.clientName));
      }

      // Build worksheet rows
      const headers = [
        'PO Number', 'Project Code', 'Unit #', 'Client', 'Item Name', 'SKU',
        'Vendor', 'PO Qty', 'Shipped', 'Balance', 'Unit Price', 'Total Price',
        'Drawing', 'Machining', 'Assembly', 'Finishing', 'QC Checking', 'Packing',
        'Status', 'Cargo Ready Date', 'Shipment Date', 'Exp. Ship Date', 'Exp. Arrival Date',
        'Container #', 'Packing List', 'Location (Room)', 'Remark',
      ];

      const wsData = [
        headers,
        ...data.map(row => [
          row.poNumber          || '',
          row.projectCode       || '',
          row.unitNumber        || '',
          row.clientName        || '',
          row.itemName          || '',
          row.skuNo             || '',
          row.vendor            || '',
          row.poQuantity        ?? 0,
          row.shippedQuantity   ?? 0,
          row.balanceQuantity   ?? 0,
          row.unitPrice         ?? 0,
          row.totalPrice        ?? 0,
          STAGE_LABEL(row.logDrawing),
          STAGE_LABEL(row.logMachining),
          STAGE_LABEL(row.logAssembly),
          STAGE_LABEL(row.logFinishing),
          STAGE_LABEL(row.logQcChecking),
          STAGE_LABEL(row.logPacking),
          row.statusCategory    || '',
          row.cargoReadyDate    || '',
          row.shipmentDate      || '',
          row.expectedShipDate  || '',
          row.expectedArrivalDate || '',
          row.containerNumber   || '',
          row.packingList       || '',
          row.location          || '',
          row.remark            || '',
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column widths
      ws['!cols'] = [
        { wch: 18 }, { wch: 14 }, { wch: 8  }, { wch: 20 }, { wch: 28 }, { wch: 22 },
        { wch: 22 }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 10 }, { wch: 12 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
        { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
        { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 24 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Logistic Tracker');

      const clientPart = exportSelected.size === 1
        ? `_${[...exportSelected][0].replace(/[^a-zA-Z0-9]/g, '-')}`
        : exportSelected.size > 1 ? `_${exportSelected.size}-clients` : '_All';
      const datePart   = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Logistic-Tracker${clientPart}_${datePart}.xlsx`);

      setShowExportModal(false);
    } catch (e) {
      alert('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  // ─── Detail view ────────────────────────────────────────────────────────────
  if (selectedEntry) {
    return (
      <LogisticOrderDetail
        entry={selectedEntry}
        statusCategories={statusCategories}
        onBack={() => setSelected(null)}
        onSaved={() => { setSelected(null); fetchRows(); }}
      />
    );
  }

  // ─── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logistic Order Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Developer Orders — per line item</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openExportModal}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={fetchRows}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search item, PO#, vendor…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
            />
          </div>
          <input
            type="text"
            placeholder="Project Code"
            value={filterProjectCode}
            onChange={e => setFilterProjectCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
          />
          <input
            type="text"
            placeholder="Vendor"
            value={filterVendor}
            onChange={e => setFilterVendor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
          />
          <select
            value={filterStatusCategory}
            onChange={e => setFilterStatusCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 bg-white"
          >
            <option value="">All Status Categories</option>
            {statusCategories.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Expected Arrival:</label>
          <input
            type="date"
            value={filterArrivalDate}
            onChange={e => setFilterArrivalDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#005670]" />
            Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            {hasFilters ? 'No entries match the current filters.' : 'No logistic entries found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    { label: 'PO#',          cls: 'text-left'   },
                    { label: 'Project Code', cls: 'text-left'   },
                    { label: 'Unit #',       cls: 'text-left'   },
                    { label: 'Item Name',    cls: 'text-left'   },
                    { label: 'Vendor',       cls: 'text-left'   },
                    { label: 'PO Qty',       cls: 'text-center' },
                    { label: 'Shipped',      cls: 'text-center' },
                    { label: 'Balance',      cls: 'text-center' },
                    ...STAGE_COLS.map(c => ({ label: c.label, cls: 'text-center' })),
                    { label: 'Status',       cls: 'text-left'   },
                    { label: 'Exp. Arrival', cls: 'text-left'   },
                    { label: 'Container #',  cls: 'text-left'   },
                    { label: '',             cls: ''             },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap ${h.cls}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, idx) => (
                  <tr
                    key={`${row.orderId}_${row.productId}_${idx}`}
                    onClick={() => setSelected(row)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-700 whitespace-nowrap">{row.poNumber || '—'}</td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-gray-700">{row.projectCode || '—'}</td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-gray-600">{row.unitNumber || '—'}</td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <div className="text-xs font-medium text-gray-800 truncate">{row.itemName || '—'}</div>
                      {row.location && <div className="text-xs text-gray-400 truncate">{row.location}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-gray-600">{row.vendor || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-center font-medium text-gray-700">{row.poQuantity}</td>
                    <td className="px-3 py-2.5 text-xs text-center text-green-700 font-medium">{row.shippedQuantity}</td>
                    <td className="px-3 py-2.5 text-xs text-center text-orange-600 font-medium">{row.balanceQuantity}</td>
                    {STAGE_COLS.map(c => (
                      <td key={c.key} className="px-2 py-2.5 text-center">
                        <StageBadge value={row[c.key]} />
                      </td>
                    ))}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.statusCategory
                        ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{row.statusCategory}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-gray-600">{row.expectedArrivalDate || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 text-xs font-mono">{row.containerNumber || '—'}</td>
                    <td className="px-2 py-2.5 text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-xs text-gray-400">
            {total === 0 ? 'No entries' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} entries`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
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
                  Client
                  {exportSelected.size > 0 && (
                    <span className="ml-2 text-xs text-[#005670] font-semibold">
                      {exportSelected.size} selected
                    </span>
                  )}
                </label>
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setExportSelected(new Set(exportClients))}
                    className="text-[#005670] hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportSelected(new Set())}
                    className="text-gray-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={exportClientSearch}
                  onChange={e => setExportClientSearch(e.target.value)}
                  placeholder="Search client…"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                />
              </div>

              {/* All Clients option */}
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200 mb-1">
                <input
                  type="checkbox"
                  checked={exportSelected.size === 0}
                  onChange={() => setExportSelected(new Set())}
                  className="accent-[#005670]"
                />
                <span className="text-sm font-medium text-gray-700">All Clients</span>
              </label>

              {/* Scrollable client list */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {exportClients
                  .filter(c => !exportClientSearch || c.toLowerCase().includes(exportClientSearch.toLowerCase()))
                  .map(c => (
                    <label key={c} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={exportSelected.has(c)}
                        onChange={() => {
                          setExportSelected(prev => {
                            const next = new Set(prev);
                            next.has(c) ? next.delete(c) : next.add(c);
                            return next;
                          });
                        }}
                        className="accent-[#005670]"
                      />
                      <span className="text-sm text-gray-700">{c}</span>
                    </label>
                  ))}
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {exportSelected.size === 0 ? 'Exporting all clients' : `Exporting ${exportSelected.size} client(s)`} — all visible columns included.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors disabled:opacity-60"
              >
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
