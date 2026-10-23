import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2, RefreshCw, AlertTriangle, ArrowRight, Truck, FolderOpen, PackageCheck,
  ClipboardList, Users, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { backendServer } from '../utils/info';
import TeamAttendance from '../components/TeamAttendance';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return fmtMoney(v);
};
const fmtDay = (ymd) => {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const STAGE_COLOR = {
  notStarted: 'bg-gray-300', ordered: 'bg-amber-400', transit: 'bg-blue-500',
  delivered: 'bg-teal-500', installed: 'bg-green-600', issue: 'bg-red-500',
};
const PO_COLOR = { none: 'bg-gray-300', draft: 'bg-gray-500', sent: 'bg-blue-500', confirmed: 'bg-teal-500', paid: 'bg-green-600' };
const LEVEL_STYLE = {
  danger:  { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200' },
  warning: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  info:    { dot: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const collectionLabel = (c) => {
  const s = String(c || '');
  if (/lani/i.test(s)) return { label: 'Lani', cls: 'bg-purple-100 text-purple-700' };
  if (/nalu/i.test(s)) return { label: 'Nalu', cls: 'bg-blue-100 text-blue-700' };
  if (/custom/i.test(s)) return { label: 'Custom', cls: 'bg-amber-100 text-amber-700' };
  return null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Dashboard = ({ onNavigate, allowedPaths = [], canViewAttendance = false }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [presence, setPresence] = useState(null);
  const [arrivalTab, setArrivalTab] = useState('soon');

  const canGo = (path) => !!onNavigate && (allowedPaths.length === 0 || allowedPaths.includes(path));
  const go = (path) => { if (canGo(path)) onNavigate(path); };

  const load = useCallback(async (force = false) => {
    try {
      force ? setRefreshing(true) : setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/dashboard/overview${force ? '?refresh=1' : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load dashboard');
      setData(json);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(), 120000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendServer}/api/activity`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setPresence({ active: d.activeUsers, visits: d.todayVisits }); }
      } catch { /* optional */ }
    };
    fetchPresence();
    const t = setInterval(fetchPresence, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-[#005670]" /></div>;
  }
  if (!data) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">{error || 'No data available'}</p>
        <button onClick={() => load(true)} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#005670] rounded-lg hover:bg-[#004a60]">Try again</button>
      </div>
    );
  }

  const { kpis, attention, pipeline, arriving, overdue, purchasing, projects, recent, includeMoney } = data;
  const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0) || 1;
  const poMax = Math.max(1, ...purchasing.stages.map(s => (includeMoney ? s.amount : s.count) || 0));
  const vendorMax = Math.max(1, ...purchasing.topVendors.map(v => v.amount || 0));
  const arrivalRows = arrivalTab === 'soon' ? arriving : overdue;
  // Same reference day the server uses for "overdue" / "arriving" (Honolulu), so the header and the Arrivals table never disagree
  const [ty, tm, td] = String(data.today).split('-').map(Number);
  const todayLabel = `${new Date(ty, tm - 1, td).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} (Honolulu)`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">{todayLabel} · what needs your attention across projects, logistics and purchasing</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {presence && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg" title="Users active in the last 15 minutes · page visits today">
              <Users className="w-3.5 h-3.5 text-[#005670]" />{presence.active} online · {presence.visits} visits today
            </span>
          )}
          <span>Updated {timeAgo(data.generatedAt)}</span>
          <button onClick={() => load(true)} disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
      </div>

      {error && <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">Could not refresh: {error}. Showing the last loaded data.</div>}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={FolderOpen} tone="from-[#005670] to-[#007a9a]" title="Active projects" value={kpis.activeProjects.toLocaleString()}
          sub={`${kpis.totalItems.toLocaleString()} items tracked`} onClick={canGo('/orders') ? () => go('/orders') : null} />
        <Kpi icon={PackageCheck} tone="from-green-500 to-teal-600" title="Items on site" value={`${kpis.onSitePct}%`}
          sub={`${kpis.itemsOnSite.toLocaleString()} of ${kpis.totalItems.toLocaleString()} delivered or installed`}
          bar={kpis.onSitePct} onClick={canGo('/logistic-tracker') ? () => go('/logistic-tracker') : null} />
        <Kpi icon={Truck} tone="from-blue-500 to-cyan-600" title="Arriving in 14 days" value={kpis.arrivingSoon.toLocaleString()}
          sub={kpis.overdue > 0 ? <span className="text-red-600 font-semibold">{kpis.overdue} past expected date</span> : 'Nothing overdue'}
          onClick={canGo('/logistic-tracker') ? () => go('/logistic-tracker') : null} />
        <Kpi icon={ClipboardList} tone="from-amber-500 to-orange-600" title="Open POs" value={kpis.openPos.toLocaleString()}
          sub={includeMoney ? `${fmtCompact(kpis.poOutstanding)} sent / confirmed, not paid` : 'Draft, sent or confirmed'}
          onClick={canGo('/orders') ? () => go('/orders') : null} />
      </div>

      {/* Attention + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3" title="Needs attention" subtitle="Click an item to go straight to where it is handled">
          {attention.length === 0 ? (
            <div className="flex items-center gap-3 py-6 text-green-700"><CheckCircle2 className="w-6 h-6" /><span className="font-medium">All clear — nothing needs attention right now.</span></div>
          ) : (
            <ul className="divide-y divide-gray-100 -my-1">
              {attention.map(a => {
                const st = LEVEL_STYLE[a.level] || LEVEL_STYLE.info;
                const clickable = canGo(a.go);
                return (
                  <li key={a.id}>
                    <button type="button" disabled={!clickable} onClick={() => go(a.go)}
                      className={`w-full flex items-center gap-3 py-3 text-left ${clickable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'} rounded-lg px-1`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-900">{a.title}</span>
                        <span className="block text-xs text-gray-500">{a.hint}</span>
                      </span>
                      <span className={`px-2.5 py-1 text-sm font-bold rounded-lg border tabular-nums ${st.badge}`}>{a.count.toLocaleString()}</span>
                      {clickable && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2" title="Logistics pipeline" subtitle={`${pipelineTotal.toLocaleString()} items by status`}
          action={canGo('/logistic-tracker') ? <LinkBtn onClick={() => go('/logistic-tracker')}>Open tracker</LinkBtn> : null}>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
            {pipeline.filter(p => p.count > 0).map(p => (
              <div key={p.key} className={STAGE_COLOR[p.key]} style={{ width: `${(p.count / pipelineTotal) * 100}%` }} title={`${p.label}: ${p.count}`} />
            ))}
          </div>
          <ul className="space-y-2">
            {pipeline.map(p => (
              <li key={p.key} className="flex items-center gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${STAGE_COLOR[p.key]}`} />
                <span className="flex-1 text-gray-700">{p.label}</span>
                <span className="font-semibold text-gray-900 tabular-nums">{p.count.toLocaleString()}</span>
                <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{Math.round((p.count / pipelineTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-400">Status text from the tracker is grouped into these stages. “No status yet” items have not been updated by logistics.</p>
        </Card>
      </div>

      {/* Arrivals */}
      <Card title="Arrivals" subtitle="Items not on site yet, by expected arrival date"
        action={
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg text-xs font-semibold">
            <button onClick={() => setArrivalTab('soon')} className={`px-3 py-1.5 rounded-md ${arrivalTab === 'soon' ? 'bg-white text-[#005670] shadow-sm' : 'text-gray-500'}`}>Next 14 days ({kpis.arrivingSoon})</button>
            <button onClick={() => setArrivalTab('late')} className={`px-3 py-1.5 rounded-md ${arrivalTab === 'late' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Overdue ({kpis.overdue})</button>
          </div>
        }>
        {arrivalRows.length === 0 ? (
          <p className="py-6 text-sm text-gray-400 text-center">{arrivalTab === 'soon' ? 'No items are expected in the next 14 days.' : 'No overdue items.'}</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-0 text-left text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="border-0 text-left px-2 py-2 font-semibold">Expected</th>
                  <th className="border-0 text-left px-2 py-2 font-semibold">Item</th>
                  <th className="border-0 text-left px-2 py-2 font-semibold">Vendor</th>
                  <th className="border-0 text-left px-2 py-2 font-semibold">Project</th>
                  <th className="border-0 text-left px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {arrivalRows.map((r, i) => (
                  <tr key={i} onClick={() => go('/logistic-tracker')} className={`border-0 ${canGo('/logistic-tracker') ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                    <td className="border-0 text-left px-2 py-2.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{fmtDay(r.date)}</div>
                      <div className={`text-xs ${arrivalTab === 'late' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                        {arrivalTab === 'late' ? `${r.daysLate}d late` : r.inDays === 0 ? 'Today' : r.inDays === 1 ? 'Tomorrow' : `in ${r.inDays}d`}
                      </div>
                    </td>
                    <td className="border-0 text-left px-2 py-2.5 max-w-[260px]">
                      <div className="font-medium text-gray-900 truncate" title={r.item}>{r.item || '—'}</div>
                      <div className="text-xs font-mono text-gray-400 truncate">{r.sku}</div>
                    </td>
                    <td className="border-0 text-left px-2 py-2.5 text-gray-600 truncate max-w-[160px]">{r.vendor || '—'}</td>
                    <td className="border-0 text-left px-2 py-2.5 text-gray-600 max-w-[200px] truncate">{r.client}{r.unit ? ` · ${r.unit}` : ''}</td>
                    <td className="border-0 text-left px-2 py-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{r.stage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(arrivalTab === 'soon' ? kpis.arrivingSoon : kpis.overdue) > arrivalRows.length && (
          <p className="mt-2 text-xs text-gray-400">Showing {arrivalRows.length} of {arrivalTab === 'soon' ? kpis.arrivingSoon : kpis.overdue}. {arrivalTab === 'late' ? 'Longest overdue first.' : 'Soonest first.'} See the full list in Logistic Tracker.</p>
        )}
      </Card>

      {/* Purchasing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Purchase orders" subtitle="One PO per vendor per project, using each one's latest version">
          <ul className="space-y-3">
            {purchasing.stages.map(s => {
              const val = includeMoney ? (s.amount || 0) : s.count;
              return (
                <li key={s.key}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{s.label}</span>
                    <span className="text-gray-500 tabular-nums"><b className="text-gray-900">{s.count}</b> PO{s.count !== 1 ? 's' : ''}{includeMoney && <> · <b className="text-gray-900">{fmtCompact(s.amount)}</b></>}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100"><div className={`h-2 rounded-full ${PO_COLOR[s.key]}`} style={{ width: `${Math.max(val > 0 ? 2 : 0, (val / poMax) * 100)}%` }} /></div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-gray-400">“No PO yet” = items assigned to a vendor that has no purchase order saved.</p>
        </Card>

        {includeMoney ? (
          <Card title="Top vendors by PO value" subtitle="Item cost + extra lines per vendor across all projects, including POs not issued yet">
            <ul className="space-y-3">
              {purchasing.topVendors.map((v, i) => (
                <li key={i}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800 truncate pr-3">{v.vendor}</span>
                    <span className="font-semibold text-gray-900 tabular-nums" title={fmtMoney(v.amount)}>{fmtCompact(v.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-[#005670]" style={{ width: `${(v.amount / vendorMax) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card title="Purchasing amounts"><p className="text-sm text-gray-400 py-6 text-center">Dollar amounts are visible to users with Financial Review access.</p></Card>
        )}
      </div>

      {/* Projects */}
      <Card title="Recently updated projects" subtitle="Progress = share of items delivered or installed"
        action={canGo('/orders') ? <LinkBtn onClick={() => go('/orders')}>All orders</LinkBtn> : null}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-0 text-left text-[11px] uppercase tracking-wider text-gray-400">
                <th className="border-0 text-left px-2 py-2 font-semibold">Project</th>
                <th className="border-0 text-left px-2 py-2 font-semibold w-56">Progress</th>
                <th className="border-0 px-2 py-2 font-semibold text-right">In transit</th>
                <th className="border-0 px-2 py-2 font-semibold text-right">Issues</th>
                <th className="border-0 px-2 py-2 font-semibold text-right">Overdue</th>
                {includeMoney && <th className="border-0 px-2 py-2 font-semibold text-right">PO value</th>}
                <th className="border-0 px-2 py-2 font-semibold text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map(p => {
                const done = p.delivered + p.installed;
                const pct = p.items ? Math.round((done / p.items) * 100) : 0;
                const tag = collectionLabel(p.collection);
                return (
                  <tr key={p.orderId} onClick={() => canGo('/orders') && onNavigate(`/orders/${p.orderId}`)}
                    className={`border-0 ${canGo('/orders') ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                    <td className="border-0 text-left px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate max-w-[220px]">{p.client}</span>
                        {tag && <span title={p.collection} className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tag.cls}`}>{tag.label}</span>}
                      </div>
                      <div className="text-xs text-gray-400">{[p.proposalNumber, p.unit ? `Unit ${p.unit}` : '', `${p.items} items`].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td className="border-0 text-left px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                          <div className="bg-green-600" style={{ width: `${p.items ? (p.installed / p.items) * 100 : 0}%` }} title={`Installed: ${p.installed}`} />
                          <div className="bg-teal-500" style={{ width: `${p.items ? (p.delivered / p.items) * 100 : 0}%` }} title={`Delivered: ${p.delivered}`} />
                        </div>
                        <span className="w-9 text-right text-xs font-semibold text-gray-700 tabular-nums">{pct}%</span>
                      </div>
                    </td>
                    <td className="border-0 px-2 py-2.5 text-right tabular-nums text-gray-700">{p.transit || <span className="text-gray-300">—</span>}</td>
                    <td className="border-0 px-2 py-2.5 text-right tabular-nums">{p.issue ? <span className="font-semibold text-red-600">{p.issue}</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="border-0 px-2 py-2.5 text-right tabular-nums">{p.overdue ? <span className="font-semibold text-red-600">{p.overdue}</span> : <span className="text-gray-300">—</span>}</td>
                    {includeMoney && <td className="border-0 px-2 py-2.5 text-right tabular-nums text-gray-700" title={fmtMoney(p.poAmount)}>{fmtCompact(p.poAmount)}</td>}
                    <td className="border-0 px-2 py-2.5 text-right text-xs text-gray-400 whitespace-nowrap">{timeAgo(p.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Team attendance (admin / User Management access; the API enforces this too) */}
      {canViewAttendance && <TeamAttendance />}

      {/* Recent changes */}
      <Card title="Recent changes" subtitle="Latest edits to orders and the logistic tracker">
        {recent.length === 0 ? (
          <p className="py-6 text-sm text-gray-400 text-center">No recent changes.</p>
        ) : (
          <ul className="divide-y divide-gray-100 -my-1">
            {recent.map((r, i) => (
              <li key={i} className="flex items-start gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(r.who || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-gray-900"><b>{r.who}</b> <span className="text-gray-600">{r.text}</span></p>
                  <p className="text-xs text-gray-400 truncate">{[r.item, r.project].filter(Boolean).join(' · ')}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${r.source === 'Logistic' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{r.source}</span>
                <span className="text-xs text-gray-400 shrink-0 w-16 text-right">{timeAgo(r.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

// ─── Building blocks ──────────────────────────────────────────────────────────
const Card = ({ title, subtitle, action, className = '', children }) => (
  <section className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const LinkBtn = ({ onClick, children }) => (
  <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-[#005670] hover:underline shrink-0">
    {children}<ArrowRight className="w-3.5 h-3.5" />
  </button>
);

const Kpi = ({ icon: Icon, tone, title, value, sub, bar, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick || undefined} className={`text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${onClick ? 'hover:shadow-md hover:border-gray-300 transition cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow`}><Icon className="w-5 h-5 text-white" /></div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
      {bar !== undefined && <div className="h-1.5 rounded-full bg-gray-100 mt-2"><div className="h-1.5 rounded-full bg-green-500" style={{ width: `${bar}%` }} /></div>}
      <p className="text-xs text-gray-500 mt-1.5">{sub}</p>
    </Tag>
  );
};

export default Dashboard;
