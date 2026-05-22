// components/AuditLogDrawer.jsx
// Slide-in audit log drawer — embedded in CustomProductManager.
//
// Props:
//   isOpen        {boolean}   — controls visibility
//   onClose       {function}  — called when drawer should close
//   orderId       {string}    — order._id
//   focusProduct  {object|null} — { productId, productName } to pre-filter
//                                Set to null to show full order history
//   onRollbackDone {function} — called after successful rollback so parent can refresh

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, RotateCcw, ChevronDown, ChevronUp,
  Plus, Trash2, Edit2, Activity, ArrowRightLeft,
  User, Clock, RefreshCw, Search, Filter,
  AlertTriangle, CheckCircle, Package, History,
  ArrowLeft,
} from 'lucide-react';
import { backendServer } from '../utils/info';

// ── Design tokens (matching CustomProductManager palette) ─────────────────────
const HDG = '#005670';

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_CFG = {
  product_added:       { label: 'Added',         dot: 'bg-emerald-400', text: 'text-emerald-700', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',   Icon: Plus    },
  product_removed:     { label: 'Removed',       dot: 'bg-red-400',     text: 'text-red-700',     pill: 'bg-red-50 text-red-700 border-red-200',               Icon: Trash2  },
  product_edited:      { label: 'Edited',        dot: 'bg-blue-400',    text: 'text-blue-700',    pill: 'bg-blue-50 text-blue-700 border-blue-200',            Icon: Edit2   },
  order_field_changed: { label: 'Order Updated', dot: 'bg-amber-400',   text: 'text-amber-700',   pill: 'bg-amber-50 text-amber-700 border-amber-200',         Icon: Activity},
  rollback:            { label: 'Rollback',      dot: 'bg-purple-400',  text: 'text-purple-700',  pill: 'bg-purple-50 text-purple-700 border-purple-200',      Icon: RotateCcw},
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit',
});
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
});
const fmtRelative = (iso) => {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return fmtDate(iso);
};

const renderValue = (v) => {
  if (v === null || v === undefined || v === '') return <em className="text-gray-400 not-italic">empty</em>;
  if (typeof v === 'boolean')  return <span className={v ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>{v ? 'Yes' : 'No'}</span>;
  if (typeof v === 'number')   return <span className="font-mono">{v}</span>;
  if (typeof v === 'object')   return <span className="font-mono text-[10px] text-gray-500 break-all">{JSON.stringify(v)}</span>;
  const s = String(v);
  if (s.length > 100) return <span className="text-xs break-words">{s.slice(0, 100)}<span className="text-gray-400">…</span></span>;
  return <span className="break-words">{s}</span>;
};

// Group logs by date string
const groupByDate = (logs) => {
  const map = new Map();
  logs.forEach(l => {
    const key = fmtDate(l.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(l);
  });
  return map;
};

// ── FieldDiff ─────────────────────────────────────────────────────────────────
const FieldDiff = ({ change }) => (
  <div className="mb-2 last:mb-0">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {change.label || change.field}
    </p>
    <div className="flex gap-1.5 items-start">
      <div className="flex-1 px-2 py-1.5 bg-red-50 border border-red-100 rounded text-[11px] text-red-800 min-w-0">
        <span className="text-red-400 font-bold mr-1">−</span>
        {renderValue(change.oldValue)}
      </div>
      <ArrowRightLeft className="w-3 h-3 text-gray-300 flex-shrink-0 mt-1.5" />
      <div className="flex-1 px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-800 min-w-0">
        <span className="text-emerald-500 font-bold mr-1">+</span>
        {renderValue(change.newValue)}
      </div>
    </div>
  </div>
);

// ── Single entry card ─────────────────────────────────────────────────────────
const EntryCard = ({ entry, onRollback, rolling }) => {
  const [open, setOpen] = useState(false);
  const cfg  = ACTION_CFG[entry.action] || ACTION_CFG.product_edited;
  const Icon = cfg.Icon;

  const canRollback    = ['product_edited', 'order_field_changed', 'product_added'].includes(entry.action);
  const hasExpandable  = entry.changes?.some(c =>
    !['product_added', 'product_removed'].includes(entry.action)
  ) && entry.changes?.length > 0;

  const summary = (() => {
    if (entry.action === 'product_added')   return 'Product added to order';
    if (entry.action === 'product_removed') return 'Product removed from order';
    if (!entry.changes?.length)             return null;
    const names = entry.changes.slice(0, 2).map(c => c.label || c.field).join(', ');
    const extra = entry.changes.length > 2 ? ` +${entry.changes.length - 2} more` : '';
    return `${names}${extra}`;
  })();

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={`absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white ${cfg.dot} flex-shrink-0 z-10`} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">

        {/* Header */}
        <div className="flex items-start gap-2.5 px-3.5 py-3">
          <div className="flex-1 min-w-0">
            {/* Action pill + product name */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
              {entry.productName && (
                <span className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">
                  {entry.productName}
                </span>
              )}
            </div>

            {/* Who + when */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-0.5">
                <User className="w-2.5 h-2.5" />
                {entry.performedByName || 'Unknown'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {fmtTime(entry.createdAt)}
              </span>
              <span>·</span>
              <span className="text-gray-300">{fmtRelative(entry.createdAt)}</span>
            </div>

            {/* Summary (collapsed) */}
            {!open && summary && (
              <p className="text-[11px] text-gray-500 mt-1 truncate">{summary}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {canRollback && (
              <button
                onClick={() => onRollback(entry)}
                disabled={rolling}
                title="Rollback this change"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                Undo
              </button>
            )}
            {hasExpandable && (
              <button
                onClick={() => setOpen(o => !o)}
                className="p-1 text-gray-300 hover:text-gray-500 transition-colors rounded"
              >
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded diffs */}
        {open && hasExpandable && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-3.5 py-3">
            {entry.changes.map((c, i) => (
              <FieldDiff key={i} change={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Rollback confirm modal ─────────────────────────────────────────────────────
const RollbackModal = ({ entry, onConfirm, onCancel, loading }) => {
  if (!entry) return null;
  return (
    <div
      className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-4 backdrop-blur-sm rounded-2xl"
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Confirm Rollback</h3>
            <p className="text-xs text-gray-500 mt-1">
              Restore {entry.changes?.length} field(s) on{' '}
              <strong>"{entry.productName || 'order'}"</strong> to previous values?
              <br /><span className="text-gray-400">A rollback entry will be recorded.</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading
              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Rolling back…</>
              : <><RotateCcw className="w-3 h-3" /> Confirm</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Drawer ───────────────────────────────────────────────────────────────
const AuditLogDrawer = ({ isOpen, onClose, orderId, focusProduct, onRollbackDone }) => {
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [pagination,    setPagination]    = useState({ page: 1, totalPages: 1, total: 0 });
  const [filterAction,  setFilterAction]  = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [rollbackEntry, setRollbackEntry] = useState(null);
  const [rolling,       setRolling]       = useState(false);
  const [successMsg,    setSuccessMsg]    = useState('');
  const [stats,         setStats]         = useState(null);
  // track current focus: null = full order, { productId, productName } = filtered
  const [activeFocus,   setActiveFocus]   = useState(null);

  const token       = localStorage.getItem('token');
  const scrollRef   = useRef(null);
  const prevOpenRef = useRef(false);

  // Sync focusProduct prop → internal activeFocus
  useEffect(() => {
    if (isOpen) setActiveFocus(focusProduct || null);
  }, [isOpen, focusProduct]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1, append = false) => {
    if (!orderId) return;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      let url;
      if (activeFocus?.productId) {
        // Product-specific endpoint
        url = `${backendServer}/api/orders/${orderId}/audit-log/product/${activeFocus.productId}`;
      } else {
        const params = new URLSearchParams({ page, limit: 40 });
        if (filterAction) params.set('action', filterAction);
        url = `${backendServer}/api/orders/${orderId}/audit-log?${params}`;
      }

      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (activeFocus?.productId) {
        // product endpoint returns flat array
        setLogs(data.data || []);
        setPagination({ page: 1, totalPages: 1, total: (data.data || []).length });
      } else {
        setLogs(prev => append ? [...prev, ...(data.data || [])] : (data.data || []));
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('[AuditLogDrawer] fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [orderId, token, filterAction, activeFocus]);

  const fetchStats = useCallback(async () => {
    if (!orderId) return;
    try {
      const res  = await fetch(
        `${backendServer}/api/orders/${orderId}/audit-log/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setStats(data.data || null);
    } catch (_) {}
  }, [orderId, token]);

  // Fetch when drawer opens or filters change
  useEffect(() => {
    if (isOpen && (!prevOpenRef.current || true)) {
      fetchLogs(1, false);
      if (!activeFocus) fetchStats();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, fetchLogs, fetchStats, activeFocus, filterAction]);

  // ── Search filter (client-side) ────────────────────────────────────────────
  const filtered = searchQuery.trim()
    ? logs.filter(l => {
        const q = searchQuery.toLowerCase();
        return (
          (l.productName        || '').toLowerCase().includes(q) ||
          (l.performedByName    || '').toLowerCase().includes(q) ||
          l.changes?.some(c => (c.label || c.field || '').toLowerCase().includes(q))
        );
      })
    : logs;

  const grouped = groupByDate(filtered);

  // ── Rollback ───────────────────────────────────────────────────────────────
  const handleRollback = async () => {
    if (!rollbackEntry) return;
    setRolling(true);
    try {
      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/audit-log/${rollbackEntry._id}/rollback`,
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Rollback failed');
      }
      setRollbackEntry(null);
      setSuccessMsg(`✓ Restored: "${rollbackEntry.productName || 'order field'}" rolled back`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchLogs(1, false);
      if (onRollbackDone) onRollbackDone();
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    } finally {
      setRolling(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Backdrop + drawer wrapper
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-[100] flex flex-col bg-gray-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '420px' }}
      >
        {/* Rollback confirm modal (absolute, covers drawer only) */}
        <div className="relative flex-1 flex flex-col min-h-0">
          <RollbackModal
            entry={rollbackEntry}
            onConfirm={handleRollback}
            onCancel={() => !rolling && setRollbackEntry(null)}
            loading={rolling}
          />

          {/* ── Drawer header ── */}
          <div
            className="flex-shrink-0 px-5 py-4 border-b border-gray-200 bg-white"
            style={{ borderTop: `3px solid ${HDG}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: HDG }}>
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {activeFocus ? 'Product History' : 'Change History'}
                  </h2>
                  {activeFocus && (
                    <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                      {activeFocus.productName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {activeFocus && (
                  <button
                    onClick={() => setActiveFocus(null)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    All
                  </button>
                )}
                <button
                  onClick={() => fetchLogs(1, false)}
                  disabled={loading}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats row (only when showing full order) */}
            {!activeFocus && stats && (
              <div className="flex gap-2 mt-3">
                {[
                  { label: 'Total',   val: stats.totalEvents,                   color: 'text-gray-600',    bg: 'bg-gray-100'    },
                  { label: 'Added',   val: stats.byAction?.product_added   || 0, color: 'text-emerald-700', bg: 'bg-emerald-50'  },
                  { label: 'Edited',  val: stats.byAction?.product_edited  || 0, color: 'text-blue-700',    bg: 'bg-blue-50'     },
                  { label: 'Removed', val: stats.byAction?.product_removed || 0, color: 'text-red-700',     bg: 'bg-red-50'      },
                ].map(s => (
                  <div key={s.label} className={`flex-1 ${s.bg} rounded-lg px-2 py-1.5 text-center`}>
                    <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Filters ── */}
          <div className="flex-shrink-0 px-4 py-2.5 bg-white border-b border-gray-100 flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Action filter (only for full order view) */}
            {!activeFocus && (
              <select
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                className="px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-gray-600"
              >
                <option value="">All actions</option>
                <option value="product_added">Added</option>
                <option value="product_removed">Removed</option>
                <option value="product_edited">Edited</option>
                <option value="order_field_changed">Order</option>
                <option value="rollback">Rollback</option>
              </select>
            )}
          </div>

          {/* ── Success banner ── */}
          {successMsg && (
            <div className="flex-shrink-0 mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* ── Timeline ── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-7 h-7 text-gray-300 animate-spin" />
                <p className="text-xs text-gray-400">Loading history…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <History className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">No history yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery ? 'No results match your search.' : 'Changes will appear here after the first save.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {[...grouped.entries()].map(([date, entries]) => (
                  <div key={date}>
                    {/* Date divider */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        {date}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Entries with timeline line */}
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-2.5">
                      {entries.map(entry => (
                        <EntryCard
                          key={entry._id}
                          entry={entry}
                          onRollback={setRollbackEntry}
                          rolling={rolling}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Load more */}
                {!activeFocus && pagination.page < pagination.totalPages && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={() => fetchLogs(pagination.page + 1, true)}
                      disabled={loadingMore}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {loadingMore
                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> Loading…</>
                        : <><ChevronDown className="w-3 h-3" /> Load more ({pagination.total - logs.length} left)</>
                      }
                    </button>
                  </div>
                )}

                <p className="text-center text-[10px] text-gray-300 pb-2">
                  {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                  {pagination.total > filtered.length ? ` · ${pagination.total} total` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditLogDrawer;