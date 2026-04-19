import React, { useState, useEffect } from 'react';
import { ChevronLeft, Printer, X, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Print-safe image (converts to base64 before print) ──────────────────────
const PrintSafeImage = ({ src, alt, style, fallback }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) { setFailed(true); return; }
    let cancelled = false;

    const convert = async () => {
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

    convert();
    return () => { cancelled = true; };
  }, [src]);

  if (failed || (!dataUrl && !src)) return fallback || null;
  return <img src={dataUrl || src} alt={alt || ''} style={style} onError={() => setFailed(true)} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const COGReportViewer = ({ orderId, onClose }) => {
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [originalTitle] = useState(document.title);

  useEffect(() => {
    loadOrder();
    return () => { document.title = originalTitle; };
  }, [orderId]);

  useEffect(() => {
    if (order) {
      const client = order.clientInfo?.name?.replace(/\s+/g, '_') || 'Client';
      const date   = new Date().toISOString().split('T')[0];
      document.title = `COG_Report_${client}_${date}`;
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (order) {
      const client = order.clientInfo?.name?.replace(/\s+/g, '_') || 'Client';
      document.title = `COG_Report_${client}_${new Date().toISOString().split('T')[0]}`;
    }
    setTimeout(() => window.print(), 150);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getNetCost = (p) => {
    const opts = p.selectedOptions || {};
    if (opts.netCostOverride != null && opts.netCostOverride !== '') {
      return parseFloat(opts.netCostOverride) || 0;
    }
    return parseFloat(opts.msrp) || 0;
  };

  const getPrimaryImage = (p) => {
    const opts = p.selectedOptions || {};
    return opts.uploadedImages?.[0]?.url || opts.image || opts.images?.[0] || null;
  };

  const groupByRoom = (products) => {
    const groups = {};
    products.forEach((p) => {
      const room = p.selectedOptions?.room || '— No Room Assigned —';
      if (!groups[room]) groups[room] = [];
      groups[room].push(p);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
          <span className="text-gray-600 font-medium">Loading COG Report...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Failed to load order data.</p>
      </div>
    );
  }

  const products  = order.selectedProducts || [];
  const grouped   = groupByRoom(products);
  const grandTotal = products.reduce((sum, p) => sum + getNetCost(p) * (p.quantity || 1), 0);
  const todayStr  = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const COMPANY = { street: '4343 Royal Place', city: 'Honolulu, HI 96816', phone: '(808) 315-8782' };

  return (
    <>
      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0.5in !important;
            width: auto !important;
          }
          input::placeholder, textarea::placeholder { color: transparent !important; }
          .bg-gray-100 { background: white !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .room-header-row { page-break-after: avoid; }
        }
        @page { size: Letter; margin: 0.4in; }

        .report-page {
          background: white;
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        /* ── Report Table ── */
        .cog-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .cog-table thead th {
          background: #005670;
          color: white;
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          border: none;
        }
        .cog-table thead th.th-right { text-align: right; }

        /* Room header row */
        .cog-table .room-header-row td {
          background: #e8f4f7;
          color: #005670;
          font-weight: bold;
          font-size: 9.5px;
          padding: 5px 8px;
          border-top: 1px solid #b0d4de;
          border-bottom: 1px solid #b0d4de;
        }

        /* Data rows */
        .cog-table tbody td {
          padding: 8px;
          vertical-align: top;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          font-size: 10px;
        }

        /* Room subtotal */
        .cog-table .subtotal-row td {
          border-bottom: 2px solid #ccc;
          font-size: 9.5px;
          font-weight: bold;
          padding: 4px 8px;
        }

        /* Image cell */
        .cog-table .img-cell {
          width: 80px;
          min-width: 80px;
          text-align: center;
          vertical-align: middle;
          padding: 6px;
        }
        .cog-table .img-cell img {
          max-width: 70px;
          max-height: 70px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .img-placeholder {
          width: 70px;
          height: 70px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          color: #aaa;
          border: 1px solid #eee;
          margin: 0 auto;
        }

        /* Desc cell */
        .cog-table .desc-cell { min-width: 180px; }
        .item-name { font-weight: 600; font-size: 10px; margin-bottom: 2px; }
        .item-sku  { font-size: 8px; color: #888; margin-bottom: 3px; }
        .item-spec { font-size: 8px; color: #555; line-height: 1.4; }

        /* Other cells */
        .vendor-cell { width: 110px; font-size: 9px; }
        .qty-cell    { width: 60px; text-align: center; font-size: 9px; }
        .cost-cell   { width: 90px; text-align: right; font-size: 10px; white-space: nowrap; }
        .cost-bold   { font-weight: 600; }
      `}</style>

      {/* ── Toolbar (no-print) ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm font-medium text-gray-700">
            COG Report — {order.clientInfo?.name || 'Client'}
          </span>
        </div>
        <button
          onClick={() => setShowPrintInstructions(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* ── Printable Content ── */}
      <div className="print-container bg-gray-100 min-h-screen py-8">
        <div className="report-page">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#333' }}>
              <div>{COMPANY.street}</div>
              <div>{COMPANY.city}</div>
              <div>{COMPANY.phone}</div>
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

          {/* Title + meta */}
          <div style={{ borderBottom: '2px solid #005670', paddingBottom: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#005670', margin: 0 }}>
                  Cost of Goods Report
                </h2>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                  {order.clientInfo?.name}
                  {order.clientInfo?.unitNumber ? ` — Unit ${order.clientInfo.unitNumber}` : ''}
                  {order.clientInfo?.floorPlan   ? ` — ${order.clientInfo.floorPlan}` : ''}
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#666', textAlign: 'right' }}>
                <div>Printed: {todayStr}</div>
                <div>{products.length} item{products.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {Object.keys(grouped).length} room{Object.keys(grouped).length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="cog-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}></th>
                <th>Item Description</th>
                <th className="vendor-cell">Vendor</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                <th className="th-right" style={{ width: '90px' }}>Unit COG</th>
                <th className="th-right" style={{ width: '90px' }}>Total COG</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([room, roomProducts]) => {
                const roomTotal = roomProducts.reduce((sum, p) => sum + getNetCost(p) * (p.quantity || 1), 0);

                return (
                  <React.Fragment key={room}>
                    {/* Room header */}
                    <tr className="room-header-row">
                      <td colSpan={6}>{room}</td>
                    </tr>

                    {/* Products */}
                    {roomProducts.map((p, i) => {
                      const imgSrc  = getPrimaryImage(p);
                      const netUnit = getNetCost(p);
                      const netTot  = netUnit * (p.quantity || 1);
                      const units   = p.selectedOptions?.units || 'Each';

                      return (
                        <tr key={p._id || i}>
                          {/* Image */}
                          <td className="img-cell">
                            {imgSrc ? (
                              <PrintSafeImage
                                src={imgSrc}
                                alt={p.name}
                                style={{ maxWidth: '70px', maxHeight: '70px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                                fallback={<div className="img-placeholder">No Image</div>}
                              />
                            ) : (
                              <div className="img-placeholder">No Image</div>
                            )}
                          </td>

                          {/* Description */}
                          <td className="desc-cell">
                            <div className="item-name">{p.name}</div>
                            {p.product_id && <div className="item-sku">{p.product_id}</div>}
                            {p.selectedOptions?.specifications && (
                              <div className="item-spec">
                                {p.selectedOptions.specifications.split('\n').slice(0, 4).join('\n')}
                              </div>
                            )}
                          </td>

                          {/* Vendor */}
                          <td className="vendor-cell">
                            {p.vendor?.name || '—'}
                          </td>

                          {/* Qty */}
                          <td className="qty-cell">
                            {p.quantity || 1} {units}
                          </td>

                          {/* Unit COG */}
                          <td className="cost-cell">
                            ${netUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Total COG */}
                          <td className="cost-cell cost-bold">
                            ${netTot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Room subtotal */}
                    <tr className="subtotal-row">
                      <td colSpan={5} style={{ textAlign: 'right' }}>Room Subtotal:</td>
                      <td className="cost-cell">
                        ${roomTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Grand Total */}
          <div style={{ marginTop: '16px', borderTop: '2px solid #005670', paddingTop: '10px', textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>Grand Total COG: </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#005670', marginLeft: '12px' }}>
              ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '8px', color: '#aaa', textAlign: 'center' }}>
            Henderson Design Group &nbsp;|&nbsp; 4343 Royal Place, Honolulu, HI 96816 &nbsp;|&nbsp; (808) 315-8782
          </div>
        </div>
      </div>

      {/* ── Print Instructions Modal ── */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print / Save as PDF</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best result, please configure:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { num: 1, title: 'Destination',           desc: 'Select "Save as PDF" or your printer' },
                  { num: 2, title: 'Headers and Footers',   desc: 'Uncheck to remove gray bars at top and bottom' },
                  { num: 3, title: 'Margins',               desc: 'Select "None" or "Minimum"' },
                  { num: 4, title: 'Background Graphics',   desc: 'Check this to print logo colors and table backgrounds' },
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

export default COGReportViewer;