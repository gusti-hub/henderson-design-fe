import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, CheckCircle, Clock, AlertCircle, RefreshCw, Building2, DollarSign, Edit3, Save } from 'lucide-react';
import { backendServer } from '../utils/info';

const BANK_OPTIONS = {
  schwab: {
    label: 'Charles Schwab (via Citibank N.A.)',
    steps: [
      {
        title: 'STEP 1 — SEND TO SCHWAB (RECEIVING BANK)',
        fields: [
          { label: 'Bank Name', value: 'Citibank N.A., New York' },
          { label: 'Bank Address', value: '399 Park Avenue, New York, NY 10022' },
          { label: 'Routing Number', value: '021000089' },
          { label: 'Account Name (FBO)', value: 'Charles Schwab & Co., Inc.' },
          { label: 'Account Number', value: '4055-3953' },
        ],
      },
    ],
  },
  boa: {
    label: 'Bank of Hawaii',
    steps: [
      {
        title: 'WIRE TRANSFER — BANK OF HAWAII',
        fields: [
          { label: 'Destination Bank', value: 'Bank of Hawaii' },
          { label: 'Bank Address', value: 'Hawaii Island Commercial Banking Center\n74-5457 Makala Blvd., Kailua-Kona, HI 96740' },
          { label: 'Branch', value: 'Kona Banking Center' },
          { label: 'ABA / Routing', value: '121301028' },
          { label: 'SWIFT ID', value: 'BOHIUS77' },
          { label: 'Account Name', value: 'Eric Henderson Design Group, Inc.' },
          { label: 'Account Number', value: '0090-836617' },
          { label: 'Account Address', value: '4343 Royal Place, Honolulu, HI 96816-4809' },
          { label: 'Memo / Reference', value: "Sender's Name & Invoice Number" },
        ],
      },
    ],
  },
};

const STATUS_CFG = {
  pending:    { label: 'Pending',    cls: 'bg-gray-100 text-gray-600',    icon: Clock },
  received:   { label: 'Received',   cls: 'bg-blue-100 text-blue-700',    icon: RefreshCw },
  processing: { label: 'Processing', cls: 'bg-amber-100 text-amber-700',  icon: AlertCircle },
  confirmed:  { label: 'Confirmed',  cls: 'bg-green-100 text-green-700',  icon: CheckCircle },
};

const fmt = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

const ClientPaymentModal = ({ orderId, clientName, onClose }) => {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [data, setData]         = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newItem, setNewItem]   = useState(null);
  const [toast, setToast]       = useState(null);

  const token = () => localStorage.getItem('token');
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { load(); }, [orderId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendServer}/api/payments/${orderId}/settings`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await res.json();
      setData(d.data || { orderId, enabled: false, bankOption: 'boa', clientInstructions: '', payments: [] });
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const patchSettings = async (patch) => {
    setSaving(true);
    try {
      const res = await fetch(`${backendServer}/api/payments/${orderId}/settings`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const d = await res.json();
      if (d.success) setData(d.data);
      else showToast(d.message || 'Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const addItem = async () => {
    if (!newItem?.description || !newItem?.amount) return showToast('Description and amount are required', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${backendServer}/api/payments/${orderId}/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const d = await res.json();
      if (d.success) { setData(d.data); setNewItem(null); showToast('Payment added'); }
      else showToast(d.message || 'Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const saveItem = async (itemId) => {
    setSaving(true);
    try {
      const res = await fetch(`${backendServer}/api/payments/${orderId}/items/${itemId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const d = await res.json();
      if (d.success) { setData(d.data); setEditingId(null); showToast('Updated'); }
      else showToast(d.message || 'Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this payment item?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${backendServer}/api/payments/${orderId}/items/${itemId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await res.json();
      if (d.success) { setData(d.data); showToast('Deleted'); }
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const totalAmount = data?.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;
  const totalConfirmed = data?.payments?.filter(p => p.status === 'confirmed').reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Payment Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">{clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Toggle + Bank */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Visibility toggle */}
              <div className="flex-1 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Show Payment Tab to Client</p>
                  <p className="text-xs text-gray-400 mt-0.5">Client will see bank info + payment status</p>
                </div>
                <button
                  onClick={() => patchSettings({ enabled: !data.enabled })}
                  disabled={saving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${data.enabled ? 'bg-[#005670]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Bank selection */}
              <div className="flex-1 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank to Show Client</p>
                <div className="flex gap-2">
                  {Object.entries(BANK_OPTIONS).map(([key, opt]) => (
                    <button
                      key={key}
                      onClick={() => patchSettings({ bankOption: key })}
                      disabled={saving}
                      className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${data.bankOption === key ? 'bg-[#005670] text-white border-[#005670]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#005670]/40'}`}
                    >
                      <Building2 className="w-3 h-3 mx-auto mb-0.5" />
                      {key === 'schwab' ? 'Schwab' : 'Bank of Hawaii'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bank preview */}
            <div className="rounded-xl border border-[#005670]/20 bg-[#005670]/5 p-4">
              <p className="text-xs font-bold text-[#005670] uppercase tracking-wide mb-3">{BANK_OPTIONS[data.bankOption].label} — Wire Instructions</p>
              {BANK_OPTIONS[data.bankOption].steps.map((step, si) => (
                <div key={si}>
                  <p className="text-[11px] font-bold text-gray-700 mb-2">{step.title}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {step.fields.map((f, fi) => (
                      <div key={fi} className={f.label === 'Bank Address' || f.label === 'Account Address' ? 'col-span-2' : ''}>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{f.label}: </span>
                        <span className="text-xs text-gray-800 font-medium whitespace-pre-line">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Client instructions */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Instructions to Client (shown below bank info)</p>
              <textarea
                value={data.clientInstructions}
                onChange={e => setData(prev => ({ ...prev, clientInstructions: e.target.value }))}
                onBlur={() => patchSettings({ clientInstructions: data.clientInstructions })}
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#005670]/30 resize-none"
                placeholder="e.g. After completing your wire transfer, please notify your Project Manager (CEE) with your sender name and invoice number as reference."
              />
            </div>

            {/* Payment items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">Payment Schedule</p>
                  <p className="text-xs text-gray-400">Total: {fmt(totalAmount)} · Confirmed: {fmt(totalConfirmed)}</p>
                </div>
                <button
                  onClick={() => setNewItem({ description: '', amount: '', dueDate: '', notes: '' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#005670] rounded-lg hover:bg-[#004a60] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </button>
              </div>

              {/* New item form */}
              {newItem && (
                <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-800 mb-3">New Payment Item</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Description *</label>
                      <input className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Deposit 50%" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Amount (USD) *</label>
                      <input type="number" className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={newItem.amount} onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Due Date</label>
                      <input type="date" className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={newItem.dueDate} onChange={e => setNewItem(p => ({ ...p, dueDate: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                      <input className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={newItem.notes} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addItem} disabled={saving} className="px-4 py-1.5 text-xs font-semibold bg-[#005670] text-white rounded-lg hover:bg-[#004a60] disabled:opacity-50">Save</button>
                    <button onClick={() => setNewItem(null)} className="px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              )}

              {data.payments?.length === 0 && !newItem ? (
                <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <DollarSign className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  No payment items yet. Click "Add Payment" to create billing entries.
                </div>
              ) : (
                <div className="space-y-2">
                  {(data.payments || []).map((item) => {
                    const isEditing = editingId === item._id?.toString();
                    const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={item._id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {isEditing ? (
                          <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="col-span-2">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                                <input className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.description ?? item.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
                                <input type="number" className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.amount ?? item.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Due Date</label>
                                <input type="date" className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.dueDate ?? item.dueDate ?? ''} onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                                <select className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.status ?? item.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                  {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Received Date</label>
                                <input type="date" className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.receivedDate ?? item.receivedDate ?? ''} onChange={e => setEditForm(p => ({ ...p, receivedDate: e.target.value }))} />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                                <input className="mt-0.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005670]/30" value={editForm.notes ?? item.notes ?? ''} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveItem(item._id)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#005670] text-white rounded-lg hover:bg-[#004a60] disabled:opacity-50"><Save className="w-3 h-3" /> Save</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-3 flex items-center gap-3">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.cls} flex-shrink-0`}>
                              <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.description}</p>
                              <p className="text-xs text-gray-400">
                                {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                                {item.receivedDate ? ` · Received: ${new Date(item.receivedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                                {item.notes ? ` · ${item.notes}` : ''}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(item.amount)}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => { setEditingId(item._id?.toString()); setEditForm({}); }} className="p-1.5 text-gray-400 hover:text-[#005670] hover:bg-[#005670]/10 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteItem(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">Changes save automatically</p>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#005670]'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ClientPaymentModal;
