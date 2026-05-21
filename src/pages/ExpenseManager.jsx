// pages/ExpenseManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Printer, X, Save, Loader2, ChevronLeft,
  FileText, Check, Edit2, Eye, RefreshCw, Search, Zap, AlertTriangle,
} from 'lucide-react';
import { backendServer } from '../utils/info';

const SERVICE_TYPES = [
  { id: 'decommission',    label: 'Decommission',                    icon: '🗑️', defaultRate: 0,   unit: 'flat', isEmployee: false },
  { id: 'procurement',     label: 'Procurement',                     icon: '🛒', defaultRate: 175, unit: 'hr',   isEmployee: false },
  { id: 'design_pm',       label: 'Design & Project Management Fees',icon: '✏️', defaultRate: 350, unit: 'hr',   isEmployee: true  },
  { id: 'engagement_fee',  label: 'Engagement Fee',                  icon: '🤝', defaultRate: 0,   unit: 'flat', isEmployee: false },
  { id: 'admin',           label: 'Admin',                           icon: '📂', defaultRate: 100, unit: 'hr',   isEmployee: true  },
  { id: 'business_dev',    label: 'Business Development',            icon: '📈', defaultRate: 0,   unit: 'flat', isEmployee: true  },
  { id: 'design_services', label: 'Design Services',                 icon: '🎨', defaultRate: 350, unit: 'hr',   isEmployee: true  },
  { id: 'finance',         label: 'Finance',                         icon: '💰', defaultRate: 0,   unit: 'flat', isEmployee: true  },
  { id: 'holiday',         label: 'Holiday',                         icon: '🏖️', defaultRate: 0,   unit: 'flat', isEmployee: true  },
  { id: 'installation',    label: 'Installation',                    icon: '🔧', defaultRate: 150, unit: 'hr',   isEmployee: false },
  { id: 'travel',          label: 'Travel & Expenses',               icon: '✈️', defaultRate: 0,   unit: 'flat', isEmployee: false },
];
const TAX_RATE_DEFAULT = 4.5;

const fmt   = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];
const genExpenseNum = () => {
  const d  = new Date();
  const ds = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `E-${ds}-${String(Date.now()).slice(-4)}${String(Math.floor(10 + Math.random() * 90))}`;
};

const emptyLine = () => ({
  id: Date.now() + Math.random(), date: today(), serviceType: 'design_pm',
  description: '', hours: 1, rate: 350, amount: 350, unit: 'hr',
});

const emptyExpense = (orderId, order) => {
  const ci = order?.clientInfo || {};
  return {
    id: `tmp_${Date.now()}`, expenseNumber: genExpenseNum(), expenseDate: today(), orderId,
    clientInfo: { name: ci.name || '', email: ci.email || order?.user?.email || '', address: ci.address || '', cityStateZip: ci.cityStateZip || '', unitNumber: ci.unitNumber || '' },
    projectName: ci.name ? `${ci.name}${ci.unitNumber ? ' - ' + ci.unitNumber : ''}`.trim() : '',
    taxRate: TAX_RATE_DEFAULT, employeeName: '', notes: '', lines: [emptyLine()],
    status: 'draft', createdAt: new Date().toISOString(),
  };
};

// ─── Confirm Modal ───────────────────────────────────────────────────────────
// Usage: showConfirm({ title, message, confirmLabel, confirmCls, onConfirm })
const ConfirmModal = ({ modal, onClose }) => {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-5 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5" />
            <h3 className="text-base font-bold">{modal.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 leading-relaxed">{modal.message}</p>
          {modal.warning && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{modal.warning}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={onClose} className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { modal.onConfirm(); onClose(); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors flex items-center gap-2 ${modal.confirmCls || 'bg-[#005670] hover:bg-[#004558]'}`}>
              <Zap className="w-4 h-4" />
              {modal.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Line Item Row ───────────────────────────────────────────────────────────
const LineRow = ({ line, onChange, onRemove, index }) => {
  const update = (field, value) => {
    const u = { ...line, [field]: value };
    if (field === 'hours' || field === 'rate') u.amount = parseFloat(u.hours || 0) * parseFloat(u.rate || 0);
    if (field === 'serviceType') { const s = SERVICE_TYPES.find(s => s.id === value); if (s) { u.rate = s.defaultRate; u.unit = s.unit; u.amount = u.hours * s.defaultRate; } }
    onChange(u);
  };
  const inp = 'px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white w-full';
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 group">
      <td className="px-3 py-2 w-32"><input type="date" value={line.date} onChange={e => update('date', e.target.value)} className={inp} /></td>
      <td className="px-3 py-2 w-52">
        <input list={`svc-list-${index}`} value={line.serviceType}
          onChange={e => { const v = e.target.value; const m = SERVICE_TYPES.find(s => s.label === v || s.id === v); if (m) { const u = { ...line, serviceType: m.label, rate: m.defaultRate, unit: m.unit }; u.amount = parseFloat(u.hours || 0) * m.defaultRate; onChange(u); } else update('serviceType', v); }}
          placeholder="Select or type service..." className={inp} />
        <datalist id={`svc-list-${index}`}>{SERVICE_TYPES.map(s => <option key={s.id} value={s.label} />)}</datalist>
      </td>
      <td className="px-3 py-2"><textarea value={line.description} onChange={e => update('description', e.target.value)} rows={2} className={`${inp} resize-none`} /></td>
      <td className="px-3 py-2 w-20"><input type="number" min="0" step="0.25" value={line.hours} onChange={e => update('hours', e.target.value)} className={inp} /></td>
      <td className="px-3 py-2 w-28"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input type="number" min="0" step="0.01" value={line.rate} onChange={e => update('rate', e.target.value)} className={`${inp} pl-5`} /></div></td>
      <td className="px-3 py-2 w-28 text-right"><span className="text-sm font-semibold text-gray-800">{fmt(line.amount)}</span></td>
      <td className="px-2 py-2 w-8"><button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 className="w-4 h-4" /></button></td>
    </tr>
  );
};

// ─── PATCH: Replace the entire PrintView component in ExpenseManager.jsx ───────
const PrintView = ({ expense, onClose }) => {
  const [showInstr, setShowInstr] = useState(false);
  const [origTitle] = useState(document.title);
  const sub = (expense.lines || []).reduce((s, l) => s + parseFloat(l.amount || 0), 0);
  const tax = sub * (parseFloat(expense.taxRate || 0) / 100);
  const tot = sub + tax;
  const f2  = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ✅ Tentukan subtitle header
  const lines = expense.lines || [];
  const singleLineType = lines.length === 1
    ? (SERVICE_TYPES.find(s => s.id === lines[0].serviceType)?.label || lines[0].serviceType || 'Invoice')
    : null;
  const headerSubtitle = expense.subtitle?.trim()
    ? expense.subtitle.trim()
    : singleLineType
      ? `${singleLineType} Invoice`
      : 'Time & Expenses Invoice';

  useEffect(() => {
    document.title = `Expense_${expense.expenseNumber}_${(expense.clientInfo?.name || 'Client').replace(/\s+/g, '_')}`;
    return () => { document.title = origTitle; };
  }, [expense, origTitle]);

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          body * { visibility: hidden; }
          .epc, .epc * { visibility: visible; }
          .epc { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
          .np  { display: none !important; }
          .epc-bg { background: white !important; padding: 0 !important; }
          .edoc {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            height: 11in !important;
          }
          .it, .it th, .it td { border: 1px solid #ccc !important; }
          .it th { background: #f5f5f5 !important; }
        }
        @page { size: letter; margin: 0; }

        .epc-bg {
          background: #b8b8b8;
          min-height: 100vh;
          padding: 32px 0 60px;
        }

        .edoc {
          position: relative;
          background: white;
          width: 8.5in;
          height: 11in;
          overflow: hidden;
          padding: 0.5in;
          margin: 0 auto 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.18);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          color: #1a1a1a;
          box-sizing: border-box;
        }

        .edoc-body { padding-bottom: 72px; }

        .edoc-footer {
          position: absolute;
          bottom: 0.28in;
          left: 0.5in;
          right: 0.5in;
          border-top: 1px solid #d1d5db;
          padding-top: 5px;
          text-align: center;
          font-size: 10px;
          color: rgb(0, 86, 112);
          line-height: 1.5;
          background: white;
          font-family: Arial, Helvetica, sans-serif;
        }

        .it {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16pt;
          font-size: 10pt;
          border: 1px solid #ccc;
        }
        .it th, .it td {
          border: 1px solid #ccc;
          padding: 6px 8px;
          vertical-align: top;
        }
        .it th {
          background: #f5f5f5;
          font-weight: bold;
          font-size: 9.5pt;
          text-align: left;
        }
        .it th.r { text-align: right; }
        .it td   { font-size: 9.5pt; text-align: left; }
        .it td.r { text-align: right; }

        .tot {
          margin-left: auto;
          border-collapse: collapse;
          min-width: 200pt;
          font-size: 10pt;
          border: 1px solid #ccc;
        }
        .tot td {
          padding: 4px 10px;
          border: 1px solid #ccc;
        }
        .tot td.lb { text-align: right; font-weight: bold; background: #f5f5f5; }
        .tot td.am { text-align: right; }
        .totl td   { font-weight: bold; border-top: 2px solid #999 !important; }
      `}</style>

      {/* ── Screen toolbar ── */}
      <div className="np sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <span className="text-sm font-semibold text-[#005670]">{expense.expenseNumber}</span>
          <span className="text-sm text-gray-500">— {expense.projectName}</span>
        </div>
        <button
          onClick={() => setShowInstr(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* ── Printable area ── */}
      <div className="epc epc-bg">
        <div className="edoc">
          <div className="edoc-body">

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18pt' }}>
              <div>
                <div style={{ fontSize:'16pt', fontWeight:'normal', marginBottom:'2px' }}>Henderson Design Group</div>
                {/* ✅ Ganti subtitle jika hanya 1 line item */}
                <div style={{ fontSize:'13pt', fontWeight:'normal', color:'#444' }}>{headerSubtitle}</div>
              </div>
              <img
                src="/images/HDG-Logo.png"
                alt="HDG"
                style={{
                  height:'44px', width:'auto',
                  filter:'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)'
                }}
              />
            </div>

            {/* Client info + expense meta */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14pt', fontSize:'10pt', lineHeight:'1.7' }}>
              <div>
                {expense.clientInfo?.name         && <div style={{ fontWeight:'bold' }}>{expense.clientInfo.name}</div>}
                {expense.clientInfo?.address      && <div>{expense.clientInfo.address}</div>}
                {expense.clientInfo?.cityStateZip && <div>{expense.clientInfo.cityStateZip}</div>}
                {expense.clientInfo?.email        && <div>{expense.clientInfo.email}</div>}
              </div>
              <div style={{ textAlign:'right', fontSize:'10pt', lineHeight:'1.7' }}>
                <div><strong>Expense # :</strong>&nbsp;{expense.expenseNumber}</div>
                <div>
                  <strong>Expense Date:</strong>&nbsp;
                  {expense.expenseDate
                    ? new Date(expense.expenseDate + 'T12:00:00').toLocaleDateString('en-US', { month:'2-digit', day:'2-digit', year:'numeric' })
                    : ''}
                </div>
              </div>
            </div>

            {/* Project / Employee */}
            {(expense.projectName || expense.employeeName) && (
              <div style={{ fontSize:'10pt', marginBottom:'14pt', display:'flex', justifyContent:'space-between' }}>
                {expense.projectName  && <div><strong>Project:</strong> {expense.projectName}</div>}
                {expense.employeeName && <div><strong>Employee:</strong> {expense.employeeName}</div>}
              </div>
            )}

            {/* Line items — ✅ tambah kolom Type */}
            <table className="it">
              <thead>
                <tr>
                  <th style={{ width:'72pt' }}>Date</th>
                  <th style={{ width:'100pt' }}>Type</th>
                  <th>Description</th>
                  <th className="r" style={{ width:'44pt' }}>Hours</th>
                  <th className="r" style={{ width:'56pt' }}>Rate</th>
                  <th className="r" style={{ width:'64pt' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(expense.lines || []).map((line, i) => {
                  const svc = SERVICE_TYPES.find(s => s.id === line.serviceType);
                  return (
                    <tr key={i}>
                      <td style={{ whiteSpace:'nowrap' }}>
                        {line.date
                          ? new Date(line.date + 'T12:00:00').toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' })
                          : ''}
                      </td>
                      {/* ✅ Kolom Type */}
                      <td style={{ fontWeight:'500', fontSize:'9.5pt' }}>
                        {svc ? svc.label : (line.serviceType || '—')}
                      </td>
                      <td>
                        <div style={{ whiteSpace:'pre-wrap' }}>{line.description}</div>
                      </td>
                      <td className="r">{parseFloat(line.hours || 0).toFixed(2)}</td>
                      <td className="r">{f2(line.rate)}</td>
                      <td className="r" style={{ fontWeight:'bold' }}>{f2(line.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Notes */}
            {expense.notes && (
              <div style={{ marginTop:'12pt', fontSize:'9.5pt', color:'#444', whiteSpace:'pre-wrap' }}>
                {expense.notes}
              </div>
            )}

            {/* Totals */}
            <div style={{ marginTop:'18pt', display:'flex', justifyContent:'flex-end' }}>
              <table className="tot">
                <tbody>
                  <tr><td className="lb">Subtotal:</td><td className="am">{f2(sub)}</td></tr>
                  <tr><td className="lb">Taxes:</td><td className="am">{f2(tax)}</td></tr>
                  <tr className="totl"><td className="lb">Total:</td><td className="am">{f2(tot)}</td></tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Footer */}
          <div className="edoc-footer">
            <p style={{ margin: 0 }}>Henderson Design Group 4343 Royal Place, Honolulu, HI, 96816</p>
            <p style={{ margin: 0 }}>Phone: (808) 315-8782</p>
          </div>

        </div>
      </div>

      {/* Print instructions modal */}
      {showInstr && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 np">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print / Save as PDF</h3>
              <button onClick={() => setShowInstr(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best result, please configure:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { n:1, t:'Margins → None',           d:'Margins are built into the document — set browser to None' },
                  { n:2, t:'Scale → 100%',              d:'Must be exactly 100% — do NOT use Fit to Page' },
                  { n:3, t:'Headers and Footers → Off', d:'Uncheck — removes browser header/footer bars' },
                  { n:4, t:'Background Graphics → On',  d:'Check this so colors and logo print correctly' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{s.n}</div>
                    <div><p className="font-semibold text-gray-900">{s.t}</p><p className="text-sm text-gray-600">{s.d}</p></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowInstr(false)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button
                  onClick={() => { setShowInstr(false); setTimeout(() => window.print(), 150); }}
                  className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Expense Editor ──────────────────────────────────────────────────────────
const ExpenseEditor = ({ expense: initial, onSave, onCancel, onPrint }) => {
  const [inv, setInv]           = useState(initial);
  const [saving, setSaving]     = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [empSearch, setEmpSearch] = useState(initial.employeeName || '');
  const [empOpen, setEmpOpen]     = useState(false);
  const empRef                    = React.useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendServer}/api/users/admins?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setAdminUsers(d.users || []); }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (empRef.current && !empRef.current.contains(e.target)) setEmpOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const upd    = (f, v) => setInv(p => ({ ...p, [f]: v }));
  const hasEmp = (inv.lines || []).some(l => { const m = SERVICE_TYPES.find(s => s.label === l.serviceType || s.id === l.serviceType); return m?.isEmployee; });
  const addLine    = () => setInv(p => ({ ...p, lines: [...p.lines, emptyLine()] }));
  const removeLine = (id) => setInv(p => ({ ...p, lines: p.lines.filter(l => l.id !== id) }));
  const updateLine = (id, u) => setInv(p => ({ ...p, lines: p.lines.map(l => l.id === id ? u : l) }));
  const addSvc     = (svcId) => { const svc = SERVICE_TYPES.find(s => s.id === svcId); if (!svc) return; setInv(p => ({ ...p, lines: [...p.lines, { ...emptyLine(), serviceType: svc.id, rate: svc.defaultRate, unit: svc.unit, amount: svc.defaultRate }] })); };
  const sub = inv.lines.reduce((s, l) => s + parseFloat(l.amount || 0), 0);
  const tax = sub * (parseFloat(inv.taxRate || 0) / 100);
  const tot = sub + tax;
  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]';
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"><ChevronLeft className="w-4 h-4" /> Back to list</button>
        <div className="flex items-center gap-2">
          <button onClick={() => onPrint(inv)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><Eye className="w-4 h-4" /> Preview & Print</button>
          <button onClick={() => onSave(inv)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-semibold hover:bg-[#004558] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Expense</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Expense Details</h3>
              <div className="text-right"><p className="text-xs text-gray-400">Expense #</p><p className="text-sm font-mono font-semibold text-[#005670]">{inv.expenseNumber}</p></div>
            </div>
            {/* ✅ Subtitle input */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Invoice Subtitle
                <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                  tampil di bawah "Henderson Design Group" saat print
                </span>
              </label>
              <input
                type="text"
                value={inv.subtitle || ''}
                onChange={e => upd('subtitle', e.target.value)}
                placeholder="e.g. Time & Expenses Invoice"
                className={inp}
              />
            </div>
            {hasEmp && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee Name <span className="ml-1.5 text-[10px] text-gray-400 font-normal">required for employee services</span></label>
                <div className="relative" ref={empRef}>
                  <input
                    type="text"
                    value={empSearch}
                    onChange={e => {
                      setEmpSearch(e.target.value);
                      upd('employeeName', e.target.value);
                      setEmpOpen(true);
                    }}
                    onFocus={() => setEmpOpen(true)}
                    placeholder="Search employee..."
                    className={`${inp} pr-8`}
                  />
                  {(inv.employeeName || empSearch) && (
                    <button
                      type="button"
                      onClick={() => { upd('employeeName', ''); setEmpSearch(''); setEmpOpen(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {empOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {adminUsers.filter(u => !empSearch || u.name.toLowerCase().includes(empSearch.toLowerCase())).length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400 italic">No results</div>
                      ) : (
                        adminUsers
                          .filter(u => !empSearch || u.name.toLowerCase().includes(empSearch.toLowerCase()))
                          .map(u => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => { upd('employeeName', u.name); setEmpSearch(u.name); setEmpOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#005670]/5 hover:text-[#005670] transition-colors flex items-center gap-2
                                ${inv.employeeName === u.name ? 'bg-[#005670]/5 text-[#005670] font-medium' : 'text-gray-700'}`}
                            >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              {u.name}
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">Client Info <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full normal-case tracking-normal">from project</span></h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">Name</p><p className="font-medium text-gray-800">{inv.clientInfo?.name || '—'}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Project</p><p className="font-medium text-gray-800">{inv.projectName || '—'}</p></div>
              {inv.clientInfo?.email && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-gray-700">{inv.clientInfo.email}</p></div>}
              {(inv.clientInfo?.address || inv.clientInfo?.cityStateZip) && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Address</p><p className="text-gray-700">{[inv.clientInfo?.address, inv.clientInfo?.cityStateZip].filter(Boolean).join(', ')}</p></div>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Totals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">{fmt(sub)}</span></div>
              <div className="flex justify-between items-center text-gray-600"><span>Tax Rate (%)</span><input type="number" min="0" step="0.1" value={inv.taxRate} onChange={e => upd('taxRate', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right" /></div>
              <div className="flex justify-between text-gray-600"><span>Taxes</span><span>{fmt(tax)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 text-[#005670]"><span>Total</span><span>{fmt(tot)}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm uppercase tracking-wide">Presets</h3>
            <p className="text-xs text-gray-400 mb-3">Click to add a line item</p>
            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              {SERVICE_TYPES.map(s => (
                <button key={s.id} onClick={() => addSvc(s.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#005670]/5 hover:text-[#005670] rounded-lg transition-colors text-left">
                  <span className="text-base">{s.icon}</span><span className="flex-1">{s.label}</span>{s.defaultRate > 0 && <span className="text-xs text-gray-400">${s.defaultRate}/{s.unit}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Notes</h3>
            <textarea value={inv.notes} onChange={e => upd('notes', e.target.value)} placeholder="Additional notes..." rows={4} className={`${inp} resize-none text-xs`} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Line Items ({inv.lines.length})</h3>
          <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005670] text-white rounded-lg text-xs font-semibold hover:bg-[#004558]"><Plus className="w-3.5 h-3.5" /> Add Line</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr><th className="px-3 py-2 text-left w-32">Date</th><th className="px-3 py-2 text-left w-44">Type</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right w-20">Hours</th><th className="px-3 py-2 text-right w-28">Rate</th><th className="px-3 py-2 text-right w-28">Amount</th><th className="px-3 py-2 w-8"></th></tr>
            </thead>
            <tbody>{inv.lines.map((line, i) => <LineRow key={line.id} line={line} index={i} onChange={u => updateLine(line.id, u)} onRemove={() => removeLine(line.id)} />)}</tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200"><td colSpan={5} className="px-3 py-3 text-right text-sm font-semibold text-gray-700">Total</td><td className="px-3 py-3 text-right text-base font-bold text-[#005670]">{fmt(tot)}</td><td /></tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const EXPENSE_STATUS = {
  draft:     { label: 'Draft',     pill: 'bg-gray-100 text-gray-600 border-gray-200'         },
  review:    { label: 'Review',    pill: 'bg-amber-50 text-amber-700 border-amber-200'        },
  confirmed: { label: 'Confirmed', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paid:      { label: 'Paid',      pill: 'bg-blue-50 text-blue-700 border-blue-200'           },
};

// ─── QB Cell ─────────────────────────────────────────────────────────────────
const QBCell = ({ qbId, onSend, onResync, onRetry, failedMsg, notReadyMsg, syncing }) => {
  const isSynced = qbId !== null && qbId !== undefined && qbId !== '' && qbId !== false;
  if (isSynced) return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
        <Zap className="w-3 h-3" /> In QB #{qbId}
      </span>
      {onResync && (
        <button onClick={onResync} disabled={!!syncing} title="Resync"
          className="inline-flex items-center p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
          {syncing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
        </button>
      )}
    </div>
  );
  if (failedMsg) return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
        <Zap className="w-3 h-3" /> Failed
      </span>
      {onRetry && (
        <button onClick={onRetry} disabled={!!syncing}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
          {syncing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />} Retry
        </button>
      )}
    </div>
  );
  if (onSend) return (
    <button onClick={onSend} disabled={!!syncing}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
      {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Send to QB
    </button>
  );
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-400 border border-gray-200 w-fit whitespace-nowrap">
        <Zap className="w-3 h-3" /> Not ready
      </span>
      {notReadyMsg && <span className="text-[9px] text-amber-500">{notReadyMsg}</span>}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-1 px-5 py-3 border-t border-gray-100">
      <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1} className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">‹</button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${current === p ? 'bg-[#005670] text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
      ))}
      <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total} className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">›</button>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const ExpenseManager = () => {
  const [orders, setOrders]                     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedOrder, setSelectedOrder]       = useState(null);
  const [expenses, setExpenses]                 = useState([]);
  const [poSummary, setPoSummary]               = useState(null);
  const [allPOVersions, setAllPOVersions]       = useState([]);
  const [view, setView]                         = useState('orders');
  const [editingExpense, setEditingExpense]     = useState(null);
  const [printExpense, setPrintExpense]         = useState(null);
  const [saving, setSaving]                     = useState(false);
  const [toast, setToast]                       = useState(null);
  const [currentPage, setCurrentPage]           = useState(1);
  const [syncingIds, setSyncingIds]             = useState({});
  const [expensePage, setExpensePage]           = useState(1);
  const [proposalPage, setProposalPage]         = useState(1);
  const [poPage, setPoPage]                     = useState(1);
  const [proposalVersions, setProposalVersions] = useState([]);
  // confirmModal: { title, message, warning?, confirmLabel, confirmCls?, onConfirm }
  const [confirmModal, setConfirmModal]         = useState(null);
  // localQBIds: { [id]: qbIdString } — set immediately after sync, persists this session
  // Key insight: server may not have quickbooksId field in ProposalVersion schema yet,
  // so we track it locally. This is the primary source of truth for "already synced" check.
  const [localQBIds, setLocalQBIds]             = useState({});
  const ROWS_PER_PAGE = 5;

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const closeConfirm = () => setConfirmModal(null);

  // showConfirm returns a Promise that resolves true (confirmed) or false (cancelled)
  // Usage: showConfirm({...}) then onConfirm callback is called directly
  const showConfirm = (config) => setConfirmModal(config);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`${backendServer}/api/orders?limit=100&status=all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders((data.orders || []).filter(o => o.selectedPlan));
    } catch {}
    finally { setLoading(false); }
  };

  const loadExpenses = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`${backendServer}/api/expenses?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setExpenses(d.expenses || []); } else setExpenses([]);
    } catch { setExpenses([]); }
  };

  const saveExpense = async (inv) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = inv.id?.startsWith('tmp_');
      const url   = isNew ? `${backendServer}/api/expenses` : `${backendServer}/api/expenses/${inv.id}`;
      const payload = { ...inv, orderId: selectedOrder._id };
      if (isNew) delete payload.id;
      const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { showToast('Expense saved'); await loadExpenses(selectedOrder._id); setView('project'); setEditingExpense(null); }
      else { const e = await res.json().catch(() => ({})); showToast(e.message || 'Failed to save', 'error'); }
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const deleteExpense = async (id) => {
    showConfirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This cannot be undone.',
      confirmLabel: 'Delete',
      confirmCls: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${backendServer}/api/expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          setExpenses(prev => prev.filter(i => i.id !== id));
          showToast('Expense deleted');
        } catch { showToast('Failed to delete', 'error'); }
      },
    });
  };

  const selectOrder = async (order) => {
    setSelectedOrder(order);
    setProposalVersions([]);
    setLocalQBIds({});
    setExpensePage(1); setProposalPage(1); setPoPage(1);
    await loadExpenses(order._id);
    try {
      const token = localStorage.getItem('token');
      const [freshRes, summaryRes, poRes, pvRes] = await Promise.all([
        fetch(`${backendServer}/api/orders/${order._id}`,                     { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendServer}/api/quickbooks/project-summary/${order._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendServer}/api/quickbooks/latest-po/${order._id}`,       { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendServer}/api/proposals/${order._id}/versions/all`,     { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (freshRes.ok)   { const o = await freshRes.json();   setSelectedOrder(o); }
      if (pvRes.ok) {
        const p = await pvRes.json();
        const versions = p.data || [];
        setProposalVersions(versions);
        
        // ✅ Hanya populate dari pv.quickbooksId per version, TIDAK dari Order.proposalQbId
        const initLocal = {};
        versions.forEach(pv => {
          if (pv.quickbooksId && String(pv.quickbooksId).trim() !== '') {
            initLocal[pv._id?.toString()] = pv.quickbooksId;
          }
        });
        setLocalQBIds(prev => ({ ...prev, ...initLocal }));
      }
      if (summaryRes.ok) { const s = await summaryRes.json(); setAllPOVersions(s.poVendors || []); } else setAllPOVersions([]);
      if (poRes.ok)      { setPoSummary(await poRes.json()); } else setPoSummary(null);
    } catch { setPoSummary(null); }
    setView('project');
  };

  // After freshRes loads, also check Order.proposalQbId
  // We do this in a useEffect watching selectedOrder

  if (view === 'print' && printExpense) return <PrintView expense={printExpense} onClose={() => setView(editingExpense ? 'editor' : 'project')} />;
  if (view === 'editor' && editingExpense) return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <ExpenseEditor expense={editingExpense} onSave={saveExpense} onCancel={() => { setView('project'); setEditingExpense(null); }} onPrint={(inv) => { setPrintExpense(inv); setView('print'); }} />
    </div>
  );

  // ─── Project detail ──────────────────────────────────────────────────────
if ((view === 'list' || view === 'project') && selectedOrder) {
    const setSyncing = (id, val) => setSyncingIds(p => ({ ...p, [id]: val }));
    const setLocalQB = (id, qbId) => setLocalQBIds(p => ({ ...p, [id]: qbId }));
    const getQBId = (id, serverQBId) => {
      const local = localQBIds[id];
      if (local && String(local).trim() !== '') return local;
      if (serverQBId && String(serverQBId).trim() !== '') return serverQBId;
      return null;
    };
 
    // ── Expense QB ─────────────────────────────────────────────────────────
    const doSyncExpenseQB = async (exp, isResync = false) => {
      const id = exp.id || exp._id;
      setSyncing(id, true);
      try {
        const token = localStorage.getItem('token');
        const url = isResync
          ? `${backendServer}/api/quickbooks/sync-expense/${id}?force=true`
          : `${backendServer}/api/quickbooks/sync-expense/${id}`;
        const res  = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setExpenses(prev => prev.map(e => (e.id || e._id) === id ? { ...e, quickbooksId: data.quickbooksId, quickbooksSyncedAt: new Date().toISOString(), quickbooksStatus: 'synced', quickbooksError: null } : e));
          showToast(`✅ ${isResync ? 'Resynced' : 'Synced'} to QB: ${data.quickbooksId}`);
          setTimeout(() => loadExpenses(selectedOrder._id), 1000);
        } else {
          if (data.quickbooksId) {
            setExpenses(prev => prev.map(e => (e.id || e._id) === id ? { ...e, quickbooksId: data.quickbooksId } : e));
            showToast(`Already in QB — ID: ${data.quickbooksId}`, 'error');
          } else {
            setExpenses(prev => prev.map(e => (e.id || e._id) === id ? { ...e, quickbooksStatus: 'failed', quickbooksError: data.message } : e));
            showToast(`Failed: ${data.message || 'Unknown error'}`, 'error');
          }
        }
      } catch (e) { showToast('Failed: ' + e.message, 'error'); }
      finally { setSyncing(id, false); }
    };
 
    const syncExpenseQB = (exp, isResync = false) => {
      showConfirm({
        title: isResync ? 'Resync to QuickBooks' : 'Send to QuickBooks',
        message: isResync
          ? `Update QB Invoice for expense ${exp.expenseNumber}? A new invoice will be created in QuickBooks.`
          : `Send expense ${exp.expenseNumber} to QuickBooks as Invoice?`,
        confirmLabel: isResync ? 'Resync' : 'Send to QB',
        onConfirm: () => doSyncExpenseQB(exp, isResync),
      });
    };
 
    // ── Proposal QB ────────────────────────────────────────────────────────
    const doSyncProposalQB = async (pvId, isResync = false) => {
      setSyncing(pvId, true);
      try {
        const token = localStorage.getItem('token');
        const url = isResync
          ? `${backendServer}/api/quickbooks/sync-proposal/${selectedOrder._id}/${pvId}?force=true`
          : `${backendServer}/api/quickbooks/sync-proposal/${selectedOrder._id}/${pvId}`;
        const res  = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          showToast(`✅ ${isResync ? 'Resynced' : 'Synced'} to QB: ${data.quickbooksId}`);
          setLocalQB(pvId, data.quickbooksId);
          const pvRes = await fetch(
            `${backendServer}/api/proposals/${selectedOrder._id}/versions/all`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (pvRes.ok) { const d = await pvRes.json(); setProposalVersions(d.data || []); }
        } else {
          if (data.quickbooksId) {
            setLocalQB(pvId, data.quickbooksId);
            showToast(`Already in QB — ID: ${data.quickbooksId}`, 'error');
          } else {
            showToast(`Failed: ${data.message || 'Unknown error'}`, 'error');
          }
        }
      } catch (e) { showToast('Failed: ' + e.message, 'error'); }
      finally { setSyncing(pvId, false); }
    };
 
    const syncProposalQB = (pvId, currentQBId, isResync = false) => {
      showConfirm({
        title: isResync ? 'Resync Proposal to QuickBooks' : 'Send Proposal to QuickBooks',
        message: isResync
          ? `Update QB Invoice for proposal ${selectedOrder.proposalNumber}? A new invoice will be created in QuickBooks.`
          : `Send proposal ${selectedOrder.proposalNumber} to QuickBooks as Invoice?`,
        warning: !isResync ? 'This will create a new Invoice in QuickBooks for the approved proposal amount.' : undefined,
        confirmLabel: isResync ? 'Resync' : 'Send to QB',
        onConfirm: () => doSyncProposalQB(pvId, isResync),
      });
    };
 
    // ── PO QB ──────────────────────────────────────────────────────────────
    const doSyncPOQB = async (poVersionId, isResync = false) => {
      setSyncing(poVersionId, true);
      try {
        const token = localStorage.getItem('token');
        const url = isResync
          ? `${backendServer}/api/quickbooks/sync-po/${poVersionId}?force=true`
          : `${backendServer}/api/quickbooks/sync-po/${poVersionId}`;
        const res  = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          showToast(`✅ PO ${isResync ? 'resynced' : 'synced'} to QB: ${data.quickbooksId}`);
          setLocalQB(poVersionId, data.quickbooksId);
          const poRes2 = await fetch(`${backendServer}/api/quickbooks/latest-po/${selectedOrder._id}`, { headers: { Authorization: `Bearer ${token}` } });
          if (poRes2.ok) setPoSummary(await poRes2.json());
        } else {
          if (data.quickbooksId) {
            setLocalQB(poVersionId, data.quickbooksId);
            showToast(`Already in QB — ID: ${data.quickbooksId}`, 'error');
          } else {
            showToast(`Failed: ${data.message || 'Unknown error'}`, 'error');
            setPoSummary(prev => prev ? { ...prev, details: prev.details.map(d => d.poVersionId?.toString() === poVersionId ? { ...d, qbError: data.message } : d) } : prev);
          }
        }
      } catch (e) { showToast('Failed: ' + e.message, 'error'); }
      finally { setSyncing(poVersionId, false); }
    };
 
    const syncPOQB = (poVersionId, vendorName, currentQBId, isResync = false) => {
      showConfirm({
        title: isResync ? 'Resync PO to QuickBooks' : 'Send PO to QuickBooks',
        message: isResync
          ? `Update QB Bill for ${vendorName} PO? A new bill will be created in QuickBooks.`
          : `Send ${vendorName} PO to QuickBooks as Bill?`,
        confirmLabel: isResync ? 'Resync' : 'Send to QB',
        onConfirm: () => doSyncPOQB(poVersionId, isResync),
      });
    };
 
    // ── Paged data ─────────────────────────────────────────────────────────
    const totalExpPages = Math.ceil(expenses.length / ROWS_PER_PAGE);
    const pagedExp      = expenses.slice((expensePage - 1) * ROWS_PER_PAGE, expensePage * ROWS_PER_PAGE);
 
    const PS_CFG = {
      draft:    { cls: 'bg-gray-100 text-gray-500 border-gray-200',          label: 'Draft'          },
      sent:     { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: 'Sent to Client' },
      approved: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved'       },
      rejected: { cls: 'bg-red-100 text-red-600 border-red-200',             label: 'Rejected'       },
    };
    const totalPvPages = Math.ceil(proposalVersions.length / ROWS_PER_PAGE);
    const pagedPv      = proposalVersions.slice((proposalPage - 1) * ROWS_PER_PAGE, proposalPage * ROWS_PER_PAGE);
 
    const allPORows    = [
      ...(poSummary?.details || []).map(po => ({ ...po, _type: 'confirmed' })),
      ...allPOVersions.filter(v => !(poSummary?.details || []).some(p => p.vendorName === v.vendorName)).map(v => ({ ...v, _type: 'pending' })),
    ];
    const totalPoPages = Math.ceil(allPORows.length / ROWS_PER_PAGE);
    const pagedPO      = allPORows.slice((poPage - 1) * ROWS_PER_PAGE, poPage * ROWS_PER_PAGE);
 
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <ConfirmModal modal={confirmModal} onClose={closeConfirm} />
 
        {toast && (
          <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            <Check className="w-4 h-4" />{toast.msg}
          </div>
        )}
 
        {/* Back + header */}
        <div className="flex items-center gap-4">
          <button onClick={() => { setView('orders'); setSelectedOrder(null); setExpenses([]); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"><ChevronLeft className="w-4 h-4" /> All Projects</button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{selectedOrder.clientInfo?.name}</h2>
            {selectedOrder.clientInfo?.unitNumber && <p className="text-xs text-gray-400">Unit {selectedOrder.clientInfo.unitNumber}</p>}
          </div>
        </div>
 
        {/* ── SECTION 1: Expenses ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-gray-800">🧾 Expenses / Invoices</h3>
              {expenses.length > 0 && (() => {
                const synced = expenses.filter(e => e.quickbooksId).length;
                const failed = expenses.filter(e => e.quickbooksStatus === 'failed' || e.quickbooksError).length;
                const ready  = expenses.filter(e => !e.quickbooksId && (e.status === 'confirmed' || e.status === 'paid')).length;
                const draft  = expenses.filter(e => !e.quickbooksId && e.status !== 'confirmed' && e.status !== 'paid').length;
                return (
                  <div className="flex items-center gap-1.5">
                    {synced > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">{synced} In QB</span>}
                    {failed > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">{failed} Failed</span>}
                    {ready  > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-600">{ready} Ready</span>}
                    {draft  > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">{draft} Draft</span>}
                  </div>
                );
              })()}
            </div>
            <button onClick={() => { setEditingExpense(emptyExpense(selectedOrder._id, selectedOrder)); setView('editor'); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-semibold hover:bg-[#004558] shadow-sm">
              <Plus className="w-4 h-4" /> New Expense
            </button>
          </div>
          {expenses.length === 0 ? (
            <div className="px-5 py-8 text-center"><FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No expenses yet — click New Expense to start</p></div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-36">Expense #</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-24">Date</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-28">Employee</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-44">QuickBooks</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-20">Total</th>
                    <th className="px-4 py-2 w-28"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedExp.map(exp => {
                    const id       = exp.id || exp._id;
                    const locked   = exp.status === 'confirmed' || exp.status === 'paid';
                    const sub      = (exp.lines || []).reduce((s, l) => s + parseFloat(l.amount || 0), 0);
                    const total    = sub * (1 + parseFloat(exp.taxRate || 0) / 100);
                    const sCfg     = EXPENSE_STATUS[exp.status] || EXPENSE_STATUS.draft;
                    const hasError = !!(exp.quickbooksError || exp.quickbooksStatus === 'failed');
                    const qbId     = exp.quickbooksId || null;
                    return (
                      <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2"><span className="text-xs font-mono font-semibold text-[#005670]">{exp.expenseNumber}</span>{locked && <span className="ml-1 text-[10px] text-gray-300">🔒</span>}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{exp.expenseDate ? new Date(exp.expenseDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-[100px] truncate">{exp.employeeName || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sCfg.pill}`}>{sCfg.label}</span></td>
                        <td className="px-3 py-2">
                          <QBCell
                            qbId={qbId}
                            onSend={locked && !hasError && !qbId ? () => syncExpenseQB(exp, false) : undefined}
                            onResync={locked && qbId ? () => syncExpenseQB(exp, true) : undefined}
                            failedMsg={hasError && !qbId ? (exp.quickbooksError || 'Sync failed') : null}
                            onRetry={hasError && !qbId ? () => syncExpenseQB(exp, false) : undefined}
                            notReadyMsg={!locked ? 'Confirm first' : undefined}
                            syncing={syncingIds[id]}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-gray-800 text-right whitespace-nowrap">{fmt(total)}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingExpense(exp); setView('editor'); }} title="Edit" className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { setPrintExpense(exp); setView('print'); }} title="Print" className="p-1.5 text-[#005670] hover:bg-[#005670]/10 rounded-lg transition-all"><Printer className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteExpense(id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination current={expensePage} total={totalExpPages} onChange={setExpensePage} />
            </>
          )}
        </div>
 
        {/* ── SECTION 2: Proposals ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-gray-800">📄 Proposals</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{proposalVersions.length} proposal{proposalVersions.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => window.open(`/admin/proposal/${selectedOrder._id}`, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005670] border border-[#005670]/30 rounded-lg hover:bg-[#005670]/5 transition-colors">
              <FileText className="w-3.5 h-3.5" />{proposalVersions.length === 0 ? 'Create Proposal' : 'Open Proposal Editor'}
            </button>
          </div>
          {proposalVersions.length === 0 ? (
            <div className="px-5 py-8 text-center"><FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No proposals yet</p><p className="text-xs text-gray-300 mt-1">Open Proposal Editor to create the first proposal</p></div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-36">Proposal #</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-24">Date</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-28">Status</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-44">QuickBooks</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedPv.map((pv) => {
                    const pvId       = pv._id?.toString();
                    const isApproved = pv.status === 'approved';
                    const psCfg      = PS_CFG[pv.status] || PS_CFG.draft;
                    const qbId       = getQBId(pvId, pv.quickbooksId);
                    return (
                      <tr key={pvId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2"><span className="text-xs font-mono font-semibold text-[#005670]">{pv.proposalNumber || selectedOrder.proposalNumber || '—'}</span></td>
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{pv.createdAt ? new Date(pv.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-[160px] truncate" title={pv.notes}>{pv.notes || <span className="text-gray-300 italic">—</span>}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${psCfg.cls}`}>
                            {isApproved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}{psCfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <QBCell
                            qbId={qbId}
                            onSend={isApproved && !qbId ? () => syncProposalQB(pvId, qbId, false) : undefined}
                            onResync={isApproved && qbId ? () => syncProposalQB(pvId, qbId, true) : undefined}
                            notReadyMsg={!isApproved ? 'Approve first' : undefined}
                            syncing={syncingIds[pvId]}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => window.open(`/admin/proposal/${selectedOrder._id}`, '_blank')} title="View" className="p-1.5 text-[#005670] hover:bg-[#005670]/10 rounded-lg transition-all"><Eye className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination current={proposalPage} total={totalPvPages} onChange={setProposalPage} />
            </>
          )}
        </div>
 
        {/* ── SECTION 3: Purchase Orders ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-gray-800">🏷️ Purchase Orders</h3>
              {(() => {
                const confirmed = poSummary?.details?.length || 0;
                const pending   = allPOVersions.filter(v => !(poSummary?.details || []).some(p => p.vendorName === v.vendorName)).length;
                const total     = confirmed + pending;
                if (total === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No POs yet</span>;
                return <div className="flex items-center gap-1.5">{confirmed > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">{confirmed} Confirmed</span>}{pending > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">{pending} Pending</span>}</div>;
              })()}
            </div>
            {/* ✅ FIX: Header button removed — each vendor row has its own View button below */}
            <span className="text-xs text-gray-400 italic">Open per-vendor ↓</span>
          </div>
          {allPORows.length === 0 ? (
            <div className="px-5 py-8 text-center"><FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No purchase orders yet</p><p className="text-xs text-gray-300 mt-1">Open PO Manager to create purchase orders per vendor</p></div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-36">PO #</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32">Vendor</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-44">QuickBooks</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedPO.map((po, i) => {
                    if (po._type === 'confirmed') {
                      const poId   = po.poVersionId?.toString();
                      const qbId   = getQBId(poId, po.quickbooksId);
                      const failed = po.qbError;
                      // ✅ vendorId dari poSummary details
                      const vendorId = po.vendorId?.toString() || po._id?.toString();
                      return (
                        <tr key={`conf-${i}`} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2"><span className="text-xs font-mono font-semibold text-gray-700 whitespace-nowrap">{po.poNumber || '—'}</span></td>
                          <td className="px-3 py-2 text-xs font-medium text-gray-600 truncate max-w-[120px]" title={po.vendorName}>{po.vendorName}</td>
                          <td className="px-3 py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" /> Confirmed</span></td>
                          <td className="px-3 py-2">
                            <QBCell
                              qbId={qbId}
                              onSend={!qbId && !failed ? () => syncPOQB(poId, po.vendorName, qbId, false) : undefined}
                              onResync={qbId ? () => syncPOQB(poId, po.vendorName, qbId, true) : undefined}
                              failedMsg={failed && !qbId ? failed : null}
                              onRetry={failed && !qbId ? () => syncPOQB(poId, po.vendorName, null, false) : undefined}
                              syncing={syncingIds[poId]}
                            />
                          </td>
                          {/* ✅ FIX: View button dengan vendorId yang benar */}
                          <td className="px-4 py-2">
                            <button
                              onClick={() => window.open(`/admin/purchase-order/${selectedOrder._id}/${vendorId}`, '_blank')}
                              title="View/Edit PO"
                              className="p-1.5 text-[#005670] hover:bg-[#005670]/10 rounded-lg transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    // Pending rows
                    const s    = po.status || 'draft';
                    const sCfg = {
                      draft:     { cls: 'bg-gray-100 text-gray-500 border-gray-200',         label: 'Draft'       },
                      sent:      { cls: 'bg-blue-100 text-blue-700 border-blue-200',         label: 'Sent'        },
                      confirmed: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',label: 'Confirmed'   },
                      cancelled: { cls: 'bg-red-100 text-red-600 border-red-200',            label: 'Cancelled'   },
                    }[s] || { cls: 'bg-gray-100 text-gray-500 border-gray-200', label: s.charAt(0).toUpperCase() + s.slice(1) };
                    // ✅ vendor ID untuk pending rows — dari allPOVersions data
                    const pendingVendorId = po.vendorId?.toString() || po._id?.toString();
                    return (
                      <tr key={`pend-${i}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2"><span className="text-xs font-mono text-gray-400 whitespace-nowrap">{po.poNumber || '—'}</span></td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-600 truncate max-w-[120px]" title={po.vendorName}>{po.vendorName}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sCfg.cls} whitespace-nowrap`}>{sCfg.label}</span></td>
                        <td className="px-3 py-2"><QBCell /></td>
                        {/* ✅ View button untuk pending rows juga */}
                        <td className="px-4 py-2">
                          <button
                            onClick={() => window.open(`/admin/purchase-order/${selectedOrder._id}/${pendingVendorId}`, '_blank')}
                            title="View/Edit PO"
                            className="p-1.5 text-[#005670] hover:bg-[#005670]/10 rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination current={poPage} total={totalPoPages} onChange={setPoPage} />
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Project selector ────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 10;
  const filtered   = orders.filter(o => !searchTerm || (o.clientInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil((filtered.length || 0) / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const PKG_CFG    = { investor: { label: 'Nalu', cls: 'bg-blue-100 text-blue-700' }, custom: { label: 'Lani', cls: 'bg-purple-100 text-purple-700' }, library: { label: 'Library', cls: 'bg-teal-100 text-teal-700' } };
  const STATUS_CFG = { ongoing: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Ongoing' }, review: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Review' }, confirmed: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Confirmed' }, completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' }, cancelled: { cls: 'bg-red-50 text-red-600 border-red-200', label: 'Cancelled' } };

  return (
    <div className="space-y-5">
      {confirmModal && <ConfirmModal modal={confirmModal} onClose={closeConfirm} />}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          <Check className="w-4 h-4" />{toast.msg}
        </div>
      )}
      <div><h1 className="text-2xl font-semibold text-gray-800">Finance Hub</h1><p className="text-sm text-gray-400 mt-0.5">Select a project to manage expenses, proposals and vendor bills</p></div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search client or project..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-colors" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#005670]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200"><FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500 font-medium text-sm">No projects found</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Plan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(order => {
                const pkg = PKG_CFG[order.packageType] || PKG_CFG.investor;
                const sts = STATUS_CFG[order.status] || { cls: 'bg-gray-50 text-gray-600 border-gray-200', label: order.status || 'Unknown' };
                return (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">{(order.clientInfo?.name || 'C').charAt(0).toUpperCase()}</div>
                        <div><p className="font-medium text-gray-800 text-sm leading-tight">{order.clientInfo?.name || 'Unknown Client'}</p>{order.clientInfo?.unitNumber && <p className="text-xs text-gray-400 mt-0.5">Unit {order.clientInfo.unitNumber}</p>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.cls}`}>{pkg.label}</span></td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{order.selectedPlan?.title || '—'}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sts.cls}`}>{sts.label}</span></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => selectOrder(order)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005670] text-white rounded-lg text-xs font-semibold hover:bg-[#004558] shadow-sm transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Expenses
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 p-4 border-t border-gray-100">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === page ? 'bg-[#005670] text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;