import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Download, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { backendServer } from '../utils/info';

// Team attendance (admin only): check-in = first login of the day, check-out = logout or last activity.
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const shiftDay = (s, n) => { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(Date.UTC(y, m - 1, d + n, 12))); };
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }) : '—');
const fmtDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const fmtDur = (min) => {
  if (min === null || min === undefined) return '—';
  if (min < 1) return '<1m';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};
const END_LABEL = {
  logout: { text: 'Logged out', cls: 'bg-gray-100 text-gray-700' },
  idle:   { text: 'Idle timeout (last activity)', cls: 'bg-amber-50 text-amber-700' },
  online: { text: 'Still online', cls: 'bg-green-50 text-green-700' },
  unknown:{ text: 'Not recorded', cls: 'bg-gray-50 text-gray-400' },
};

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'custom', label: 'Custom' },
];

const TeamAttendance = () => {
  const today = ymd(new Date());
  const [preset, setPreset] = useState('today');
  const [range, setRange] = useState({ from: today, to: today });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const [query, setQuery] = useState('');

  const pick = (id) => {
    setPreset(id);
    if (id === 'today') setRange({ from: today, to: today });
    if (id === 'yesterday') { const y = shiftDay(today, -1); setRange({ from: y, to: y }); }
    if (id === '7d') setRange({ from: shiftDay(today, -6), to: today });
  };

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams({ from: range.from, to: range.to, tz: TZ });
      const res = await fetch(`${backendServer}/api/activity/attendance?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load attendance');
      setData(json);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (range.to < today) return undefined;                  // past days don't change
    const t = setInterval(() => load(true), 60000);
    return () => clearInterval(t);
  }, [load, range.to, today]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.rows || []).filter(r => !q || `${r.name} ${r.role}`.toLowerCase().includes(q));
  }, [data, query]);

  const multiDay = range.from !== range.to;
  const toggle = (key) => setOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Date', 'Name', 'Role', 'Check-in', 'Check-out', 'Online (min)', 'Sessions', 'Session logins', 'Session ends', 'Ended by'].map(esc).join(',')];
    rows.forEach(r => {
      const base = [r.date, r.name, r.role];
      if (!r.sessions.length) { lines.push([...base, '', '', '', 0].map(esc).join(',')); return; }
      r.sessions.forEach((s, i) => lines.push([
        ...base, i === 0 ? fmtTime(r.firstIn) : '', i === 0 ? (r.online ? 'Online' : fmtTime(r.lastOut)) : '',
        i === 0 ? (r.onlineMinutes ?? '') : '', i === 0 ? r.sessionCount : '',
        fmtTime(s.loginAt), s.endAt ? fmtTime(s.endAt) : '', END_LABEL[s.endReason]?.text || '',
      ].map(esc).join(',')));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `team-attendance_${range.from}${multiDay ? `_to_${range.to}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const trackingNote = data?.trackingSince
    ? `Check-out and online time are recorded since ${new Date(data.trackingSince).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Earlier days only show the login time.`
    : 'Check-out and online time start being recorded once this update is live. Earlier days only show the login time.';

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Team attendance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Check-in = first login of the day · Check-out = Logout, or last activity when the app was left idle (15 min) · times in {TZ}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg text-xs font-semibold">
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => pick(p.id)} className={`px-3 py-1.5 rounded-md ${preset === p.id ? 'bg-white text-[#005670] shadow-sm' : 'text-gray-500'}`}>{p.label}</button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <input type="date" value={range.from} max={range.to} onChange={e => e.target.value && setRange(r => ({ ...r, from: e.target.value }))} className="border border-gray-200 rounded-lg px-2 py-1" />
              <span>to</span>
              <input type="date" value={range.to} min={range.from} max={today} onChange={e => e.target.value && setRange(r => ({ ...r, to: e.target.value }))} className="border border-gray-200 rounded-lg px-2 py-1" />
            </div>
          )}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name / role…" className="w-44 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005670]" />
          </div>
          <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005670] border border-[#005670]/30 rounded-lg hover:bg-[#005670]/5 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" />CSV
          </button>
        </div>
      </div>

      {data && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-sm">
          <span className="text-gray-600"><b className="text-gray-900">{new Set(rows.map(r => r.userId)).size}</b> people{multiDay ? ' in this range' : ' checked in'}</span>
          <span className="text-gray-600 inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${data.onlineNow.length ? 'bg-green-500' : 'bg-gray-300'}`} />
            <b className="text-gray-900">{data.onlineNow.length}</b> online now
            {data.onlineNow.length > 0 && <span className="text-gray-400">({data.onlineNow.map(o => o.name).join(', ')})</span>}
          </span>
        </div>
      )}

      {error && <div className="px-3 py-2 mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

      {loading && !data ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#005670]" /></div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-sm text-gray-400 text-center">No one logged in during this period.</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-0 text-left text-[11px] uppercase tracking-wider text-gray-400">
                <th className="border-0 text-left px-2 py-2 w-6"></th>
                {multiDay && <th className="border-0 text-left px-2 py-2 font-semibold">Date</th>}
                <th className="border-0 text-left px-2 py-2 font-semibold">Person</th>
                <th className="border-0 text-left px-2 py-2 font-semibold">Check-in</th>
                <th className="border-0 text-left px-2 py-2 font-semibold">Check-out</th>
                <th className="border-0 text-right px-2 py-2 font-semibold">Online time</th>
                <th className="border-0 text-right px-2 py-2 font-semibold">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(r => {
                const key = `${r.date}|${r.userId}`;
                const isOpen = open.has(key);
                const lastSession = r.sessions[r.sessions.length - 1];
                return (
                  <React.Fragment key={key}>
                    <tr onClick={() => toggle(key)} className="border-0 cursor-pointer hover:bg-gray-50">
                      <td className="border-0 text-left px-2 py-2.5 text-gray-400">{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</td>
                      {multiDay && <td className="border-0 text-left px-2 py-2.5 whitespace-nowrap text-gray-600">{fmtDate(r.date)}</td>}
                      <td className="border-0 text-left px-2 py-2.5">
                        <span className="font-semibold text-gray-900">{r.name}</span>
                        {r.role && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500">{r.role}</span>}
                      </td>
                      <td className="border-0 text-left px-2 py-2.5 whitespace-nowrap font-medium text-gray-800">{fmtTime(r.firstIn)}</td>
                      <td className="border-0 text-left px-2 py-2.5 whitespace-nowrap">
                        {r.online ? (
                          <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold"><span className="w-2 h-2 rounded-full bg-green-500" />Online now</span>
                        ) : r.lastOut ? (
                          <span className="text-gray-800 font-medium">{fmtTime(r.lastOut)}
                            <span className="ml-1.5 text-[10px] font-normal text-gray-400">{lastSession?.endReason === 'logout' ? 'logged out' : 'last activity'}</span>
                          </span>
                        ) : (
                          <span className="text-gray-300" title="Logout time was not recorded for this day">—</span>
                        )}
                      </td>
                      <td className="border-0 text-right px-2 py-2.5 tabular-nums text-gray-800">{fmtDur(r.onlineMinutes)}</td>
                      <td className="border-0 text-right px-2 py-2.5 tabular-nums text-gray-600">{r.sessionCount}</td>
                    </tr>
                    {isOpen && (
                      <tr className="border-0 bg-gray-50/70">
                        <td className="border-0" />
                        <td colSpan={multiDay ? 6 : 5} className="border-0 text-left px-2 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-0 text-left text-[10px] uppercase tracking-wider text-gray-400">
                                <th className="border-0 text-left px-2 py-1 font-semibold">Login</th>
                                <th className="border-0 text-left px-2 py-1 font-semibold">End</th>
                                <th className="border-0 text-right px-2 py-1 font-semibold">Duration</th>
                                <th className="border-0 text-left px-2 py-1 font-semibold">Ended by</th>
                                <th className="border-0 text-left px-2 py-1 font-semibold">IP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.sessions.map((s, i) => {
                                const e = END_LABEL[s.endReason] || END_LABEL.unknown;
                                return (
                                  <tr key={i} className="border-0">
                                    <td className="border-0 text-left px-2 py-1 text-gray-800 whitespace-nowrap">{fmtTime(s.loginAt)}{s.startedBy === 'heartbeat' && <span className="ml-1 text-[10px] text-gray-400" title="The app was already open (or still signed in) when this session was first seen">· app opened</span>}</td>
                                    <td className="border-0 text-left px-2 py-1 text-gray-800 whitespace-nowrap">{s.endAt ? fmtTime(s.endAt) : '—'}</td>
                                    <td className="border-0 text-right px-2 py-1 tabular-nums text-gray-700">{fmtDur(s.minutes)}</td>
                                    <td className="border-0 text-left px-2 py-1"><span className={`px-1.5 py-0.5 rounded ${e.cls}`}>{e.text}</span></td>
                                    <td className="border-0 text-left px-2 py-1 font-mono text-gray-400">{s.ip || '—'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-gray-400">{trackingNote}</p>
    </section>
  );
};

export default TeamAttendance;
