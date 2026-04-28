// components/ProposalEditor.jsx
import React, { useState, useEffect } from 'react';
import { X, Clock, Printer, ChevronLeft } from 'lucide-react';
import { backendServer } from '../utils/info';

const FooterContent = () => (
  <>
    <p>Henderson Design Group 4343 Royal Place, Honolulu, HI, (808) 315-8782</p>
    <p>Phone: (808) 315-8782</p>
  </>
);

const ProposalEditor = ({ orderId, version, onClose, mode = 'edit' }) => {
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [products, setProducts]     = useState([]);
  const [clientInfo, setClientInfo] = useState({});
  const [proposalNumber, setProposalNumber] = useState(null);
  const [showVersionModal, setShowVersionModal]       = useState(false);
  const [versionNotes, setVersionNotes]               = useState('');
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [originalTitle] = useState(document.title);

  useEffect(() => { loadProposalData(); }, [orderId, version]);

  useEffect(() => {
    if (proposalData && clientInfo.name) {
      const clientName = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const unitNumber = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      const versionNum = proposalData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      document.title = `Proposal_${clientName}${unitNumber ? '_' + unitNumber : ''}_v${versionNum}_${date}`;
    }
    return () => { document.title = originalTitle; };
  }, [proposalData, clientInfo, originalTitle]);

  const loadProposalData = async () => {
    try {
      const token = localStorage.getItem('token');
      const versionParam = version || 'latest';
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/${versionParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) {
        setProposalData(result.data);
        const sorted = (result.data.selectedProducts || []).slice().sort((a, b) => {
          const roomA = (a.selectedOptions?.room || a.spotName || '').toLowerCase();
          const roomB = (b.selectedOptions?.room || b.spotName || '').toLowerCase();
          return roomA.localeCompare(roomB);
        });
        setProducts(sorted);
        setClientInfo(result.data.clientInfo || {});
        setProposalNumber(result.data.proposalNumber || null);
      }
    } catch (error) {
      console.error('Error loading proposal:', error);
      alert('Failed to load proposal data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: proposalData.version,
            products,
            clientInfo,
            notes: versionNotes || 'Updated proposal'
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        if (result.proposalNumber) setProposalNumber(result.proposalNumber);
        alert('✅ Proposal saved successfully');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNewVersion = async () => {
    if (!versionNotes.trim()) { alert('Please add notes for this new version'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/new-version`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ products, clientInfo, notes: versionNotes })
        }
      );
      const result = await response.json();
      if (result.success) {
        if (result.proposalNumber) setProposalNumber(result.proposalNumber);
        setProposalData(prev => ({ ...prev, version: result.data.version }));
        alert(`✅ Version ${result.data.version} created successfully`);
        setShowVersionModal(false);
        setVersionNotes('');
        loadProposalData();
      }
    } catch (error) {
      console.error('Error creating version:', error);
      alert('Failed to create new version');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let salesTaxTotal = 0;
    products.forEach(p => {
      const opts     = p.selectedOptions || {};
      const qty      = p.quantity || 1;
      const msrp     = parseFloat(opts.msrp) || 0;
      const discount = parseFloat(opts.discountPercent) || 0;
      const netCost  = opts.netCostOverride != null ? parseFloat(opts.netCostOverride) : msrp * (1 - discount / 100);
      const markup   = parseFloat(opts.markupPercent) || 0;
      const unitSell = netCost * (1 + markup / 100);
      const lineSub  = unitSell * qty;
      const taxRate  = parseFloat(opts.salesTaxRate) || 0;
      subtotal      += lineSub;
      salesTaxTotal += taxRate > 0 ? lineSub * (taxRate / 100) : 0;
    });
    const total   = subtotal + salesTaxTotal;
    const deposit = total * 0.9;
    return { subtotal, salesTax: salesTaxTotal, total, deposit };
  };

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (proposalData && clientInfo.name) {
      const clientName = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const unitNumber = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      const versionNum = proposalData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      document.title = `Proposal_${clientName}${unitNumber ? '_' + unitNumber : ''}_v${versionNum}_${date}`;
    }
    setTimeout(() => window.print(), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]" />
      </div>
    );
  }

  const totals = calculateTotals();
  const displayProposalNumber = proposalNumber || '—';

  // Group products 2 per screen page
  const PRODUCTS_PER_PAGE = 2;
  const productPages = [];
  for (let i = 0; i < products.length; i += PRODUCTS_PER_PAGE) {
    productPages.push(products.slice(i, i + PRODUCTS_PER_PAGE));
  }

  return (
    <>
      <style>{`
        /* ============================================================
           PRINT STYLES
        ============================================================ */
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container {
            position: absolute; left: 0; top: 0;
            width: 100%; margin: 0; padding: 0;
            background: white !important;
          }
          .no-print { display: none !important; }
          .screen-only { display: none !important; }

          .page {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            display: block !important;
          }
          .page.force-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          .section-header { page-break-after: avoid !important; break-after: avoid !important; }
          .section-content { page-break-inside: avoid !important; break-inside: avoid !important; }

          /* Repeating footer via fixed positioning */
          .page-footer-fixed {
            display: block !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            text-align: center;
            font-size: 11px;
            color: rgb(0, 86, 112) !important;
            padding: 6px 0.5in 10px;
            background: white !important;
            border-top: 1px solid #e5e7eb !important;
            visibility: visible !important;
          }

          input, textarea { border: none !important; background: transparent !important; outline: none !important; }
          p, li { orphans: 3; widows: 3; }
        }

        @page { size: letter; margin: 0.5in 0.5in 0.85in 0.5in; }

        /* ============================================================
           SCREEN STYLES
        ============================================================ */
        .page-footer-fixed { display: none; }

        .page {
          background: white;
          max-width: 780px;
          padding: 40px;
          margin: 0 auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }

        /* Screen page divider */
        .screen-page-divider {
          max-width: 780px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          border-top: 3px dashed #d1d5db;
          padding: 10px 0 0 0;
        }
        .screen-page-divider span {
          font-size: 11px;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 4px;
          white-space: nowrap;
        }

        /* Inline footer on screen */
        .footer-text-inline {
          text-align: center;
          font-size: 11px;
          color: rgb(0,86,112);
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
        }

        .section-header {
          background: #f0f0f0;
          padding: 8px;
          text-align: center;
          border: 1px solid #000;
          border-bottom: none;
          font-weight: 600;
        }
        .section-content {
          border: 1px solid #000;
          padding: 20px;
          margin-bottom: 20px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 120px 1fr 200px;
          gap: 20px;
        }
        input[type="text"], input[type="number"], textarea {
          width: 100%; padding: 4px 8px;
          border: 1px solid #ddd; border-radius: 4px; font-size: 12px;
        }
        input:read-only, textarea:read-only { background: #f9f9f9; border-color: #eee; }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#005670] font-mono">{displayProposalNumber}</span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-sm text-gray-500">Version {proposalData?.version || 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVersionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" /> Version History
          </button>
          <button onClick={() => setShowPrintInstructions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* ── Printable Content ── */}
      <div className="print-container bg-gray-100 py-8">

        {/* Single .page div — products flow naturally for print */}
        <div className="page">

          {/* Logo */}
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="/images/HDG-Logo.png"
              alt="Henderson Design Group"
              style={{
                height: '50px', width: 'auto', display: 'inline-block',
                filter: 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)'
              }}
            />
          </div>

          {/* Client info */}
          <div className="text-red-900 font-bold mb-4">Proposal</div>
          <div className="mb-6 space-y-1 text-sm">
            <p className="font-medium">{clientInfo.name || '—'}</p>
            <p>{clientInfo.unitNumber || ''}</p>
            <p>{clientInfo.address || 'Kailua Kona, Hawaii 96740'}</p>
            <p>{clientInfo.email || proposalData?.user?.email || ''}</p>
          </div>
          <div className="flex justify-between mb-6 text-sm">
            <div className="text-blue-900"><p>Project: Alia</p></div>
            <div className="text-right">
              <p><strong>Proposal #:</strong> {displayProposalNumber}</p>
              <p>Proposal Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/*
            Products grouped for screen view (with footer after each group),
            but rendered as a flat list in DOM for print continuity.
          */}
          {productPages.map((pageProducts, pageIdx) => (
            <React.Fragment key={pageIdx}>
              {/* Screen-only: page divider before each group (except first) */}
              {pageIdx > 0 && (
                <div className="screen-only screen-page-divider" style={{ margin: '0 -40px 24px -40px', padding: '10px 40px 0 40px' }}>
                  <span>— Page {pageIdx + 1} —</span>
                </div>
              )}

              {/* Products in this group */}
              {pageProducts.map((product, productIdx) => (
                <ProductSection key={`${pageIdx}-${productIdx}`} product={product} />
              ))}

              {/* Screen-only: footer after each group */}
              <div className="screen-only footer-text-inline">
                <FooterContent />
              </div>
            </React.Fragment>
          ))}

        </div>{/* end .page */}

        {/* ── Warranty page ── */}
        <div className="screen-only screen-page-divider" style={{ maxWidth: '780px', margin: '0 auto', borderTop: '3px dashed #d1d5db', padding: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: '4px' }}>— Warranty Page —</span>
        </div>

        <div className="page force-break">
          <div className="text-right mb-6 text-sm space-y-1">
            <p>Sub Total: ${totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p>Sales Tax: ${totals.salesTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p>Total: ${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="font-bold">Required Deposit: ${totals.deposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-red-900 font-bold mb-4">
            Proposal Terms: Henderson Design Group Warranty Terms and Conditions
          </div>
          <div className="text-xs space-y-3 leading-relaxed">
            <p><strong>Coverage Period:</strong> Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.</p>
            <p><strong>Scope of Warranty:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Workmanship, Materials, and Functionality: The warranty covers defects in workmanship, materials, and functionality under normal wear and tear conditions.</li>
              <li>Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will, at its discretion, either repair or replace the defective item.</li>
            </ul>
            <p><strong>Returns and Exchanges:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>No Returns: Items are not eligible for returns.</li>
              <li>No Exchanges: Exchanges are not permitted except in cases of defects.</li>
              <li>Custom Items: Custom items, including upholstery, are not eligible for returns or exchanges.</li>
            </ul>
            <p><strong>Exclusions:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Negligence, Misuse, or Accidents: The warranty does not cover defects resulting from negligence, misuse, or accidents after installation.</li>
              <li>Maintenance and Commercial Use: The warranty is void for any condition resulting from incorrect or inadequate maintenance.</li>
              <li>Non-Residential Use: The warranty is void for any condition resulting from other than ordinary residential wear.</li>
              <li>Natural Material Variations: The warranty does not cover the matching of color, grain, or texture of wood, leather, or fabrics.</li>
              <li>Environmental Responses: Wood may expand and contract in response to temperature and humidity variations.</li>
              <li>Fabric and Leather Wear: The warranty does not cover colorfastness, dye lot variations, wrinkling, or wear of fabrics or leather.</li>
              <li>Sun Exposure: Extensive exposure to the sun is not covered.</li>
              <li>Fabric Protectants: Applying a fabric protectant could void the Henderson warranty.</li>
            </ul>
          </div>
          {/* Screen footer */}
          <div className="footer-text-inline">
            <FooterContent />
          </div>
        </div>

        {/* ── Signature page ── */}
        <div className="screen-only screen-page-divider" style={{ maxWidth: '780px', margin: '0 auto', borderTop: '3px dashed #d1d5db', padding: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: '4px' }}>— Signature Page —</span>
        </div>

        <div className="page force-break">
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="/images/HDG-Logo.png"
              alt="Henderson Design Group"
              style={{
                height: '50px', width: 'auto', display: 'inline-block',
                filter: 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)'
              }}
            />
          </div>
          <div className="text-red-900 font-bold mb-4">Proposal</div>
          <div className="mb-6 text-sm space-y-1">
            <p>{clientInfo.name}</p>
            <p>{clientInfo.unitNumber}</p>
            <p>{clientInfo.address || 'Kailua Kona, Hawaii 96740'}</p>
          </div>
          <div className="flex justify-between mb-6 text-sm">
            <p>Project: Alia</p>
            <div className="text-right">
              <p><strong>Proposal #:</strong> {displayProposalNumber}</p>
              <p>Proposal Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-xs space-y-3 leading-relaxed">
            <ul className="list-disc ml-5 space-y-1">
              <li>Original Buyer: The warranty applies to the original buyer only.</li>
              <li>Original Installation Location: The warranty is valid only for furnishings in the space where they were originally installed.</li>
              <li>Repair, Touch-Up, or Replacement Only: No refunds.</li>
              <li>Non-Returnable Custom Upholstery: Custom upholstery is non-returnable.</li>
              <li>Non-Transferable Warranty: The warranty is non-transferable.</li>
            </ul>
            <p className="mt-8 font-bold">100% Deposit</p>
            <p className="mt-8">Accept and Approve:</p>
            <div className="border-t border-black mt-16 pt-2">Signature</div>
          </div>
          {/* Screen footer */}
          <div className="footer-text-inline">
            <FooterContent />
          </div>
        </div>

        {/* ── Fixed footer: repeats on every PRINTED page ── */}
        <div className="page-footer-fixed">
          <FooterContent />
        </div>

      </div>{/* end print-container */}

      {/* ── Version Modal ── */}
      {showVersionModal && (
        <VersionModal
          orderId={orderId}
          isOpen={showVersionModal}
          onClose={() => { setShowVersionModal(false); setVersionNotes(''); }}
          onSelectVersion={(v) => { window.location.href = `/admin/proposal/${orderId}/${v}`; }}
          versionNotes={versionNotes}
          setVersionNotes={setVersionNotes}
          onSaveNewVersion={handleSaveAsNewVersion}
          saving={saving}
        />
      )}

      {/* ── Print Instructions Modal ── */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print Setup Instructions</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best print quality, please configure your print settings:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { n: 1, title: 'Disable Headers and Footers', desc: 'Uncheck "Headers and footers" in print dialog' },
                  { n: 2, title: 'Margins',                     desc: 'Set to "Default" — do NOT use None or Minimum' },
                  { n: 3, title: 'Enable Background Graphics',  desc: 'Check "Background graphics" to print all colors and logo' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{s.n}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-600">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>💡 Tip:</strong> Footer appears automatically on every page. Keep Margins = Default so the footer is not cut off.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPrintInstructions(false)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={doPrint} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2">
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

// ─── ProductSection ────────────────────────────────────────────────────────
const ProductSection = ({ product }) => {
  const opts = product.selectedOptions || {};

  const getProductImage = (p) => {
    const sources = [
      p.selectedOptions?.uploadedImages?.[0]?.url,
      p.selectedOptions?.image,
      p.selectedOptions?.images?.[0],
      p.image,
      p.imageUrl,
    ];
    return sources.find(s => s && typeof s === 'string' && s.trim()) || null;
  };
  const productImage = getProductImage(product);

  const qty      = product.quantity || 1;
  const msrp     = parseFloat(opts.msrp) || 0;
  const discount = parseFloat(opts.discountPercent) || 0;
  const netCost  = opts.netCostOverride != null ? parseFloat(opts.netCostOverride) : msrp * (1 - discount / 100);
  const markup   = parseFloat(opts.markupPercent) || 0;
  const unitSell = netCost * (1 + markup / 100);
  const subtotal = unitSell * qty;
  const taxRate  = parseFloat(opts.salesTaxRate) || 0;
  const salesTax = taxRate > 0 ? subtotal * (taxRate / 100) : 0;
  const lineTotal = subtotal + salesTax;

  return (
    <div className="mb-6">
      <div className="section-header">
        {product.selectedOptions?.room || product.spotName || product.name || 'Untitled'}
      </div>
      <div className="section-content">
        <div className="product-grid">

          {/* Col 1: Image */}
          <div>
            {productImage ? (
              <img
                src={productImage}
                alt={product.name || 'Product'}
                style={{ width: '120px', height: '120px', objectFit: 'contain', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{
              display: productImage ? 'none' : 'flex',
              width: '120px', height: '120px',
              background: '#f3f4f6',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#9ca3af',
              border: '1px solid #e5e7eb'
            }}>
              No Image
            </div>
          </div>

          {/* Col 2: Details */}
          <div className="space-y-1 text-xs">
            {product.product_id && <p><strong>SKU:</strong> {product.product_id}</p>}
            {opts.specifications && (
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{opts.specifications}</p>
            )}
            {opts.finish    && <p><strong>Finish:</strong> {opts.finish}</p>}
            {opts.fabric    && <p><strong>Fabric:</strong> {opts.fabric}</p>}
            {opts.size      && <p><strong>Size:</strong> {opts.size}</p>}
            {opts.itemClass && <p><strong>Class:</strong> {opts.itemClass}</p>}
            {opts.sidemark  && <p><strong>Sidemark:</strong> {opts.sidemark}</p>}
          </div>

          {/* Col 3: Pricing */}
          <div className="text-right text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium">{qty} {opts.units || 'Each'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit Price:</span>
              <span className="font-medium">${unitSell.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal:</span>
              <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Sales Tax ({taxRate}%):</span>
                <span>${salesTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1.5 border-t border-gray-300">
              <span>Line Total:</span>
              <span>${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── VersionModal ──────────────────────────────────────────────────────────
const VersionModal = ({ orderId, isOpen, onClose, onSelectVersion, versionNotes, setVersionNotes, onSaveNewVersion, saving }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (isOpen === true) loadVersions();
  }, [isOpen]);

  const loadVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/versions/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) setVersions(result.data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isOpen === 'new') {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
          <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
            <h3 className="text-xl font-bold">Save as New Version</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={onSaveNewVersion}
                disabled={saving || !versionNotes.trim()}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save as New Version'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Version History</h3>
            <p className="text-sm text-white/80 mt-1">View and manage all proposal versions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-auto max-h-[calc(80vh-88px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670] mx-auto" />
            </div>
          ) : versions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No versions found</div>
          ) : (
            <div className="divide-y">
              {versions.map((v) => (
                <div key={v._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Version {v.version}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          v.status === 'draft'    ? 'bg-gray-100 text-gray-700'   :
                          v.status === 'sent'     ? 'bg-blue-100 text-blue-700'   :
                          v.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{v.notes}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {new Date(v.createdAt).toLocaleDateString()} by {v.createdBy?.name || 'Unknown'}</span>
                        {v.updatedAt && v.updatedAt !== v.createdAt && (
                          <span>Updated: {new Date(v.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectVersion(v.version)}
                      className="ml-4 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      View/Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;