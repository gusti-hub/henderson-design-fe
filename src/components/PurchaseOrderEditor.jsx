import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Printer, ChevronLeft, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';
import { toJsDelivrUrl } from '../utils/imageUrl';
import { renderRichText } from '../utils/richTextUtils';

// Strip HTML tags and return plain-text lines — guarantees no CSS can inflate font size
const htmlToLines = (html) => {
  if (!html || typeof html !== 'string') return [];
  const plain = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return plain.split('\n').map(l => l.trim().replace(/\*\*/g, '')).filter(Boolean);
};

// Bold the text before the first colon in a plain-text line
const fmtLine = (line) => {
  const ci = line.indexOf(':');
  if (ci > 0) return <><strong>{line.slice(0, ci)}</strong>{line.slice(ci)}</>;
  return line;
};

// ─── Image with print-safe base64 conversion ──────────────────────────────────
const PrintSafeImage = ({ src, alt, style, fallback }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) { setFailed(true); return; }
    let cancelled = false;

    const toBase64 = async () => {
      try {
        const res = await fetch(src, { mode: 'cors' });
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
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            setDataUrl(canvas.toDataURL());
          } catch { setFailed(true); }
        };
        img.onerror = () => { if (!cancelled) setFailed(true); };
        img.src = src;
      }
    };

    toBase64();
    return () => { cancelled = true; };
  }, [src]);

  if (failed || (!dataUrl && !src)) return fallback || null;

  return (
    <img
      src={dataUrl || src}
      alt={alt || ''}
      style={style}
      onError={() => setFailed(true)}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PurchaseOrderEditor = ({ orderId, vendorId, version, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poData, setPOData] = useState(null);
  const [products, setProducts] = useState([]);
  const [versionsList, setVersionsList] = useState([]);
  const [activeVersion, setActiveVersion] = useState(version || 'latest');
  const [vendorInfo, setVendorInfo] = useState({
    name: '', vendorCode: '', representativeName: '', website: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    contactInfo: { phone: '', email: '', fax: '' },
    accountNumber: ''
  });
  const [shipTo, setShipTo] = useState({
    name: '', address: '', city: '', attention: '', phone: ''
  });
  const [clientInfo, setClientInfo] = useState({});
  const [headerFields, setHeaderFields] = useState({
    poNumber: '', orderDate: '', revisedOrderDate: '', accountNumber: '', repName: '',
    repPhone: '', repEmail: '', terms: '', estimateNumber: '',
    comments: '', notes: '', shipping: 0, others: 0
  });
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [docTemplate, setDocTemplate] = useState(() => localStorage.getItem('henderson_po_template') || 'modern');
  const isClassic = docTemplate === 'classic';
  const handleTemplateToggle = (tpl) => {
    setDocTemplate(tpl);
    localStorage.setItem('henderson_po_template', tpl);
  };
  const [originalTitle] = useState(document.title);
  const [poStatus, setPoStatus] = useState('draft');
  const [savingStatus, setSavingStatus] = useState(false);
  const [additionalLines, setAdditionalLines] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => { loadPOData(); loadVersionsList(); }, [orderId, vendorId]);
  useEffect(() => { if (versionsList.length) loadPOData(); }, [activeVersion]);

  useEffect(() => {
    if (poData && vendorInfo.name) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';

      const date = new Date().toISOString().split('T')[0];
      document.title = `PO_${client}_${vendor}_${date}`;
    }
    return () => { document.title = originalTitle; };
  }, [poData, vendorInfo, clientInfo, originalTitle]);

  const loadPOData = async () => {
    try {
      const token = localStorage.getItem('token');
      const versionParam = activeVersion || 'latest';

      const [poResponse, orderResponse] = await Promise.all([
        fetch(`${backendServer}/api/orders/${orderId}/po/${vendorId}/${versionParam}`,
          { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendServer}/api/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const result = await poResponse.json();
      const orderData = await orderResponse.json();

      setOrderInfo({ orderNumber: orderData.orderNumber, orderLabel: orderData.orderLabel });

      if (result.success) {
        const data = result.data;
        setPOData(data);
        setPoStatus(data.status || 'draft');

        // ── Always derive products from the live order, filtered by this vendor ──
        const vendorProducts = (orderData.selectedProducts || []).filter(p => {
          if (p.isParent) return false; // group parents are not line items
          const pv = p.vendor;
          if (!pv) return false;
          const pvId = typeof pv === 'string' ? pv : String(pv._id || pv.id || pv);
          return pvId === vendorId;
        });
        setProducts(vendorProducts);

        setVendorInfo({
          name: data.vendorInfo?.name || '',
          vendorCode: data.vendorInfo?.vendorCode || '',
          representativeName: data.vendorInfo?.representativeName || '',
          website: data.vendorInfo?.website || '',
          address: {
            street: data.vendorInfo?.address?.street || '',
            city: data.vendorInfo?.address?.city || '',
            state: data.vendorInfo?.address?.state || '',
            zip: data.vendorInfo?.address?.zip || '',
            country: data.vendorInfo?.address?.country || ''
          },
          contactInfo: {
            phone: data.vendorInfo?.contactInfo?.phone || '',
            email: data.vendorInfo?.contactInfo?.email || '',
            fax: data.vendorInfo?.contactInfo?.fax || ''
          },
          accountNumber: data.vendorInfo?.accountNumber || ''
        });

        if (data.shipTo && (data.shipTo.name || data.shipTo.address)) {
          setShipTo(data.shipTo);
        } else {
          const vendorIdStr = vendorId?.toString();
          const orderProductWithShipping = (orderData.selectedProducts || []).find(p => {
            const pVendorId = p.vendor?._id?.toString() || p.vendor?.toString();
            return pVendorId === vendorIdStr && (p.selectedOptions?.shippingStreet || p.selectedOptions?.shipToName);
          });
          if (orderProductWithShipping) {
            const opts = orderProductWithShipping.selectedOptions;
            setShipTo({
              name: opts.shipToName || '',
              address: opts.shippingStreet || '',
              city: [opts.shippingCity, opts.shippingState, opts.shippingPostalCode].filter(Boolean).join(', '),
              attention: '',
              phone: opts.shipToPhone || ''
            });
          }
        }

        setClientInfo(data.clientInfo || {});
        setHeaderFields({
          poNumber: data.poNumber || '',
          orderDate: data.orderDate
            ? new Date(data.orderDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : '',
          revisedOrderDate: data.revisedOrderDate || '',
          accountNumber: data.accountNumber || '',
          repName: data.repName || '',
          repPhone: data.repPhone || '',
          repEmail: data.repEmail || '',
          terms: data.terms || '',
          estimateNumber: data.estimateNumber || '',
          comments: data.comments || '',
          notes: data.notes || '',
          shipping: data.shipping || 0,
          others: data.others || 0
        });
        setAdditionalLines(data.additionalLines || []);
      } else {
        alert('Failed to load PO: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading PO:', error);
      alert('Failed to load Purchase Order data');
    } finally {
      setLoading(false);
    }
  };

  const loadVersionsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/versions/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (result.success) setVersionsList(result.data || []);
    } catch (e) { console.error('Failed to load versions list', e); }
  };

  const isLatestVersion = versionsList.length === 0 ||
    (poData && versionsList[0]?.version === poData.version);

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/status`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: poData.version, status: newStatus })
        }
      );
      const result = await response.json();
      if (result.success) {
        setPoStatus(newStatus);
        setPOData(prev => ({ ...prev, status: newStatus }));
      } else {
        alert('Failed to update status: ' + (result.message || ''));
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: poData.version, products, vendorInfo, shipTo,
            clientInfo, ...headerFields, additionalLines
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        alert('✅ Purchase Order saved successfully');
        loadPOData();
      } else {
        alert('Failed to save: ' + (result.message || ''));
      }
    } catch (error) {
      console.error('Error saving PO:', error);
      alert('Failed to save Purchase Order');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    const subTotal = products.reduce((sum, p) => {
      const netCost = (p.selectedOptions?.netCostOverride != null && p.selectedOptions?.netCostOverride !== '')
        ? parseFloat(p.selectedOptions.netCostOverride)
        : parseFloat(p.selectedOptions?.msrp || p.unitPrice || 0);
      return sum + netCost * (p.quantity || 1);
    }, 0);
    const addTotal   = additionalLines.reduce((sum, al) => sum + (parseFloat(al.amount) || 0), 0);
    const shipping   = parseFloat(headerFields.shipping) || 0;
    const others     = parseFloat(headerFields.others) || 0;
    return {
      subTotal: subTotal + addTotal,
      shipping,
      others,
      total: subTotal + addTotal + shipping + others,
    };
  };

  const doPrint = async () => {
    setShowPrintInstructions(false);
    if (poData && vendorInfo.name) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';

      const date = new Date().toISOString().split('T')[0];
      document.title = `PO_${client}_${vendor}_${date}`;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 1000);
    }, 150);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
          <span className="text-gray-600 font-medium">Loading Purchase Order...</span>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const rawShipDate = products.find(p => p.selectedOptions?.expectedShipDate)?.selectedOptions?.expectedShipDate || '';
  const shipmentDate = rawShipDate
    ? new Date(rawShipDate + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '';

  const COMPANY_ADDRESS = {
    street: '4343 Royal Place',
    city: 'Honolulu, HI 96816',
    phone: '(808) 315-8782',
  };

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .po-page {
            page-break-after: avoid !important;
            page-break-inside: auto !important;
            padding: 0.5in !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            width: auto !important;
            min-height: unset !important;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          input, select {
            border: none !important; background: transparent !important;
            outline: none !important; box-shadow: none !important; padding: 0 !important;
          }
          textarea {
            border: none !important; background: transparent !important;
            outline: none !important; box-shadow: none !important;
            padding: 0 !important; resize: none !important;
            overflow: visible !important; height: auto !important;
          }
          .po-table { border: 1px solid #999 !important; }
          .po-table th { background: #666 !important; color: white !important; border: none !important; }
          .po-table td { border: none !important; }
          .po-table tbody tr + tr td { border-top: 1px solid #f0f0f0 !important; }
          .po-totals-row td { border: none !important; }
          .po-totals-row.total-final td { border-top: 1px solid #333 !important; }
          .remove-btn { display: none !important; }
          .add-product-btn { display: none !important; }
          input::placeholder { color: transparent !important; }
          textarea::placeholder { color: transparent !important; }
          body { background: white !important; }
          .bg-gray-100 { background: white !important; }
          .unit-cost-raw { display: none !important; }
          .unit-cost-display { display: block !important; text-align: right; font-size: 11px; }
          .sidemark-row { margin-top: 4px; font-size: 10px; }
        }
        @page { size: letter; margin: 0.5in; }

        .po-page {
          background: white; width: 8.5in; min-height: 11in;
          padding: 0.5in; margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative;
        }
        .po-field-label { font-weight: bold; font-size: 11px; color: #333; white-space: nowrap; }
        .po-input {
          border: none; border-bottom: 1px solid transparent; border-radius: 0;
          padding: 0 2px; margin: 0; font-size: 11px; line-height: 1.4;
          height: auto; width: 100%; background: transparent; outline: none;
          display: block; transition: border-color 0.15s;
        }
        .po-input:focus { border-bottom-color: #005670; }
        .po-table {
          width: 100%; border-collapse: collapse; font-size: 11px;
          border: 1px solid #999; table-layout: fixed;
        }
        .po-table th {
          background: #666; color: white; padding: 6px 10px;
          text-align: left; font-weight: 600; font-size: 10px; border: none;
        }
        .po-table th.th-cost { text-align: right; }
        .po-table td {
          border: none; padding: 10px 10px; vertical-align: top;
          word-wrap: break-word; overflow-wrap: break-word; max-width: 0;
        }
        .po-table tbody tr + tr td { border-top: 1px solid #f0f0f0; }
        .po-table .img-cell {
          width: 120px; min-width: 120px; text-align: center;
          vertical-align: middle; padding: 8px;
        }
        .po-table .img-cell img {
          max-width: 110px; max-height: 110px;
          object-fit: contain; display: block; margin: 0 auto;
        }
        .img-placeholder {
          width: 110px; height: 110px; background: #f5f5f5;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #999; border: 1px solid #eee; margin: 0 auto;
        }
        .po-table .price-cell {
          text-align: right; white-space: normal; vertical-align: top;
          width: 90px; font-size: 11px;
        }
        .po-totals-row td {
          border: none !important; padding: 2px 10px;
          text-align: right; font-size: 11px;
        }
        .po-totals-row.total-final td {
          border-top: 2px solid #333 !important;
          font-weight: bold; font-size: 12px;
        }
        .desc-row {
          display: block; padding: 3px 0; font-size: 11px;
          border-bottom: 1px dotted #eee; text-align: left;
        }
        .desc-row:last-child { border-bottom: none; }
        .desc-row-label {
          font-weight: 700; color: #444; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.3px; margin-right: 4px;
        }
        .desc-row-label::after { content: ':'; }
        .desc-row-value { text-align: left; color: #222; font-size: 11px; word-break: break-word; }
        .sidemark-strip {
          display: block; margin-top: 5px; padding-top: 5px;
          border-top: 1px dashed #ccc; font-size: 10px; text-align: left;
        }
        .po-item-desc {
          font-size: 11px; line-height: 1.5; text-align: left;
          color: #222; margin-bottom: 2px;
        }
        .po-item-desc p {
          font-size: 11px !important; margin: 0 0 1px 0 !important;
          text-align: left !important; line-height: 1.5;
        }
        .po-item-desc strong { font-size: 11px !important; }
      `}</style>

      {/* ====== TOOLBAR ====== */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm font-medium text-gray-700">
            PO — {vendorInfo.name || 'Vendor'}
          </span>

          {/* Version switcher */}
          {versionsList.length > 1 && (
            <select
              value={activeVersion === 'latest' ? (versionsList[0]?.version ?? 'latest') : activeVersion}
              onChange={e => { setActiveVersion(Number(e.target.value)); setLoading(true); }}
              className="px-2.5 py-1 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-700 outline-none cursor-pointer"
            >
              {versionsList.map(v => (
                <option key={v.version} value={v.version}>
                  v{v.version}{v.version === versionsList[0]?.version ? ' (latest)' : ''} — {v.status}
                </option>
              ))}
            </select>
          )}

          {!isLatestVersion && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              Read-only — older version
            </span>
          )}

            <div className="flex items-center gap-1.5">
              <select
                value={poStatus}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={savingStatus || !isLatestVersion}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer appearance-none ${
                  poStatus === 'draft'     ? 'bg-yellow-100 text-yellow-700' :
                  poStatus === 'sent'      ? 'bg-blue-100 text-blue-700' :
                  poStatus === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                } ${(savingStatus || !isLatestVersion) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Vendor</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="paid">Paid</option>
              </select>
              {savingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
            </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !isLatestVersion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {/* Template toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => handleTemplateToggle('classic')}
              className={`px-3 py-2 transition-colors ${isClassic ? 'bg-[#005670] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >Version 1</button>
            <button
              onClick={() => handleTemplateToggle('modern')}
              className={`px-3 py-2 transition-colors ${!isClassic ? 'bg-[#005670] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >Version 2</button>
          </div>
          <button
            onClick={() => setShowPrintInstructions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ====== PRINTABLE PO CONTENT ====== */}
      <div className="print-container bg-gray-100 min-h-screen py-8">
        <div className="po-page">

          {/* ---- TOP: Company Address + Logo ---- */}
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
                style={{
                  height: '40px', width: 'auto',
                  filter: 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)'
                }}
              />
            </div>
          </div>

          {/* ---- PURCHASE ORDER TITLE ---- */}
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '10px 0 8px', color: '#222', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
            Purchase Order
          </h2>

          {/* ---- HEADER INFO GRID ---- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>

            {/* LEFT: Vendor + Ship To + Comments */}
            <div style={{ paddingRight: '20px', borderRight: '1px solid #ccc', fontSize: '11px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold' }}>To:</div>
              {vendorInfo.name && <div style={{ fontWeight: '500' }}>{vendorInfo.name}</div>}
              {vendorInfo.address?.street && <div>{vendorInfo.address.street}</div>}
              {(vendorInfo.address?.city || vendorInfo.address?.state || vendorInfo.address?.zip) && (
                <div>{[vendorInfo.address?.city, vendorInfo.address?.state, vendorInfo.address?.zip].filter(Boolean).join(', ')}</div>
              )}
              {vendorInfo.representativeName && (
                <div><span className="po-field-label">Attention: </span>{vendorInfo.representativeName}</div>
              )}
              {(vendorInfo.contactInfo?.phone || vendorInfo.contactInfo?.fax) && (
                <div>
                  {vendorInfo.contactInfo?.phone && <><span className="po-field-label">Phone: </span>{vendorInfo.contactInfo.phone}</>}
                  {vendorInfo.contactInfo?.fax && <><span className="po-field-label" style={{ marginLeft: '10px' }}>Fax: </span>{vendorInfo.contactInfo.fax}</>}
                </div>
              )}

              <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Ship To:</div>
              {shipTo.name && <div>{shipTo.name}</div>}
              {shipTo.address && <div>{shipTo.address}</div>}
              {shipTo.city && <div>{shipTo.city}</div>}
              {shipTo.attention && <div><span className="po-field-label">Attention: </span>{shipTo.attention}</div>}
              {shipTo.phone && <div><span className="po-field-label">Phone: </span>{shipTo.phone}</div>}

              <div style={{ marginTop: '6px' }}>
                <span className="po-field-label">Comments: </span>
                <input className="po-input" value={headerFields.comments} onChange={(e) => setHeaderFields({ ...headerFields, comments: e.target.value })} style={{ width: '68%', display: 'inline-block' }} />
              </div>
              <div>
                <span className="po-field-label">Notes: </span>
                <input className="po-input" value={headerFields.notes} onChange={(e) => setHeaderFields({ ...headerFields, notes: e.target.value })} style={{ width: '74%', display: 'inline-block' }} />
              </div>
            </div>

            {/* RIGHT: Order Details */}
            <div style={{ paddingLeft: '20px', fontSize: '11px' }}>
              {[{ label: 'Order #:', value: headerFields.poNumber },
                { label: 'Order Date:', value: headerFields.orderDate },
                { label: 'Shipment Date:', value: shipmentDate },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ textAlign: 'right', fontSize: '11px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{row.value || ''}</span>
                </div>
              ))}
              {/* Revised PO Date — editable inline, below Shipment Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>Revised PO Date:</span>
                <input className="po-input" type="date"
                  value={headerFields.revisedOrderDate || ''}
                  onChange={(e) => setHeaderFields({ ...headerFields, revisedOrderDate: e.target.value })}
                  style={{ textAlign: 'right', fontSize: '11px', flex: 1, minWidth: 0 }}
                />
              </div>
              {[
                { label: 'Account Number:', value: headerFields.accountNumber },
                { label: 'Rep Name:',       value: headerFields.repName },
                { label: 'Rep Phone:',      value: headerFields.repPhone },
                { label: 'Rep Email:',      value: headerFields.repEmail },
                { label: 'Terms:',          value: headerFields.terms },
                { label: 'Client:',         value: clientInfo.name || '' },
                { label: 'Estimate #:',     value: headerFields.estimateNumber },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ textAlign: 'right', fontSize: '11px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{row.value || ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- PRODUCT TABLE ---- */}
          <table className="po-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}></th>
                <th>Description</th>
                <th className="th-cost" style={{ width: '110px' }}>Unit Cost</th>
                <th className="th-cost" style={{ width: '110px' }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const imgSrc = toJsDelivrUrl(
                               product.selectedOptions?.uploadedImages?.[0]?.url ||
                               product.selectedOptions?.image ||
                               product.selectedOptions?.images?.[0] ||
                               product.imageUrl || null);
                const netCost = (product.selectedOptions?.netCostOverride != null && product.selectedOptions?.netCostOverride !== '')
                  ? parseFloat(product.selectedOptions.netCostOverride)
                  : parseFloat(product.selectedOptions?.msrp || product.msrp || product.unitPrice || 0);
                const netTotal = netCost * (product.quantity || 1);
                const sidemark = product.selectedOptions?.sidemark || '';
                const vendorDesc = product.selectedOptions?.vendorDescription || '';
                const o = product.selectedOptions || {};

                return (
                  <tr key={index}>
                    {/* Image */}
                    <td className="img-cell">
                      {imgSrc ? (
                        <PrintSafeImage
                          src={imgSrc}
                          alt={product.name || ''}
                          style={{ maxWidth: '110px', maxHeight: '110px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                          fallback={<div className="img-placeholder">No Image</div>}
                        />
                      ) : (
                        <div className="img-placeholder">No Image</div>
                      )}
                    </td>

                    {/* Description cell */}
                    <td className="desc-cell">
                      <div className="desc-row">
                        <span className="desc-row-label">Quantity</span>
                        <span className="desc-row-value">
                          {product.quantity || 1} {o.units || 'Each'}
                        </span>
                      </div>
                      {isClassic ? (
                        <>
                          {(vendorDesc || o.specifications) ? (
                            <div className="desc-row">
                              <span className="desc-row-label">Specs</span>
                              <span className="desc-row-value" style={{ lineHeight: '1.5', textAlign: 'left' }}>
                                {renderRichText(vendorDesc || o.specifications)}
                              </span>
                            </div>
                          ) : null}
                          {product.name ? <div className="desc-row"><span className="desc-row-label">Name</span><span className="desc-row-value">{product.name}</span></div> : null}
                          {product.product_id ? <div className="desc-row"><span className="desc-row-label">SKU</span><span className="desc-row-value">{product.product_id}</span></div> : null}
                          {(o.size || o.dimension) ? <div className="desc-row"><span className="desc-row-label">Dimensions</span><span className="desc-row-value">{o.size || o.dimension}</span></div> : null}
                          {o.fabric ? <div className="desc-row"><span className="desc-row-label">Fabric</span><span className="desc-row-value">{o.fabric}</span></div> : null}
                          {o.customAttributes?.materials ? <div className="desc-row"><span className="desc-row-label">Materials</span><span className="desc-row-value">{o.customAttributes.materials}</span></div> : null}
                          {o.finish ? <div className="desc-row"><span className="desc-row-label">Color</span><span className="desc-row-value">{o.finish}</span></div> : null}
                          {o.leadTime ? <div className="desc-row"><span className="desc-row-label">Lead Time</span><span className="desc-row-value">{o.leadTime}</span></div> : null}
                        </>
                      ) : (
                        <>
                          {product.name ? (
                            <div className="desc-row" style={{ borderBottom: 'none', padding: '2px 0' }}>
                              <span style={{ fontWeight: 700, fontSize: '11px' }}>Item Name:</span>{' '}
                              <span style={{ fontSize: '11px', color: '#222' }}>{product.name}</span>
                            </div>
                          ) : null}
                          {vendorDesc && htmlToLines(vendorDesc).map((line, i) => (
                            <div key={i} style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '1px', textAlign: 'left', color: '#222' }}>{fmtLine(line)}</div>
                          ))}
                          {o.woodFinishVendor   && <div className="desc-row"><span className="desc-row-label"><strong>Wood Finish</strong></span><span className="desc-row-value">{o.woodFinishVendor}</span></div>}
                          {o.drawerFrontsVendor && <div className="desc-row"><span className="desc-row-label"><strong>Drawer Fronts</strong></span><span className="desc-row-value">{o.drawerFrontsVendor}</span></div>}
                          {o.wingPanelsVendor   && <div className="desc-row"><span className="desc-row-label"><strong>Wing Panels</strong></span><span className="desc-row-value">{o.wingPanelsVendor}</span></div>}
                          {o.fabricVendor       && <div className="desc-row"><span className="desc-row-label"><strong>Fabric</strong></span><span className="desc-row-value">{o.fabricVendor}</span></div>}
                          {(o.size || o.dimension) && <div className="desc-row"><span className="desc-row-label"><strong>Dimensions</strong></span><span className="desc-row-value">{o.size || o.dimension}</span></div>}
                          {product.product_id   && <div className="desc-row"><span className="desc-row-label"><strong>SKU</strong></span><span className="desc-row-value">{product.product_id}</span></div>}
                          {o.leadTime && <div className="desc-row"><span className="desc-row-label">Lead Time</span><span className="desc-row-value">{o.leadTime}</span></div>}
                        </>
                      )}
                      {sidemark ? (
                        <div className="sidemark-strip">
                          <span className="desc-row-label">Sidemark</span>
                          <span style={{ color: '#333', wordBreak: 'break-word' }}>{sidemark}</span>
                        </div>
                      ) : null}
                    </td>

                    {/* Unit Cost */}
                    <td className="price-cell">
                      <span style={{ display: 'block', textAlign: 'right', fontSize: '11px' }}>
                        ${netCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Total Cost */}
                    <td className="price-cell" style={{ fontWeight: '500', fontSize: '11px' }}>
                      ${netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}

              {/* ── Additional Lines ── */}
              {additionalLines.map((al, idx) => (
                <tr key={`al-${idx}`}>
                  <td className="img-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>Additional</span>
                  </td>
                  <td className="desc-cell">
                    <div className="no-print" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        value={al.lineType}
                        onChange={e => {
                          const updated = [...additionalLines];
                          updated[idx] = { ...updated[idx], lineType: e.target.value };
                          setAdditionalLines(updated);
                        }}
                        style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
                      >
                        {['Product','FDI','FDI-Vendor','Other','Design Fees',
                          'Expediting','Hours','Labor','Reimbursable',
                          'Project Management Fees','Sales'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setAdditionalLines(prev => prev.filter((_, i) => i !== idx))}
                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}
                        title="Remove"
                      >×</button>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textAlign: 'left' }}>{al.lineType}</div>
                    <input
                      type="text"
                      value={al.description}
                      onChange={e => {
                        const updated = [...additionalLines];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setAdditionalLines(updated);
                      }}
                      placeholder="e.g. Freight and Handling - PO #..."
                      style={{ fontSize: '11px', width: '100%', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px', textAlign: 'left' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell">
                    <input
                      type="number"
                      value={al.amount}
                      onChange={e => {
                        const updated = [...additionalLines];
                        updated[idx] = { ...updated[idx], amount: parseFloat(e.target.value) || 0 };
                        setAdditionalLines(updated);
                      }}
                      step="0.01"
                      style={{ textAlign: 'right', width: '90px', fontSize: '11px', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell" style={{ fontWeight: '500' }}>
                    ${(parseFloat(al.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Add Additional Line button */}
              <tr className="no-print add-product-btn">
                <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'left' }}>
                  <button
                    onClick={() => setAdditionalLines(prev => [...prev, { description: '', lineType: 'FDI', amount: 0 }])}
                    style={{
                      fontSize: '11px', color: '#005670', border: '1px dashed #005670',
                      borderRadius: '4px', padding: '4px 10px', cursor: 'pointer',
                      background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    + Add Line (FDI / Freight / Tax)
                  </button>
                </td>
              </tr>

              {/* Totals */}
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ borderTop: '1px solid #ccc' }}>Sub Total:</td>
                <td className="price-cell" style={{ borderTop: '1px solid #ccc' }}>
                  ${totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Shipping:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.shipping || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, shipping: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Others:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.others || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, others: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row total-final">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ fontWeight: 'bold', fontSize: '11px' }}>Total:</td>
                <td className="price-cell" style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  ${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== PRINT INSTRUCTIONS MODAL ====== */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print / Save as PDF</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best print quality, please configure:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { num: 1, title: 'Destination', desc: 'Select "Save as PDF" or your printer' },
                  { num: 2, title: 'Headers and Footers', desc: 'Uncheck "Headers and footers"' },
                  { num: 3, title: 'Margins', desc: 'Select "None" or "Minimum"' },
                  { num: 4, title: 'Background Graphics', desc: 'Check "Background graphics" to print all colors and logo' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{step.num}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPrintInstructions(false)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={doPrint} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};


export default PurchaseOrderEditor;