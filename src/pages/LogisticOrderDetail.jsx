// pages/LogisticOrderDetail.jsx
// Logistic Order Tracker — detail & edit form for a single product line item
import React, { useState } from 'react';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Stage badge (same definition as in Tracker, kept local to avoid coupling) ─
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
      className="inline-block px-2.5 py-1 rounded font-semibold text-sm"
    >
      {cfg.label}
    </span>
  );
};

// ─── Reusable field components ────────────────────────────────────────────────
const ReadField = ({ label, value, mono = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div className={`px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[38px] ${mono ? 'font-mono' : ''}`}>
      {value || <span className="text-gray-300">—</span>}
    </div>
  </div>
);

const EditField = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 bg-white"
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// Stage selector — dropdown 0-5 with live preview badge
const StageField = ({ label, value, onChange, readOnly = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      {readOnly ? (
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 flex-1">
          {value}
        </div>
      ) : (
        <select
          value={value ?? 0}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 bg-white"
        >
          {[0, 1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} — {STAGE_COLORS[n].label}</option>
          ))}
        </select>
      )}
      <StageBadge value={value} />
    </div>
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
      <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
    </div>
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LogisticOrderDetail = ({ entry: initialEntry, statusCategories, onBack, onSaved }) => {
  const [form, setForm]     = useState({ ...initialEntry });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // productId is always set (vendor-based matching guarantees it) → always editable
  const canEdit = !!form.productId;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const url = `${backendServer}/api/logistic/${form.orderId}/${form.productId}`;
      const r = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectCode:         form.projectCode,
          location:            form.location,
          cargoReadyDate:      form.cargoReadyDate,
          shipmentDate:        form.shipmentDate,
          logDrawing:          form.logDrawing,
          logMachining:        form.logMachining,
          logAssembly:         form.logAssembly,
          logFinishing:        form.logFinishing,
          logQcChecking:       form.logQcChecking,
          logPacking:          form.logPacking,
          packingList:         form.packingList,
          containerNumber:     form.containerNumber,
          statusCategory:      form.statusCategory,
          expectedShipDate:    form.expectedShipDate,
          expectedArrivalDate: form.expectedArrivalDate,
          remark:              form.remark,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).message || 'Save failed');
      const d = await r.json();
      if (d.dateInspected) setForm(f => ({ ...f, dateInspected: d.dateInspected }));
      setSuccess('Saved successfully.');
      setTimeout(() => onSaved(), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Recompute derived read-only values from current form state
  const shippedQty  = form.logPacking === 5 ? form.poQuantity : 0;
  const balanceQty  = form.poQuantity - shippedQty;

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#005670] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to list
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-800 truncate max-w-md">
            {form.itemName || 'Product Detail'}
          </h1>
          {form.poNumber && (
            <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {form.poNumber}
            </span>
          )}
        </div>
        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
          This entry has no identifiable product reference — fields are read-only.
        </div>
      )}
      {error   && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
      {success && <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div>}

      {/* ── Section 1: PO / CPM info (read-only from CPM) ── */}
      <Section title="PO / CPM Information (read-only)">
        <ReadField label="PO Number"   value={form.poNumber}  mono />
        <ReadField label="PO Date"     value={form.poDate ? new Date(form.poDate).toLocaleDateString() : ''} />
        <ReadField label="SKU No"      value={form.skuNo}     mono />
        <ReadField label="Item Name"   value={form.itemName} />
        <ReadField label="Vendor"      value={form.vendor} />
        <ReadField label="Unit Price"  value={form.unitPrice != null ? `$${Number(form.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''} />
        <ReadField label="PO Quantity" value={String(form.poQuantity ?? '')} />
        <ReadField label="Total Price" value={form.unitPrice != null ? `$${(Number(form.unitPrice) * (form.poQuantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''} />
        <ReadField label="Description" value={form.description} />
        <ReadField label="Wood Finish"   value={form.woodFinish} />
        <ReadField label="Fabric Finish" value={form.fabricFinish} />
        <ReadField label="Collection"    value={form.collection} />
      </Section>

      {/* ── Section 2: General Information (editable) ── */}
      <Section title="General Information">
        {canEdit
          ? <EditField label="Project Code" value={form.projectCode} onChange={set('projectCode')} placeholder="e.g. PROJ-001" />
          : <ReadField label="Project Code" value={form.projectCode} />}
        <ReadField label="Unit Number"  value={form.unitNumber} />
        {canEdit
          ? <EditField label="Location (Room)" value={form.location} onChange={set('location')} placeholder="e.g. Living Room" />
          : <ReadField label="Location (Room)" value={form.location} />}
        <ReadField label="Shipped Quantity (auto)" value={String(shippedQty)} />
        <ReadField label="Balance Quantity (auto)" value={String(balanceQty)} />
      </Section>

      {/* ── Section 3: Production Stages (editable, with badge) ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Production Stages</h3>
          <div className="flex gap-1 flex-wrap text-xs text-gray-400">
            {Object.entries(STAGE_COLORS).map(([k, v]) => (
              <span key={k} style={{ background: v.bg, color: v.text }} className="px-1.5 py-0.5 rounded font-medium">
                {k}={v.label}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StageField label="Drawing"              value={form.logDrawing}    onChange={set('logDrawing')}    readOnly={!canEdit} />
          <StageField label="Machining"            value={form.logMachining}  onChange={set('logMachining')}  readOnly={!canEdit} />
          <StageField label="Assembly"             value={form.logAssembly}   onChange={set('logAssembly')}   readOnly={!canEdit} />
          <StageField label="Finishing / Upholstery" value={form.logFinishing} onChange={set('logFinishing')} readOnly={!canEdit} />
          <div>
            <StageField label="QC Checking" value={form.logQcChecking} onChange={set('logQcChecking')} readOnly={!canEdit} />
            {form.dateInspected && (
              <p className="mt-1 text-xs text-gray-500">
                Date Inspected: <strong>{form.dateInspected}</strong>
                {form.logQcChecking === 5 && ' (auto-filled)'}
              </p>
            )}
          </div>
          <StageField label="Packing" value={form.logPacking} onChange={set('logPacking')} readOnly={!canEdit} />
        </div>
      </div>

      {/* ── Section 4: Shipment / Status ── */}
      <Section title="Shipment & Status">
        {canEdit ? <EditField label="Cargo Ready Date"      value={form.cargoReadyDate}      onChange={set('cargoReadyDate')}      type="date" /> : <ReadField label="Cargo Ready Date"      value={form.cargoReadyDate} />}
        {canEdit ? <EditField label="Shipment Date"         value={form.shipmentDate}        onChange={set('shipmentDate')}        type="date" /> : <ReadField label="Shipment Date"         value={form.shipmentDate} />}
        {canEdit ? <EditField label="Expected Ship Date"    value={form.expectedShipDate}    onChange={set('expectedShipDate')}    type="date" /> : <ReadField label="Expected Ship Date"    value={form.expectedShipDate} />}
        {canEdit ? <EditField label="Expected Arrival Date" value={form.expectedArrivalDate} onChange={set('expectedArrivalDate')} type="date" /> : <ReadField label="Expected Arrival Date" value={form.expectedArrivalDate} />}
        {canEdit
          ? <SelectField label="Status Category" value={form.statusCategory} onChange={set('statusCategory')} options={statusCategories} />
          : <ReadField   label="Status Category" value={form.statusCategory} />}
        {canEdit ? <EditField label="Container Number" value={form.containerNumber} onChange={set('containerNumber')} placeholder="e.g. CSQU3054383" /> : <ReadField label="Container Number" value={form.containerNumber} />}
        {canEdit ? <EditField label="Packing List"     value={form.packingList}    onChange={set('packingList')}     placeholder="Packing list ref / notes" /> : <ReadField label="Packing List" value={form.packingList} />}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Remark</label>
          {canEdit ? (
            <textarea
              value={form.remark ?? ''}
              onChange={e => set('remark')(e.target.value)}
              rows={3}
              placeholder="Additional notes or remarks…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30 resize-none"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[76px]">
              {form.remark || <span className="text-gray-300">—</span>}
            </div>
          )}
        </div>
      </Section>

      {/* Save button (bottom) */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#005670] text-white rounded-lg text-sm hover:bg-[#004558] transition-colors disabled:opacity-60 font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LogisticOrderDetail;
