// pages/ExpenseManager.jsx
// Admin page for managing Time & Expense entries and generating printable expenses
// per project. Multiple expenses per project supported.
// Print/PDF format mirrors the HDG expense template.

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Printer, X, Save, Loader2, ChevronLeft,
  FileText, DollarSign, Clock, Package, Wrench, Truck,
  ChevronDown, Check, Edit2, Eye, RefreshCw, Search,
} from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Service type config ────────────────────────────────────────────────────
const SERVICE_TYPES = [
  {
    id: 'design',
    label: 'Design',
    icon: '✏️',
    description: 'Design work, Wecora updates, site meetings, measurements, drawings',
    defaultRate: 350,
    unit: 'hr',
  },
  {
    id: 'project_management',
    label: 'Project Management',
    icon: '📋',
    description: 'Sourcing, quoting, client communication, replying to questions',
    defaultRate: 200,
    unit: 'hr',
  },
  {
    id: 'procurement',
    label: 'Procurement / Logistics',
    icon: '🚚',
    description: 'Order and manage samples, shipping coordination, receiving',
    defaultRate: 175,
    unit: 'hr',
  },
  {
    id: 'installation',
    label: 'Installation',
    icon: '🔧',
    description: 'On-site installation supervision and coordination',
    defaultRate: 150,
    unit: 'hr',
  },
  {
    id: 'travel',
    label: 'Travel & Expenses',
    icon: '✈️',
    description: 'Travel time, mileage, accommodation',
    defaultRate: 1,
    unit: 'flat',
  },
  {
    id: 'consultation',
    label: 'Consultation',
    icon: '💬',
    description: 'Client meetings, calls, presentations',
    defaultRate: 300,
    unit: 'hr',
  },
  {
    id: 'custom',
    label: 'Custom / Other',
    icon: '⚙️',
    description: 'Enter custom description',
    defaultRate: 0,
    unit: 'flat',
  },
];

const TAX_RATE_DEFAULT = 4.5; // %

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];
const genExpenseNum = () => {
  // Use timestamp ms + random for guaranteed uniqueness
  const d = new Date();
  const dateStr = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const unique = String(Date.now()).slice(-4) + String(Math.floor(10 + Math.random() * 90));
  return `E-${dateStr}-${unique}`;
};

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  date: today(),
  serviceType: 'design',
  description: '',
  hours: 1,
  rate: 350,
  amount: 350,
  unit: 'hr',
});

const emptyExpense = (orderId, order) => {
  const ci = order?.clientInfo || {};
  return {
    id: `tmp_${Date.now()}`,
    expenseNumber: genExpenseNum(),
    expenseDate: today(),
    orderId,
    // Store client info from order — read-only in editor
    clientInfo: {
      name:         ci.name         || '',
      email:        ci.email        || order?.user?.email || '',
      address:      ci.address      || '',
      cityStateZip: ci.cityStateZip || '',
      unitNumber:   ci.unitNumber   || '',
    },
    projectName: ci.name
      ? `${ci.name}${ci.unitNumber ? ' - ' + ci.unitNumber : ''}`.trim()
      : '',
    taxRate: TAX_RATE_DEFAULT,
    notes: '',
    lines: [emptyLine()],
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
};

// ─── Line Item Row ───────────────────────────────────────────────────────────
const LineRow = ({ line, onChange, onRemove, index }) => {
  const svc = SERVICE_TYPES.find(s => s.id === line.serviceType) || SERVICE_TYPES[0];

  const update = (field, value) => {
    const updated = { ...line, [field]: value };
    // Recalc amount
    if (field === 'hours' || field === 'rate') {
      updated.amount = parseFloat(updated.hours || 0) * parseFloat(updated.rate || 0);
    }
    if (field === 'serviceType') {
      const s = SERVICE_TYPES.find(s => s.id === value);
      if (s) { updated.rate = s.defaultRate; updated.unit = s.unit; updated.amount = updated.hours * s.defaultRate; }
    }
    onChange(updated);
  };

  const inputCls = 'px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white w-full';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 group">
      {/* Date */}
      <td className="px-3 py-2 w-32">
        <input type="date" value={line.date} onChange={e => update('date', e.target.value)} className={inputCls} />
      </td>
      {/* Service Type */}
      <td className="px-3 py-2 w-44">
        <select value={line.serviceType} onChange={e => update('serviceType', e.target.value)} className={`${inputCls} appearance-none`}>
          {SERVICE_TYPES.map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
          ))}
        </select>
      </td>
      {/* Description */}
      <td className="px-3 py-2">
        <textarea
          value={line.description}
          onChange={e => update('description', e.target.value)}
          placeholder={svc.description}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </td>
      {/* Hours/Qty */}
      <td className="px-3 py-2 w-20">
        <input type="number" min="0" step="0.25" value={line.hours}
          onChange={e => update('hours', e.target.value)} className={inputCls} />
      </td>
      {/* Rate */}
      <td className="px-3 py-2 w-28">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input type="number" min="0" step="0.01" value={line.rate}
            onChange={e => update('rate', e.target.value)}
            className={`${inputCls} pl-5`} />
        </div>
      </td>
      {/* Amount */}
      <td className="px-3 py-2 w-28 text-right">
        <span className="text-sm font-semibold text-gray-800">{fmt(line.amount)}</span>
      </td>
      {/* Remove */}
      <td className="px-2 py-2 w-8">
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ─── Print View ──────────────────────────────────────────────────────────────
const PrintView = ({ expense, onClose }) => {
  const [originalTitle] = useState(document.title);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const client = expense.clientInfo?.name?.replace(/\s+/g, '_') || 'Client';
    document.title = `Expense_${expense.expenseNumber}_${client}`;
    return () => { document.title = originalTitle; };
  }, [expense, originalTitle]);

  const subtotal = expense.lines.reduce((s, l) => s + parseFloat(l.amount || 0), 0);
  const taxes    = subtotal * (parseFloat(expense.taxRate || 0) / 100);
  const total    = subtotal + taxes;

  const doPrint = () => {
    setShowInstructions(false);
    setTimeout(() => window.print(), 150);
  };

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        @page { size: letter; margin: 0.6in; }

        .expense-page {
          background: white;
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          padding: 0.5in;
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          color: #1a1a1a;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .inv-header-left h2 {
          font-size: 16pt;
          font-weight: normal;
          margin: 0 0 2px;
          color: #1a1a1a;
        }
        .inv-header-left h3 {
          font-size: 13pt;
          font-weight: normal;
          margin: 0;
          color: #444;
        }
        .inv-logo img {
          height: 44px;
          width: auto;
          filter: brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%);
        }
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20pt;
          font-size: 10pt;
          border: 1px solid #ccc;
        }
        .inv-table th {
          background: #f5f5f5;
          border-bottom: 1px solid #ccc;
          padding: 6px 8px;
          text-align: left;
          font-weight: bold;
        }
        .inv-table th.right { text-align: right; }
        .inv-table td {
          border: none;
          padding: 8px;
          vertical-align: top;
        }
        .inv-table td.right { text-align: right; }
        .inv-table td.center { text-align: center; }
        .inv-table tbody tr:last-child td { padding-bottom: 10px; }
        /* Footer always at bottom of page */
        .expense-page {
          display: flex;
          flex-direction: column;
        }
        .expense-page-body {
          flex: 1;
        }
        .inv-footer-address {
          text-align: center;
          font-size: 9pt;
          color: #555;
          border-top: 1px solid #ddd;
          padding-top: 8pt;
          margin-top: auto;
          padding-bottom: 0;
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <span className="text-sm font-semibold text-[#005670]">{expense.expenseNumber}</span>
          <span className="text-sm text-gray-500">— {expense.projectName}</span>
        </div>
        <button onClick={() => setShowInstructions(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable expense */}
      <div className="print-area bg-gray-100 min-h-screen py-8">
        <div className="expense-page shadow-md">

          {/* Top header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20pt' }}>
            <div className="inv-header-left">
              <h2>Henderson Design Group</h2>
              <h3>Time &amp; Expenses Invoice</h3>
            </div>
            <div className="inv-logo">
              <img src="/images/HDG-Logo.png" alt="Henderson Design Group" />
            </div>
          </div>

          {/* Client + Expense meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16pt' }}>
            <div style={{ fontSize: '10pt', lineHeight: '1.7' }}>
              <div style={{ fontWeight: 'bold' }}>{expense.clientInfo?.name || '—'}</div>
              {expense.clientInfo?.address && <div>{expense.clientInfo.address}</div>}
              {expense.clientInfo?.cityStateZip && <div>{expense.clientInfo.cityStateZip}</div>}
              {expense.clientInfo?.email && <div>{expense.clientInfo.email}</div>}
            </div>
            <div style={{ fontSize: '10pt', textAlign: 'right', lineHeight: '1.7' }}>
              <div><strong>Expense # :</strong>&nbsp; {expense.expenseNumber}</div>
              <div><strong>Expense Date:</strong>&nbsp; {new Date(expense.expenseDate + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Project */}
          {expense.projectName && (
            <div style={{ fontSize: '10pt', marginBottom: '16pt' }}>
              <strong>Project:</strong> {expense.projectName}
            </div>
          )}

          {/* Body — fills available space, pushes footer down */}
          <div className="expense-page-body">
          {/* Line items table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '72pt' }}>Date</th>
                <th>Description / Service</th>
                <th className="right" style={{ width: '44pt' }}>Hours</th>
                <th className="right" style={{ width: '56pt' }}>Rate</th>
                <th className="right" style={{ width: '64pt' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expense.lines.map((line, i) => {
                const svc = SERVICE_TYPES.find(s => s.id === line.serviceType);
                return (
                  <tr key={i}>
                    <td style={{ fontSize: '9.5pt', whiteSpace: 'nowrap' }}>
                      {line.date ? new Date(line.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : ''}
                    </td>
                    <td style={{ fontSize: '9.5pt' }}>
                      {svc && svc.id !== 'custom' && (
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{svc.label}:</div>
                      )}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{line.description}</div>
                    </td>
                    <td className="right" style={{ fontSize: '9.5pt' }}>
                      {parseFloat(line.hours || 0).toFixed(2)}
                    </td>
                    <td className="right" style={{ fontSize: '9.5pt' }}>{fmt(line.rate)}</td>
                    <td className="right" style={{ fontSize: '9.5pt', fontWeight: 'bold' }}>{fmt(line.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Notes */}
          {expense.notes && (
            <div style={{ marginTop: '14pt', fontSize: '9.5pt', color: '#444', whiteSpace: 'pre-wrap' }}>
              {expense.notes}
            </div>
          )}

          {/* Totals */}
          <div style={{ marginTop: '20pt', display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ fontSize: '10pt', borderCollapse: 'collapse', minWidth: '220pt' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 16px 3px 0', textAlign: 'right' }}><strong>Subtotal:</strong></td>
                  <td style={{ padding: '3px 0', textAlign: 'right', minWidth: '70pt' }}>{fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 16px 3px 0', textAlign: 'right' }}><strong>Taxes:</strong></td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>{fmt(taxes)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 16px 3px 0', textAlign: 'right', borderTop: '1px solid #999' }}><strong>Total:</strong></td>
                  <td style={{ padding: '6px 0 3px 0', textAlign: 'right', borderTop: '1px solid #999', fontWeight: 'bold' }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          </div>{/* end expense-page-body */}

          {/* Footer — always at bottom */}
          <div className="inv-footer-address">
            Henderson Design Group . 4343 Royal Place, Honolulu, HI, 96816.<br />
            Phone: (808) 315-8782 . Fax: . Email: ami@henderson.house
          </div>
        </div>
      </div>

      {/* Print instructions modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-5 rounded-t-xl flex justify-between items-center">
              <h3 className="font-semibold">Print / Save as PDF</h3>
              <button onClick={() => setShowInstructions(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { n: 1, t: 'Destination', d: 'Select "Save as PDF" or your printer' },
                { n: 2, t: 'Headers & Footers', d: 'Uncheck to remove browser headers' },
                { n: 3, t: 'Margins', d: 'Set to "None" or "Minimum"' },
                { n: 4, t: 'Background Graphics', d: 'Enable for full color output' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#005670] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</div>
                  <div><p className="font-semibold text-sm text-gray-900">{s.t}</p><p className="text-xs text-gray-500">{s.d}</p></div>
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowInstructions(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
                <button onClick={doPrint} className="px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
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
  const [inv, setInv] = useState(initial);
  const [saving, setSaving] = useState(false);

  const upd = (field, value) => setInv(prev => ({ ...prev, [field]: value }));
  const updClient = (field, value) => setInv(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, [field]: value } }));

  const addLine = () => setInv(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  const removeLine = (id) => setInv(prev => ({ ...prev, lines: prev.lines.filter(l => l.id !== id) }));
  const updateLine = (id, updated) => setInv(prev => ({ ...prev, lines: prev.lines.map(l => l.id === id ? updated : l) }));

  const addServiceBlock = (svcId) => {
    const svc = SERVICE_TYPES.find(s => s.id === svcId);
    if (!svc) return;
    setInv(prev => ({
      ...prev,
      lines: [...prev.lines, {
        ...emptyLine(),
        serviceType: svc.id,
        rate: svc.defaultRate,
        unit: svc.unit,
        amount: svc.defaultRate,
        description: svc.description,
      }]
    }));
  };

  const subtotal = inv.lines.reduce((s, l) => s + parseFloat(l.amount || 0), 0);
  const taxes    = subtotal * (parseFloat(inv.taxRate || 0) / 100);
  const total    = subtotal + taxes;

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to list
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onPrint(inv)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Eye className="w-4 h-4" /> Preview & Print
          </button>
          <button onClick={() => onSave(inv)} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-semibold hover:bg-[#004558] disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: meta only — client info is read-only from order */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Expense Details</h3>
              <div className="text-right">
                <p className="text-xs text-gray-400">Expense #</p>
                <p className="text-sm font-mono font-semibold text-[#005670]">{inv.expenseNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expense Date</label>
                <input type="date" value={inv.expenseDate} onChange={e => upd('expenseDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={inv.status} onChange={e => upd('status', e.target.value)} className={`${inputCls} bg-white`}>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="paid">Paid</option>
                </select>
                <p className="text-[10px] text-amber-600 mt-1">⚠ Once Confirmed, expense is locked</p>
              </div>
            </div>
          </div>

          {/* Client info — read-only, pulled from order */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              Client Info
              <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full normal-case tracking-normal">from project</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Name</p>
                <p className="font-medium text-gray-800">{inv.clientInfo?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Project</p>
                <p className="font-medium text-gray-800">{inv.projectName || '—'}</p>
              </div>
              {inv.clientInfo?.email && <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-gray-700">{inv.clientInfo.email}</p>
              </div>}
              {(inv.clientInfo?.address || inv.clientInfo?.cityStateZip) && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Address</p>
                  <p className="text-gray-700">{[inv.clientInfo?.address, inv.clientInfo?.cityStateZip].filter(Boolean).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: totals + tax + quick add */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Totals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax Rate (%)</span>
                <input type="number" min="0" step="0.1" value={inv.taxRate}
                  onChange={e => upd('taxRate', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right" />
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span><span>{fmt(taxes)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 text-[#005670]">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Quick Add Service</h3>
            <div className="space-y-1.5">
              {SERVICE_TYPES.map(s => (
                <button key={s.id} onClick={() => addServiceBlock(s.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#005670]/5 hover:text-[#005670] rounded-lg transition-colors text-left">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                  {s.defaultRate > 0 && <span className="ml-auto text-xs text-gray-400">${s.defaultRate}/{s.unit}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Notes</h3>
            <textarea value={inv.notes} onChange={e => upd('notes', e.target.value)}
              placeholder="Additional notes, re: items list, payment terms..."
              rows={4} className={`${inputCls} resize-none text-xs`} />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Line Items ({inv.lines.length})</h3>
          <button onClick={addLine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005670] text-white rounded-lg text-xs font-semibold hover:bg-[#004558]">
            <Plus className="w-3.5 h-3.5" /> Add Line
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left w-32">Date</th>
                <th className="px-3 py-2 text-left w-44">Type</th>
                <th className="px-3 py-2 text-left">Description / Service</th>
                <th className="px-3 py-2 text-right w-20">Hours/Qty</th>
                <th className="px-3 py-2 text-right w-28">Rate</th>
                <th className="px-3 py-2 text-right w-28">Amount</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((line, i) => (
                <LineRow key={line.id} line={line} index={i}
                  onChange={(updated) => updateLine(line.id, updated)}
                  onRemove={() => removeLine(line.id)} />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={5} className="px-3 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                <td className="px-3 py-3 text-right text-base font-bold text-[#005670]">{fmt(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Status config ────────────────────────────────────────────────────────────
// confirmed = locked: cannot edit/delete; print only available at confirmed+
const EXPENSE_STATUS = {
  draft:     { label: 'Draft',     dot: 'bg-gray-400',    pill: 'bg-gray-100 text-gray-600 border-gray-200',      locked: false },
  review:    { label: 'Review',    dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 border-amber-200',    locked: false },
  confirmed: { label: 'Confirmed', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', locked: true  },
  paid:      { label: 'Paid',      dot: 'bg-blue-500',    pill: 'bg-blue-50 text-blue-700 border-blue-200',       locked: true  },
};

const StatusPill = ({ status }) => {
  const cfg = EXPENSE_STATUS[status] || EXPENSE_STATUS.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
};

// ─── Expense List (per project) ──────────────────────────────────────────────
const ExpenseList = ({ order, expenses, onNew, onEdit, onPrint, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{order.clientInfo?.name}</h2>
          <p className="text-sm text-gray-500">
            {order.clientInfo?.unitNumber ? `Unit ${order.clientInfo.unitNumber} · ` : ''}
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-semibold hover:bg-[#004558] shadow-sm">
          <Plus className="w-4 h-4" /> New Expense
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
        {Object.entries(EXPENSE_STATUS).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
            {cfg.locked && <span className="text-gray-300">🔒</span>}
          </span>
        ))}
        <span className="ml-2 text-gray-300">|</span>
        <span className="text-gray-400">🔒 = locked after Confirmed</span>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No expenses yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "New Expense" to create your first expense</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(exp => {
                const subtotal  = (exp.lines || []).reduce((s, l) => s + parseFloat(l.amount || 0), 0);
                const total     = subtotal * (1 + parseFloat(exp.taxRate || 0) / 100);
                const statusCfg = EXPENSE_STATUS[exp.status] || EXPENSE_STATUS.draft;
                const locked    = statusCfg.locked;
                const canPrint  = locked; // only confirmed / paid
                const canEdit   = !locked;
                const canDelete = !locked;

                return (
                  <tr key={exp.id || exp._id} className={`transition-colors ${locked ? 'bg-gray-50/30' : 'hover:bg-gray-50/50'}`}>
                    {/* Expense # */}
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono font-medium text-[#005670]">{exp.expenseNumber}</span>
                      {locked && <span className="ml-2 text-[10px] text-gray-400">🔒</span>}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {exp.expenseDate ? new Date(exp.expenseDate + 'T12:00:00').toLocaleDateString('en-US') : '—'}
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3.5 text-sm text-gray-700">{exp.projectName || '—'}</td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={exp.status} />
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 text-right">{fmt(total)}</td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">

                        {/* Print — only when confirmed/paid */}
                        <div className="relative group">
                          <button
                            onClick={() => canPrint && onPrint(exp)}
                            disabled={!canPrint}
                            title={canPrint ? 'Print / Save PDF' : 'Only available after Confirmed'}
                            className={`p-1.5 rounded-lg transition-all ${
                              canPrint
                                ? 'text-[#005670] hover:bg-[#005670]/5'
                                : 'text-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {!canPrint && (
                            <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Confirm first to print
                            </div>
                          )}
                        </div>

                        {/* Edit — locked after confirmed */}
                        <div className="relative group">
                          <button
                            onClick={() => canEdit && onEdit(exp)}
                            disabled={!canEdit}
                            title={canEdit ? 'Edit expense' : 'Locked — confirmed expenses cannot be edited'}
                            className={`p-1.5 rounded-lg transition-all ${
                              canEdit
                                ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                : 'text-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!canEdit && (
                            <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Locked
                            </div>
                          )}
                        </div>

                        {/* Delete — only draft/review */}
                        <div className="relative group">
                          <button
                            onClick={() => canDelete && onDelete(exp.id || exp._id)}
                            disabled={!canDelete}
                            title={canDelete ? 'Delete expense' : 'Cannot delete confirmed expenses'}
                            className={`p-1.5 rounded-lg transition-all ${
                              canDelete
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {!canDelete && (
                            <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Locked
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ExpenseManager = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expenses, setExpenses]       = useState([]);  // expenses for selected order
  const [view, setView]               = useState('orders'); // 'orders' | 'list' | 'editor' | 'print'
  const [editingExpense, setEditingExpense] = useState(null);
  const [printExpense, setPrintExpense]     = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Load orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders?limit=100&status=all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders((data.orders || []).filter(o => o.selectedPlan));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load expenses for an order ───────────────────────────────────────────
  const loadExpenses = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/expenses?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      } else {
        setExpenses([]);
      }
    } catch {
      setExpenses([]);
    }
  };

  // ─── Save expense ─────────────────────────────────────────────────────────
  const saveExpense = async (inv) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = inv.id?.startsWith('tmp_');
      const url    = isNew
        ? `${backendServer}/api/expenses`
        : `${backendServer}/api/expenses/${inv.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = { ...inv, orderId: selectedOrder._id };
      if (isNew) delete payload.id;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        showToast('Expense saved successfully');
        await loadExpenses(selectedOrder._id);
        setView('list');
        setEditingExpense(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to save expense', 'error');
      }
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete expense ───────────────────────────────────────────────────────
  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendServer}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(prev => prev.filter(i => i.id !== id));
      showToast('Expense deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  // ─── Select order ────────────────────────────────────────────────────────
  const selectOrder = async (order) => {
    setSelectedOrder(order);
    await loadExpenses(order._id);
    setView('list');
  };

  // ─── Print view ───────────────────────────────────────────────────────────
  if (view === 'print' && printExpense) {
    return <PrintView expense={printExpense} onClose={() => setView(editingExpense ? 'editor' : 'list')} />;
  }

  // ─── Editor view ─────────────────────────────────────────────────────────
  if (view === 'editor' && editingExpense) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <ExpenseEditor
          expense={editingExpense}
          onSave={saveExpense}
          onCancel={() => { setView('list'); setEditingExpense(null); }}
          onPrint={(inv) => { setPrintExpense(inv); setView('print'); }}
        />
      </div>
    );
  }

  // ─── Expense list (per order) ─────────────────────────────────────────────
  if (view === 'list' && selectedOrder) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-4">
        <button onClick={() => { setView('orders'); setSelectedOrder(null); setExpenses([]); }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <ChevronLeft className="w-4 h-4" /> All Projects
        </button>
        <ExpenseList
          order={selectedOrder}
          expenses={expenses}
          onNew={() => {
            setEditingExpense(emptyExpense(selectedOrder._id, selectedOrder));
            setView('editor');
          }}
          onEdit={(inv) => { setEditingExpense(inv); setView('editor'); }}
          onPrint={(inv) => { setPrintExpense(inv); setView('print'); }}
          onDelete={deleteExpense}
        />
      </div>
    );
  }

  // ─── Project selector — paginated table ──────────────────────────────────
  const ITEMS_PER_PAGE = 10;

  const filtered = orders.filter(o =>
    !searchTerm || (o.clientInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filtered.length || 0) / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const PKG_CFG = {
    investor: { label: 'Nalu',    cls: 'bg-blue-100 text-blue-700'   },
    custom:   { label: 'Lani',    cls: 'bg-purple-100 text-purple-700' },
    library:  { label: 'Library', cls: 'bg-teal-100 text-teal-700'   },
  };

  const STATUS_CFG = {
    ongoing:   { cls: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'Ongoing'   },
    review:    { cls: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Review'    },
    confirmed: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',label: 'Confirmed' },
    completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    cancelled: { cls: 'bg-red-50 text-red-600 border-red-200',        label: 'Cancelled' },
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          <Check className="w-4 h-4" />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Expense Manager</h1>
          <p className="text-sm text-gray-400 mt-0.5">Select a project to manage expenses</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search client or project..." value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-colors" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">No projects found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(order => {
                const pkg = PKG_CFG[order.packageType] || PKG_CFG.investor;
                const sts = STATUS_CFG[order.status]   || { cls: 'bg-gray-50 text-gray-600 border-gray-200', label: order.status || 'Unknown' };
                return (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {(order.clientInfo?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm leading-tight">{order.clientInfo?.name || 'Unknown Client'}</p>
                          {order.clientInfo?.unitNumber && (
                            <p className="text-xs text-gray-400 mt-0.5">Unit {order.clientInfo.unitNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Package */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.cls}`}>{pkg.label}</span>
                    </td>
                    {/* Floor plan */}
                    <td className="px-4 py-3.5 text-sm text-gray-500">{order.selectedPlan?.title || '—'}</td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sts.cls}`}>
                        {sts.label}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => selectOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005670] text-white rounded-lg text-xs font-semibold hover:bg-[#004558] shadow-sm transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Expenses
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 p-4 border-t border-gray-100">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                    ${currentPage === page ? 'bg-[#005670] text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center">›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;