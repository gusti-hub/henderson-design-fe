// components/BillInvoiceEditor.jsx
// Bill Invoice — editable accounting document derived from a PO version.
// Accountants modify prices here; this is what gets sent to QuickBooks (not the PO).

import React, { useState, useEffect } from 'react';
import { X, Save, Printer, ChevronLeft, Loader2, RefreshCw, Send, GitCompare } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Inline image with print-safe base64 ─────────────────────────────────────
const PrintSafeImage = ({ src, alt, style, fallback }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [failed, setFailed]   = useState(false);

  useEffect(() => {
    if (!src) { setFailed(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res  = await fetch(src, { mode: 'cors' });
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => { if (!cancelled) setDataUrl(reader.result); };
        reader.readAsDataURL(blob);
      } catch {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (cancelled) return;
          try {
            const canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            setDataUrl(canvas.toDataURL());
          } catch { setFailed(true); }
        };
        img.onerror = () => { if (!cancelled) setFailed(true); };
        img.src = src;
      }
    })();
    return () => { cancelled = true; };
  }, [src]);

  if (failed || (!dataUrl && !src)) return fallback || null;
  return <img src={dataUrl || src} alt={alt || ''} style={style} onError={() => setFailed(true)} />;
};

// ─── Line-type options (same as PO) ──────────────────────────────────────────
const LINE_TYPES = [
  'Product','FDI','FDI-Vendor','Other','Design Fees',
  'Expediting','Hours','Labor','Reimbursable','Project Management Fees','Sales',
];

const COMPANY_ADDRESS = {
  street: '4343 Royal Place',
  city:   'Honolulu, HI, 96816',
  phone:  '(808) 315-8782',
};

const fmt2 = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Main Component ───────────────────────────────────────────────────────────
// Props:
//   orderId      — order ID
//   vendorId     — vendor ID
//   poVersionId  — POVersion._id (required to link Bill Invoice)
//   poNumber     — display string (e.g. "PO-001")
//   onClose      — called to dismiss the editor
const BillInvoiceEditor = ({ orderId, vendorId, poVersionId, poNumber, onClose }) => {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [billData, setBillData]       = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [products, setProducts]       = useState([]);
  const [livePoProducts, setLivePoProducts] = useState([]);
  const [poReference, setPoReference]     = useState(null); // { additionalLines, shipping, others, subTotal }
  const [additionalLines, setAdditionalLines] = useState([]);
  const [headerFields, setHeaderFields] = useState({
    billNumber: '', poNumber: '', orderDate: '', accountNumber: '',
    repName: '', repPhone: '', repEmail: '', terms: '', estimateNumber: '',
    comments: '', notes: '', shipping: 0, others: 0,
  });
  const [vendorInfo, setVendorInfo]   = useState({});
  const [shipTo, setShipTo]           = useState({});
  const [clientInfo, setClientInfo]   = useState({});
  const [billStatus, setBillStatus]   = useState('draft');
  const [savingStatus, setSavingStatus] = useState(false);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [toast, setToast]             = useState(null);
  const [originalTitle]               = useState(document.title);

  const printedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  useEffect(() => { loadBillInvoice(); }, [orderId, vendorId, poVersionId]);

  useEffect(() => {
    if (billData) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      document.title = `BillInvoice_${client}_${vendor}_${billData.billNumber || ''}`;
    }
    return () => { document.title = originalTitle; };
  }, [billData, vendorInfo, clientInfo, originalTitle]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load (GET or create) ──────────────────────────────────────────────────
  const loadBillInvoice = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/bill-invoice?poVersionId=${poVersionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to load');
      // Backend always returns products enriched from POVersion + order (same as PO editor)
      hydrate(result.data);
      setLivePoProducts(result.data.products || []);
      if (result.data._poSubTotal != null) {
        setPoReference({
          additionalLines: result.data._poAdditionalLines || [],
          shipping: result.data._poShipping || 0,
          others:   result.data._poOthers   || 0,
          subTotal: result.data._poSubTotal || 0,
        });
      }
    } catch (err) {
      showToast('Failed to load Bill Invoice: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const hydrate = (data) => {
    setBillData(data);
    setBillStatus(data.status || 'draft');
    setProducts(data.products || []);
    setAdditionalLines(data.additionalLines || []);
    setVendorInfo(data.vendorInfo || {});
    setShipTo(data.shipTo || {});
    setClientInfo(data.clientInfo || {});
    setHeaderFields({
      billNumber:    data.billNumber    || '',
      poNumber:      data.poNumber      || poNumber || '',
      orderDate:     data.orderDate ? new Date(data.orderDate).toISOString().split('T')[0] : '',
      accountNumber: data.accountNumber || '',
      repName:       data.repName       || '',
      repPhone:      data.repPhone      || '',
      repEmail:      data.repEmail      || '',
      terms:         data.terms         || '',
      estimateNumber:data.estimateNumber|| '',
      comments:      data.comments      || '',
      notes:         data.notes         || '',
      shipping:      data.shipping      || 0,
      others:        data.others        || 0,
    });
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const calcTotals = () => {
    const productSub = products.reduce((s, p) => {
      const net = (p.selectedOptions?.netCostOverride != null && p.selectedOptions?.netCostOverride !== '')
        ? parseFloat(p.selectedOptions.netCostOverride)
        : parseFloat(p.unitPrice || 0);
      return s + net * (p.quantity || 1);
    }, 0);
    const addSub = additionalLines.reduce((s, al) => s + (parseFloat(al.amount) || 0), 0);
    const subTotal = productSub + addSub;
    const shipping = parseFloat(headerFields.shipping) || 0;
    const others   = parseFloat(headerFields.others)   || 0;
    return { subTotal, shipping, others, total: subTotal + shipping + others };
  };

  const totals = calcTotals();

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        orderDate:      headerFields.orderDate,
        accountNumber:  headerFields.accountNumber,
        repName:        headerFields.repName,
        repPhone:       headerFields.repPhone,
        repEmail:       headerFields.repEmail,
        terms:          headerFields.terms,
        estimateNumber: headerFields.estimateNumber,
        comments:       headerFields.comments,
        notes:          headerFields.notes,
        shipping:       parseFloat(headerFields.shipping) || 0,
        others:         parseFloat(headerFields.others)   || 0,
        products,
        additionalLines,
        subTotal: totals.subTotal,
        total:    totals.total,
        status:   billStatus,
      };

      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/bill-invoice?poVersionId=${poVersionId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Save failed');
      hydrate(result.data);
      showToast('Bill Invoice saved!');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Status change ─────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/bill-invoice?poVersionId=${poVersionId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      setBillStatus(newStatus);
    } catch { showToast('Status update failed', 'error'); }
    finally { setSavingStatus(false); }
  };

  // ── Sync to QuickBooks ────────────────────────────────────────────────────
  const handleSyncToQB = async (force = false) => {
    if (!billData?._id) return;
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const url   = `${backendServer}/api/quickbooks/sync-bill-invoice/${billData._id}${force ? '?force=true' : ''}`;
      const res   = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setSyncSuccess(true);
      showToast(`Synced to QuickBooks! QB ID: ${result.quickbooksId}`);
      setTimeout(() => setSyncSuccess(false), 4000);
      await loadBillInvoice(); // refresh to show QB id + synced status
    } catch (err) {
      showToast('QB Sync failed: ' + err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (billData) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      document.title = `BillInvoice_${client}_${vendor}_${headerFields.billNumber}`;
    }
    setTimeout(() => window.print(), 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]" />
      </div>
    );
  }

  const isAlreadySynced = !!billData?.quickbooksId;

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-auto">
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .bill-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; border: none !important; }
        }
        @page { size: 8.5in 11in; margin: 0.5in; }
        .bill-page {
          background: white; max-width: 8.5in; margin: 0 auto;
          padding: 0.5in; font-family: Arial, sans-serif; font-size: 11px;
        }
        .po-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .po-table th { background: #f0f0f0; border: 1px solid #ccc; padding: 5px 8px; font-size: 11px; font-weight: bold; }
        .po-table td { border: 1px solid #ddd; vertical-align: top; padding: 6px 8px; }
        .img-cell { width: 120px; text-align: center; }
        .img-placeholder { width: 100px; height: 80px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; margin: 0 auto; }
        .desc-cell { }
        .price-cell { width: 110px; text-align: right; font-size: 11px; }
        .po-input { background: transparent; border: none; outline: none; font-size: 11px; font-family: Arial, sans-serif; width: 100%; }
        .po-input:focus { background: #f8f9fa; border-radius: 2px; }
        .desc-row { display: flex; gap: 8px; margin-bottom: 2px; }
        .desc-row-label { color: #555; font-size: 10px; min-width: 64px; flex-shrink: 0; }
        .desc-row-value { flex: 1; font-size: 11px; word-break: break-word; }
        .po-field-label { color: #555; font-size: 10px; }
        .po-totals-row td { border: none; padding: 2px 8px; }
        .total-final td { border-top: 2px solid #333 !important; }
        .sidemark-strip { display: block; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #ccc; font-size: 10px; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white no-print ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to PO
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[#005670]">{headerFields.billNumber || 'Bill Invoice'}</span>
            <span className="text-xs text-gray-400">Ref: {headerFields.poNumber}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <select
              value={billStatus}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={savingStatus || billStatus === 'synced'}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer appearance-none ${
                billStatus === 'draft'     ? 'bg-yellow-100 text-yellow-700' :
                billStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              } ${savingStatus ? 'opacity-50' : ''}`}
            >
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              {billStatus === 'synced' && <option value="synced">Synced to QB</option>}
            </select>
            {savingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          </div>

          {/* QB sync badge */}
          {isAlreadySynced && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xs text-blue-700 font-semibold">QB: {billData.quickbooksId}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {billData?.originalProducts?.length > 0 && (
            <button
              onClick={() => setShowComparison(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showComparison ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Compare PO
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>

          {/* Sync to QB */}
          {isAlreadySynced ? (
            <button
              onClick={() => handleSyncToQB(true)}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium disabled:opacity-50"
              title="Re-sync to QuickBooks (force update)"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Re-sync QB
            </button>
          ) : (
            <button
              onClick={() => handleSyncToQB(false)}
              disabled={syncing || syncSuccess}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                syncSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-[#005670] hover:bg-[#004558] text-white'
              }`}
            >
              {syncing  ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {syncing ? 'Syncing...' : syncSuccess ? '✓ Synced!' : 'Send to QB'}
            </button>
          )}

          <button
            onClick={() => setShowPrintInstructions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* ── PO vs Bill Invoice Comparison Panel ── */}
      {showComparison && (() => {
        const productSub = products.reduce((s, p) => s + parseFloat(p.unitPrice || 0) * (p.quantity || 1), 0);
        const biAddSub   = additionalLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
        const biShipping = parseFloat(headerFields.shipping) || 0;
        const biOthers   = parseFloat(headerFields.others)   || 0;
        const biTotal    = productSub + biAddSub + biShipping + biOthers;

        const poAddSub   = poReference ? (poReference.additionalLines || []).reduce((s, l) => s + (parseFloat(l.amount) || 0), 0) : null;
        const poShipping = poReference ? (poReference.shipping || 0) : null;
        const poOthers   = poReference ? (poReference.others   || 0) : null;
        const poTotal    = poReference != null ? productSub + poAddSub + poShipping + poOthers : null;
        const totalDiff  = poTotal != null ? biTotal - poTotal : null;

        const Row = ({ label, po, bi }) => {
          const diff = po != null ? bi - po : null;
          return (
            <tr className="border-b border-amber-100">
              <td className="py-1.5 pr-4 text-amber-800">{label}</td>
              <td className="py-1.5 px-3 text-right text-gray-600">{po != null ? `$${fmt2(po)}` : <span className="text-gray-300">—</span>}</td>
              <td className={`py-1.5 px-3 text-right font-semibold ${diff != null && diff !== 0 ? (diff > 0 ? 'text-red-600' : 'text-green-600') : 'text-gray-800'}`}>
                ${fmt2(bi)}
              </td>
              <td className={`py-1.5 pl-3 text-right text-xs ${diff == null ? 'text-gray-300' : diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                {diff == null ? '—' : diff === 0 ? '=' : `${diff > 0 ? '+' : ''}$${fmt2(diff)}`}
              </td>
            </tr>
          );
        };

        return (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <GitCompare className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-900">PO vs Bill Invoice Comparison</h3>
            </div>
            <table className="text-xs w-full max-w-lg">
              <thead>
                <tr className="border-b-2 border-amber-200">
                  <th className="text-left py-1.5 pr-4 text-amber-700 font-semibold"></th>
                  <th className="text-right py-1.5 px-3 text-amber-700 font-semibold w-28">PO</th>
                  <th className="text-right py-1.5 px-3 text-amber-700 font-semibold w-28">Bill Invoice</th>
                  <th className="text-right py-1.5 pl-3 text-amber-700 font-semibold w-20">Diff</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Products subtotal" po={productSub} bi={productSub} />
                {additionalLines.map((l, i) => {
                  const poLine = poReference?.additionalLines?.[i];
                  return <Row key={i} label={l.lineType || l.description || `Line ${i + 1}`} po={poLine ? parseFloat(poLine.amount) || 0 : null} bi={parseFloat(l.amount) || 0} />;
                })}
                {biShipping > 0 || poShipping > 0 ? <Row label="Shipping" po={poShipping} bi={biShipping} /> : null}
                {biOthers > 0 || poOthers > 0 ? <Row label="Tax/Others" po={poOthers} bi={biOthers} /> : null}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-300 font-bold">
                  <td className="py-2 pr-4 text-amber-900">Total</td>
                  <td className="py-2 px-3 text-right text-gray-700">{poTotal != null ? `$${fmt2(poTotal)}` : '—'}</td>
                  <td className="py-2 px-3 text-right text-[#005670]">${fmt2(biTotal)}</td>
                  <td className={`py-2 pl-3 text-right text-xs font-bold ${totalDiff == null ? 'text-gray-300' : totalDiff > 0 ? 'text-red-600' : totalDiff < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {totalDiff == null ? '—' : totalDiff === 0 ? '=' : `${totalDiff > 0 ? '+' : ''}$${fmt2(totalDiff)}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })()}

      {/* ── Printable Content ── */}
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="bill-page shadow-xl">

          {/* Top: Company + Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#333' }}>
              <div>{COMPANY_ADDRESS.street}</div>
              <div>{COMPANY_ADDRESS.city}</div>
              <div>{COMPANY_ADDRESS.phone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <img
                src="/images/HDG-Logo.png"
                alt="Henderson Design Group"
                style={{ height: '40px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)' }}
              />
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px', color: '#222', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
              Bill Invoice
            </h2>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              Ref: Purchase Order {headerFields.poNumber}
            </div>
          </div>

          {/* Header grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>
            {/* LEFT: vendor + ship-to */}
            <div style={{ paddingRight: '20px', borderRight: '1px solid #ccc', fontSize: '11px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold' }}>To:</div>
              {vendorInfo.name                      && <div style={{ fontWeight: '500' }}>{vendorInfo.name}</div>}
              {vendorInfo.address?.street            && <div>{vendorInfo.address.street}</div>}
              {(vendorInfo.address?.city || vendorInfo.address?.state || vendorInfo.address?.zip) && (
                <div>{[vendorInfo.address?.city, vendorInfo.address?.state, vendorInfo.address?.zip].filter(Boolean).join(', ')}</div>
              )}
              {vendorInfo.representativeName         && <div><span className="po-field-label">Attention: </span>{vendorInfo.representativeName}</div>}
              {(vendorInfo.contactInfo?.phone || vendorInfo.contactInfo?.fax) && (
                <div>
                  {vendorInfo.contactInfo?.phone && <><span className="po-field-label">Phone: </span>{vendorInfo.contactInfo.phone}</>}
                  {vendorInfo.contactInfo?.fax   && <><span className="po-field-label" style={{ marginLeft: '10px' }}>Fax: </span>{vendorInfo.contactInfo.fax}</>}
                </div>
              )}

              <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Ship To:</div>
              {shipTo.name      && <div>{shipTo.name}</div>}
              {shipTo.address   && <div>{shipTo.address}</div>}
              {shipTo.city      && <div>{shipTo.city}</div>}
              {shipTo.attention && <div><span className="po-field-label">Attention: </span>{shipTo.attention}</div>}
              {shipTo.phone     && <div><span className="po-field-label">Phone: </span>{shipTo.phone}</div>}

              <div style={{ marginTop: '6px' }}>
                <span className="po-field-label">Comments: </span>
                <input className="po-input" value={headerFields.comments}
                  onChange={e => setHeaderFields(h => ({ ...h, comments: e.target.value }))}
                  style={{ width: '68%', display: 'inline-block' }} />
              </div>
              <div>
                <span className="po-field-label">Notes: </span>
                <input className="po-input" value={headerFields.notes}
                  onChange={e => setHeaderFields(h => ({ ...h, notes: e.target.value }))}
                  style={{ width: '74%', display: 'inline-block' }} />
              </div>
            </div>

            {/* RIGHT: order details */}
            <div style={{ paddingLeft: '20px', fontSize: '11px' }}>
              {[
                { label: 'Bill Invoice #:', value: headerFields.billNumber },
                { label: 'Ref PO #:',       value: headerFields.poNumber },
                { label: 'Order Date:',      value: headerFields.orderDate },
                { label: 'Printed Date:',    value: printedDate },
                { label: 'Account Number:',  value: headerFields.accountNumber },
                { label: 'Rep Name:',        value: headerFields.repName },
                { label: 'Rep Phone:',       value: headerFields.repPhone },
                { label: 'Rep Email:',       value: headerFields.repEmail },
                { label: 'Terms:',           value: headerFields.terms },
                { label: 'Client:',          value: clientInfo.name || '' },
                { label: 'Estimate #:',      value: headerFields.estimateNumber },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ textAlign: 'right', fontSize: '11px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{row.value || ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product table */}
          <table className="po-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}></th>
                <th>Description</th>
                <th className="price-cell" style={{ width: '110px' }}>Unit Cost</th>
                <th className="price-cell" style={{ width: '110px' }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const imgSrc = product.selectedOptions?.uploadedImages?.[0]?.url ||
                               product.selectedOptions?.image ||
                               product.selectedOptions?.images?.[0] ||
                               product.imageUrl || null;
                const netCost = (product.selectedOptions?.netCostOverride != null && product.selectedOptions?.netCostOverride !== '')
                  ? parseFloat(product.selectedOptions.netCostOverride)
                  : parseFloat(product.unitPrice || 0);
                const netTotal = netCost * (product.quantity || 1);
                const specs    = product.selectedOptions?.vendorDescription || product.selectedOptions?.specifications || '';
                const sidemark = product.selectedOptions?.sidemark || '';

                return (
                  <tr key={index}>
                    <td className="img-cell">
                      {imgSrc
                        ? <PrintSafeImage src={imgSrc} alt={product.name || ''} style={{ maxWidth: '110px', maxHeight: '110px', objectFit: 'contain', display: 'block', margin: '0 auto' }} fallback={<div className="img-placeholder">No Image</div>} />
                        : <div className="img-placeholder">No Image</div>
                      }
                    </td>
                    <td className="desc-cell">
                      <div className="desc-row">
                        <span className="desc-row-label">Quantity</span>
                        <span className="desc-row-value">{product.quantity || 1} {product.selectedOptions?.units || 'Each'}</span>
                      </div>
                      {specs     && <div className="desc-row"><span className="desc-row-label">Specs</span><span className="desc-row-value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', textAlign: 'left' }}>{specs}</span></div>}
                      {product.name       && <div className="desc-row"><span className="desc-row-label">Name</span><span className="desc-row-value">{product.name}</span></div>}
                      {product.product_id && <div className="desc-row"><span className="desc-row-label">SKU</span><span className="desc-row-value">{product.product_id}</span></div>}
                      {(product.selectedOptions?.dimension || product.selectedOptions?.size) && (
                        <div className="desc-row"><span className="desc-row-label">Dimensions</span><span className="desc-row-value">{product.selectedOptions?.dimension || product.selectedOptions?.size}</span></div>
                      )}
                      {product.selectedOptions?.fabric  && <div className="desc-row"><span className="desc-row-label">Material</span><span className="desc-row-value">{product.selectedOptions.fabric}</span></div>}
                      {product.selectedOptions?.finish  && <div className="desc-row"><span className="desc-row-label">Color</span><span className="desc-row-value">{product.selectedOptions.finish}</span></div>}
                      {product.selectedOptions?.leadTime && <div className="desc-row"><span className="desc-row-label">Lead Time</span><span className="desc-row-value">{product.selectedOptions.leadTime}</span></div>}
                      {sidemark && <div className="sidemark-strip"><span className="desc-row-label">Sidemark </span><span style={{ color: '#333', wordBreak: 'break-word' }}>{sidemark}</span></div>}
                    </td>
                    {/* Unit price — read-only, always from order */}
                    <td className="price-cell" style={{ fontWeight: '500' }}>
                      ${fmt2(netCost)}
                    </td>
                    <td className="price-cell" style={{ fontWeight: '500' }}>
                      ${fmt2(netTotal)}
                    </td>
                  </tr>
                );
              })}

              {/* Additional lines */}
              {additionalLines.map((al, idx) => (
                <tr key={`al-${idx}`}>
                  <td className="img-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>Additional</span>
                  </td>
                  <td className="desc-cell">
                    <div className="no-print" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        value={al.lineType}
                        onChange={e => setAdditionalLines(prev => prev.map((l, i) => i === idx ? { ...l, lineType: e.target.value } : l))}
                        style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
                      >
                        {LINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button
                        onClick={() => setAdditionalLines(prev => prev.filter((_, i) => i !== idx))}
                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}
                      >×</button>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textAlign: 'left' }}>{al.lineType}</div>
                    <input
                      type="text" value={al.description}
                      onChange={e => setAdditionalLines(prev => prev.map((l, i) => i === idx ? { ...l, description: e.target.value } : l))}
                      placeholder="e.g. Freight and Handling..."
                      style={{ fontSize: '11px', width: '100%', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px', textAlign: 'left' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell">
                    <input
                      type="number" value={al.amount} step="0.01"
                      onChange={e => setAdditionalLines(prev => prev.map((l, i) => i === idx ? { ...l, amount: parseFloat(e.target.value) || 0 } : l))}
                      style={{ textAlign: 'right', width: '90px', fontSize: '11px', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell" style={{ fontWeight: '500' }}>
                    ${fmt2(al.amount)}
                  </td>
                </tr>
              ))}

              {/* Add line button */}
              <tr className="no-print">
                <td colSpan={4} style={{ padding: '8px 10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => setAdditionalLines(prev => [...prev, { description: '', lineType: 'FDI', amount: 0 }])}
                    style={{ fontSize: '11px', color: '#005670', border: '1px dashed #005670', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    + Add Line (FDI / Freight / Tax)
                  </button>
                </td>
              </tr>

              {/* Totals */}
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ borderTop: '1px solid #ccc' }}>Sub Total:</td>
                <td className="price-cell" style={{ borderTop: '1px solid #ccc' }}>${fmt2(totals.subTotal)}</td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Shipping:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.shipping || 0}
                    onChange={e => setHeaderFields(h => ({ ...h, shipping: parseFloat(e.target.value) || 0 }))}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Others:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.others || 0}
                    onChange={e => setHeaderFields(h => ({ ...h, others: parseFloat(e.target.value) || 0 }))}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row total-final">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ fontWeight: 'bold', fontSize: '11px' }}>Total:</td>
                <td className="price-cell" style={{ fontWeight: 'bold', fontSize: '11px' }}>${fmt2(totals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Print instructions modal ── */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print / Save PDF</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { n: 1, title: 'Margins → None', desc: 'Margins are built into the document' },
                  { n: 2, title: 'Scale → 100%', desc: 'Must be exactly 100%' },
                  { n: 3, title: 'Disable Headers & Footers', desc: 'Uncheck in the print dialog' },
                  { n: 4, title: 'Background Graphics → On', desc: 'So colors print correctly' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{s.n}</div>
                    <div><p className="font-semibold text-gray-900">{s.title}</p><p className="text-sm text-gray-600">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPrintInstructions(false)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={doPrint} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillInvoiceEditor;
