// pages/AuditLogPage.jsx
// Full audit log viewer for an order.
// Route: /admin/orders/:orderId/audit-log
//
// Features:
//  - Timeline view: grouped by date, sorted newest-first
//  - Filter by product, by action type, by user
//  - Per-entry: expandable field diff (old → new)
//  - Rollback button per entry (with confirmation modal)
//  - Stats bar at top: total events, adds, edits, removes

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, RotateCcw, ChevronDown, ChevronUp,
  Plus, Trash2, Edit2, ArrowRightLeft, Activity,
  Package, User, Clock, Filter, Search, X, AlertTriangle,
  CheckCircle, TrendingUp, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { backendServer } from '../utils/info';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  product_added:       { label: 'Product Added',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: Plus },
  product_removed:     { label: 'Product Removed', color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-500',     Icon: Trash2 },
  product_edited:      { label: 'Product Edited',  color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    dot: 'bg-blue-500',    Icon: Edit2 },
  order_field_changed: { label: 'Order Updated',   color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-500',   Icon: Activity },
  rollback:            { label: 'Rollback',         color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  dot: 'bg-purple-500',  Icon: RotateCcw },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatRelative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(iso);
};

const formatValue = (v) => {
  if (v === null || v === undefined) return <span className="italic text-gray-400">empty</span>;
  if (typeof v === 'boolean') return <span className={v ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{v ? 'Yes' : 'No'}</span>;
  if (typeof v === 'number')  return <span className="font-mono">{v}</span>;
  if (typeof v === 'object')  return <span className="font-mono text-xs text-gray-600">{JSON.stringify(v)}</span>;
  const s = String(v);
  if (!s) return <span className="italic text-gray-400">empty</span>;
  if (s.length > 120) return <span className="font-mono text-xs">{s.slice(0, 120)}…</span>;
  return <span>{s}</span>;
};

const groupByDate = (logs) => {
  const groups = new Map();
  logs.forEach(log => {
    const key = formatDate(log.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(log);
  });
  return groups;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? 0}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

const FieldDiff = ({ change }) => (
  <div className="py-2 border-b border-gray-100 last:border-0">
    <p className="text-xs font-semibold text-gray-500 mb-1.5">{change.label || change.field}</p>
    <div className="flex items-start gap-2">
      <div className="flex-1 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 min-w-0 break-words">
        <span className="text-red-400 font-semibold mr-1">−</span>
        {formatValue(change.oldValue)}
      </div>
      <ArrowRightLeft className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-1.5" />
      <div className="flex-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 min-w-0 break-words">
        <span className="text-emerald-500 font-semibold mr-1">+</span>
        {formatValue(change.newValue)}
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {loading ? 'Rolling back…' : 'Confirm Rollback'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditEntry = ({ entry, onRollback, rollbackLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg  = ACTION_CONFIG[entry.action] || ACTION_CONFIG.product_edited;
  const Icon = cfg.Icon;

  const canRollback = ['product_edited', 'order_field_changed', 'product_added'].includes(entry.action);
  const showChanges = entry.changes?.length > 0 &&
    !(entry.action === 'product_added' || entry.action === 'product_removed');

  return (
    <div className={`relative border rounded-xl overflow-hidden transition-all ${cfg.border} ${cfg.bg}`}>

      {/* ── Header row ── */}
      <div className="flex items-start gap-3 p-4">

        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Action + product name */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>
              {cfg.label}
            </span>
            {entry.productName && (
              <span className="text-sm font-semibold text-gray-800 truncate">
                — {entry.productName}
              </span>
            )}
            {entry.action === 'rollback' && entry.rollbackOf && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                ↩ Rollback
              </span>
            )}
          </div>

          {/* Meta: who + when */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              {entry.performedByName || entry.performedBy?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatTime(entry.createdAt)}
              <span className="ml-1 text-gray-300">·</span>
              <span className="text-gray-400">{formatRelative(entry.createdAt)}</span>
            </span>
          </div>

          {/* Changes summary (collapsed) */}
          {!expanded && entry.changes?.length > 0 && (
            <p className="text-xs text-gray-500 mt-1.5">
              {entry.action === 'product_added'   && '✦ Product added to order'}
              {entry.action === 'product_removed' && '✦ Product removed from order'}
              {showChanges && `${entry.changes.length} field${entry.changes.length > 1 ? 's' : ''} changed: ${entry.changes.map(c => c.label || c.field).slice(0, 3).join(', ')}${entry.changes.length > 3 ? ` +${entry.changes.length - 3} more` : ''}`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canRollback && (
            <button
              onClick={() => onRollback(entry)}
              disabled={rollbackLoading}
              title="Rollback this change"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rollback
            </button>
          )}
          {showChanges && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded: field diffs ── */}
      {expanded && showChanges && (
        <div className="border-t border-gray-200/60 bg-white/70 px-4 py-3">
          {entry.changes.map((change, i) => (
            <FieldDiff key={i} change={change} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AuditLogPage = ({ orderId, clientName, onBack }) => {
  const [logs,         setLogs]         = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [error,        setError]        = useState(null);
  const [pagination,   setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [filterAction,  setFilterAction]  = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');

  // Rollback
  const [rollbackTarget,  setRollbackTarget]  = useState(null); // entry to rollback
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackSuccess, setRollbackSuccess] = useState(null);

  const token = localStorage.getItem('token');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page, limit: 50 });
      if (filterAction)  params.set('action', filterAction);
      if (filterProduct) params.set('productId', filterProduct);

      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/audit-log?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setLogs(prev => append ? [...prev, ...data.data] : data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [orderId, token, filterAction, filterProduct]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/audit-log/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.data);
    } catch (_) {}
  }, [orderId, token]);

  useEffect(() => {
    fetchLogs(1, false);
    fetchStats();
  }, [fetchLogs, fetchStats]);

  // ── Rollback ───────────────────────────────────────────────────────────────
  const handleRollback = async () => {
    if (!rollbackTarget) return;
    setRollbackLoading(true);
    try {
      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/audit-log/${rollbackTarget._id}/rollback`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Rollback failed');
      }
      setRollbackSuccess(`Rollback applied: "${rollbackTarget.productName || 'Order field'}" restored`);
      setRollbackTarget(null);
      // Refresh
      await fetchLogs(1, false);
      await fetchStats();
      setTimeout(() => setRollbackSuccess(null), 4000);
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    } finally {
      setRollbackLoading(false);
    }
  };

  // ── Client-side search filter ──────────────────────────────────────────────
  const filteredLogs = searchQuery.trim()
    ? logs.filter(log => {
        const q = searchQuery.toLowerCase();
        return (
          (log.productName || '').toLowerCase().includes(q) ||
          (log.performedByName || '').toLowerCase().includes(q) ||
          log.changes?.some(c => (c.label || c.field).toLowerCase().includes(q))
        );
      })
    : logs;

  // ── Group by date ──────────────────────────────────────────────────────────
  const grouped = groupByDate(filteredLogs);

  // ── Unique products for filter dropdown ───────────────────────────────────
  const uniqueProducts = [...new Map(
    logs.filter(l => l.productId && l.productName)
        .map(l => [l.productId, { id: l.productId, name: l.productName }])
  ).values()];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#005670] bg-[#005670]/8 hover:bg-[#005670]/15 border border-[#005670]/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Audit Log</h1>
            {clientName && (
              <p className="text-xs text-gray-500">{clientName}</p>
            )}
          </div>
          <button
            onClick={() => fetchLogs(1, false)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* ── Success banner ── */}
        {rollbackSuccess && (
          <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            {rollbackSuccess}
          </div>
        )}

        {/* ── Stats cards ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Events"     value={stats.totalEvents}                     color="bg-gray-100 text-gray-600"     Icon={Activity} />
            <StatCard label="Products Added"   value={stats.byAction?.product_added}         color="bg-emerald-100 text-emerald-600" Icon={Plus} />
            <StatCard label="Products Edited"  value={stats.byAction?.product_edited}        color="bg-blue-100 text-blue-600"     Icon={Edit2} />
            <StatCard label="Products Removed" value={stats.byAction?.product_removed}       color="bg-red-100 text-red-600"       Icon={Trash2} />
          </div>
        )}

        {/* ── Last activity ── */}
        {stats?.lastActivity && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm">
            <TrendingUp className="w-4 h-4 text-[#005670] flex-shrink-0" />
            <span className="text-gray-600">
              Last activity by <strong>{stats.lastActivity.by}</strong>
              {' '}· {formatRelative(stats.lastActivity.at)}
              {' '}· {ACTION_CONFIG[stats.lastActivity.action]?.label}
            </span>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            {(filterAction || filterProduct || searchQuery) && (
              <button
                onClick={() => { setFilterAction(''); setFilterProduct(''); setSearchQuery(''); }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by product, user, or field…"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action filter */}
            <select
              value={filterAction}
              onChange={e => { setFilterAction(e.target.value); fetchLogs(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
            >
              <option value="">All Actions</option>
              {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>

            {/* Product filter */}
            {uniqueProducts.length > 0 && (
              <select
                value={filterProduct}
                onChange={e => { setFilterProduct(e.target.value); fetchLogs(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] max-w-[220px]"
              >
                <option value="">All Products</option>
                {uniqueProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ── Timeline ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => fetchLogs(1)} className="mt-3 text-sm text-red-600 underline">Retry</button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No activity yet</h3>
            <p className="text-sm text-gray-500">Changes to this order will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...grouped.entries()].map(([date, entries]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#005670]" />
                  <span className="text-sm font-bold text-gray-700">{date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{entries.length} event{entries.length > 1 ? 's' : ''}</span>
                </div>

                {/* Entries */}
                <div className="ml-5 border-l-2 border-gray-200 pl-5 space-y-3">
                  {entries.map(entry => (
                    <AuditEntry
                      key={entry._id}
                      entry={entry}
                      onRollback={setRollbackTarget}
                      rollbackLoading={rollbackLoading}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load more */}
            {pagination.page < pagination.totalPages && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => fetchLogs(pagination.page + 1, true)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  {loadingMore ? 'Loading…' : `Load more (${pagination.total - logs.length} remaining)`}
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 py-2">
              Showing {filteredLogs.length} of {pagination.total} events
            </p>
          </div>
        )}
      </div>

      {/* ── Rollback confirmation modal ── */}
      <ConfirmModal
        isOpen={!!rollbackTarget}
        loading={rollbackLoading}
        title="Confirm Rollback"
        message={
          rollbackTarget
            ? `This will restore ${rollbackTarget.changes?.length} field(s) on "${rollbackTarget.productName || 'the order'}" to their previous values. A new audit entry will be created to record this rollback.`
            : ''
        }
        onConfirm={handleRollback}
        onCancel={() => !rollbackLoading && setRollbackTarget(null)}
      />
    </div>
  );
};

export default AuditLogPage;