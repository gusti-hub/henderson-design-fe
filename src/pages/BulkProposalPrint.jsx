// BulkProposalPrint.jsx — Combined multi-unit proposal print view
// Supports ?refs=orderId:version,... (specific versions) and ?ids=... (latest, legacy)
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';
import { toJsDelivrUrl } from '../utils/imageUrl';

const PAD_IN  = 0.5;
const FOOT_IN = 0.45;
const LOGO_FILTER = 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)';
const FINISH_LABELS = { LT:'Light Oak', MD:'Medium Teak', DK:'Dark Teak', WH:'White', BK:'Black', GY:'Grey', NL:'Natural', WN:'Walnut' };
const resolveFinish = c => { if (!c) return ''; const u = c.trim().toUpperCase(); return FINISH_LABELS[u] || c; };
const resolveFabric = f => f || '';
const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseBold = (text) => {
  if (!text || !text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
};

const ROOM_ORDER = [
  'COURTYARD','EXTERIOR ENTRY','INTERIOR ENTRY','FOYER','LIVING ROOM','DINING ROOM',
  'KITCHEN','PANTRY','PRIMARY BEDROOM','PRIMARY BEDROOM LANAI','PRIMARY BATHROOM',
  'PRIMARY CLOSET','BEDROOM 2','BATHROOM 2','BEDROOM 2 CLOSET','BEDROOM 2 LANAI',
  'BEDROOM 3','BATHROOM 3','BEDROOM 3 CLOSET','BEDROOM 3 LANAI','BEDROOM 4','BATHROOM 4',
  'BEDROOM 4 CLOSET','BEDROOM 4 LANAI','POWDER ROOM','OFFICE','OFFICE 1','OFFICE 2','MEDIA ROOM','DEN','HALLWAY','HALLWAY 1','HALLWAY 2',
  'LANAI','LANAI 1','LANAI 2','LANAI 3','MAIN LANAI','POOL LANAI','POOL AREA','BREAKFAST NOOK','GREAT ROOM','FAMILY ROOM','WET BAR','BBQ AREA',
  'POOL BATH','PAVILLION','GYM','WINE ROOM','REC ROOM','GARAGE','SITTING ROOM',
  'FLEX SPACE','LAUNDRY ROOM','MUD ROOM','TERRACE','BALCONY','OUTDOOR DINING',
  'OUTDOOR LIVING','GUEST SUITE','DESIGN SERVICES','PROJECT MANAGEMENT SERVICES',
  'PROCUREMENT SERVICES','FDI SERVICES (FREIGHT, DELIVERY & INSTALLATION)',
  'WALLPAPER INSTALLATION SERVICES','ELECTRICAL INSTALLATION SERVICES',
  'ART INSTALLATION SERVICES','WALLPAPER TRADE COORDINATION',
  'ELECTRICAL TRADE COORDINATION','CLOSET SOLUTIONS',
  'KITCHEN & HOUSEHOLD ESSENTIALS PACKAGE','WINDOW COVERING SERVICES',
  'AUDIO VISUAL SERVICES','GREENERY & PLANT STYLING',
  'CONSTRUCTION DESIGN & PM SERVICES','CUSTOM MILLWORK SERVICES',
  'CUSTOM FURNITURE SERVICES','LIGHTING PROCUREMENT & COORDINATION',
  'APPLIANCE COORDINATION','PLUMBING FIXTURE COORDINATION',
  'DECORATIVE PLUMBING COORDINATION','STONE & SLAB COORDINATION',
  'TILE & SURFACE COORDINATION','HARDWARE & DECORATIVE HARDWARE COORDINATION',
  'OUTDOOR FURNISHINGS','LANAI / TERRACE FURNISHINGS','STYLING & ACCESSORIES',
  'BEDDING PACKAGE','TURNKEY MOVE-IN PACKAGE','OWNER STORAGE & INVENTORY COORDINATION',
  'CLIENT SUPPLIED ITEMS COORDINATION','WHITE GLOVE RECEIVING & WAREHOUSING',
  'PUNCH LIST & COMPLETION COORDINATION','SITE VISIT COORDINATION',
  'EXPEDITING SERVICES','BUILDING COORDINATION SERVICES',
  'CONTRACTOR COORDINATION SERVICES','INSTALLATION OVERSIGHT',
  'FINAL STYLING & STAGING','REVEAL PREPARATION',
];

const sortRoomEntries = (entries) =>
  entries.sort(([a], [b]) => {
    if (a === '-' || a === '—') return 1;
    if (b === '-' || b === '—') return -1;
    const ia = ROOM_ORDER.indexOf(a.toUpperCase());
    const ib = ROOM_ORDER.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

const getImgSrc = p => {
  const o = p.selectedOptions || {};
  const url = [o?.uploadedImages?.[0]?.url, o?.image, o?.images?.[0], p.image, p.imageUrl]
    .find(s => s && typeof s === 'string' && s.trim()) || null;
  return toJsDelivrUrl(url);
};

const PageFooter = () => (
  <div style={{
    position: 'absolute', bottom: '0.28in',
    left: PAD_IN + 'in', right: PAD_IN + 'in',
    borderTop: '1px solid #d1d5db', paddingTop: '5px',
    textAlign: 'center', fontSize: '10px', color: 'rgb(0,86,112)',
    lineHeight: '1.5', background: 'white',
  }}>
    <p style={{ margin: 0 }}>Henderson Design Group 4343 Royal Place, Honolulu, HI, 96816</p>
    <p style={{ margin: 0 }}>Phone: (808) 315-8782</p>
  </div>
);

const ProductRow = ({ product, isFirst }) => {
  const o = product.selectedOptions || {};
  const ca = typeof o.customAttributes === 'object' && !Array.isArray(o.customAttributes) ? o.customAttributes : {};
  const imgSrc = getImgSrc(product);
  const qty = product.quantity || 1;
  const msrp = parseFloat(o.msrp) || 0;
  const markupPct = parseFloat(o.markupPercent) || 0;
  const sell = msrp * (1 + markupPct / 100);
  const sub = sell * qty;
  const taxRate = parseFloat(o.salesTaxRate) || 0;
  const tax = taxRate > 0 ? sub * (taxRate / 100) : 0;
  const total = sub + tax;
  const bt = isFirst ? 'none' : '1px solid #e5e7eb';
  const tdBase = { borderTop: bt, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' };
  const materials = ca.materials || '';

  return (
    <tr>
      <td style={{ ...tdBase, width: '88px', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '76px', height: '76px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '76px', height: '76px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
        }
      </td>
      <td style={{ ...tdBase, padding: '7px 9px', fontSize: '12px', lineHeight: '1.55', textAlign: 'left', verticalAlign: 'top' }}>
        <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '13px' }}>{product.name || 'Untitled'}</div>
        {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#000000', marginBottom: '1px' }}>{parseBold(o.specifications)}</div>}
        {o.finish && <div><strong>Color / Finish:</strong> {resolveFinish(o.finish)}</div>}
        {o.leadTime && <div><strong>Lead Time:</strong> {o.leadTime}</div>}
        {o.fabric && <div><strong>Fabric:</strong> {resolveFabric(o.fabric)}</div>}
        {o.size && <div><strong>Dimensions:</strong> {o.size}</div>}
        {materials && <div><strong>Materials:</strong> {materials}</div>}
      </td>
      <td style={{ ...tdBase, width: '145px', padding: '7px 5px', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#000000' }}>Qty:</span><span>{qty} {o.units || 'Each'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#000000' }}>Unit:</span><span>${fmt(sell)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#000000' }}>Subtotal:</span><span>${fmt(sub)}</span></div>
        {taxRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#000000' }}>Tax ({taxRate}%):</span><span>${fmt(tax)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #d1d5db', paddingTop: '2px', marginTop: '2px' }}>
          <span>Total:</span><span>${fmt(total)}</span>
        </div>
      </td>
    </tr>
  );
};

const ProposalUnit = ({ proposalData, clientInfo, proposalNumber, depositPercent }) => {
  const today = new Date().toLocaleDateString();
  const products = proposalData.selectedProducts || [];
  const dpct = depositPercent ?? 100;

  // Group by room and sort
  const roomMap = new Map();
  products.forEach(p => {
    const room = p.selectedOptions?.room?.trim() || '—';
    if (!roomMap.has(room)) roomMap.set(room, []);
    roomMap.get(room).push(p);
  });
  const roomGroups = sortRoomEntries(Array.from(roomMap.entries()));

  let subtotal = 0, taxTotal = 0;
  products.forEach(p => {
    const o = p.selectedOptions || {};
    const qty = p.quantity || 1;
    const msrp = parseFloat(o.msrp) || 0;
    const markup = parseFloat(o.markupPercent) || 0;
    const sell = msrp * (1 + markup / 100) * qty;
    const taxRate = parseFloat(o.salesTaxRate) || 0;
    subtotal += sell;
    taxTotal += taxRate > 0 ? sell * (taxRate / 100) : 0;
  });
  const total = subtotal + taxTotal;
  const deposit = total * (dpct / 100);

  const slotStyle = {
    position: 'absolute',
    top: PAD_IN + 'in', left: PAD_IN + 'in',
    right: PAD_IN + 'in', bottom: FOOT_IN + 'in',
  };

  const Header = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <img src="/images/HDG-Logo.png" alt="Henderson Design Group" style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
      </div>
      <div style={{ color: '#000000', fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Proposal</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name || '—'}</p>
          {clientInfo.street && <p style={{ margin: 0 }}>{clientInfo.street}{clientInfo.unitNumber?.trim() ? ', #' + clientInfo.unitNumber : ''}</p>}
          {clientInfo.cityLine && <p style={{ margin: 0 }}>{clientInfo.cityLine}</p>}
          {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0 }}><strong>Proposal #:</strong> {proposalNumber || '—'}</p>
          <p style={{ margin: 0 }}>Proposal Date: {today}</p>
        </div>
      </div>
      <div style={{ marginBottom: '12px', fontSize: '12px' }}>
        <span style={{ color: '#1e3a5f', fontWeight: '500' }}>Project: Ālia</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Products page(s) — CSS handles pagination within this unit */}
      <div style={{ position: 'relative', background: 'white', width: '8.5in', minHeight: '11in', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '12px', pageBreakAfter: 'always' }}>
        <div style={slotStyle}>
          <Header />
          {roomGroups.map(([room, rps]) => (
            <div key={room} style={{ marginBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                <colgroup>
                  <col style={{ width: '88px' }} /><col /><col style={{ width: '148px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th colSpan={3} style={{ background: '#f0f0f0', padding: '6px 8px', textAlign: 'center', fontWeight: '600', fontSize: '13px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid #ccc' }}>
                      {room}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rps.map((p, i) => (
                    <ProductRow key={i} product={p} isFirst={i === 0} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {/* Totals */}
          <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '4px', fontSize: '12px', lineHeight: '1.8' }}>
            <p style={{ margin: 0 }}>Sub Total: ${fmt(subtotal)}</p>
            <p style={{ margin: 0 }}>Sales Tax: ${fmt(taxTotal)}</p>
            <p style={{ margin: 0 }}>Total: ${fmt(total)}</p>
            <p style={{ margin: 0, fontWeight: '700' }}>Required Deposit ({dpct}%): ${fmt(deposit)}</p>
          </div>
        </div>
        <PageFooter />
      </div>
    </>
  );
};

const WarrantyPage = () => (
  <div style={{ position: 'relative', background: 'white', width: '8.5in', height: '11in', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '12px', pageBreakAfter: 'always' }}>
    <div style={{ position: 'absolute', top: '0.5in', left: '0.5in', right: '0.5in', bottom: '0.45in' }}>
      <div style={{ color: '#000000', fontWeight: '700', marginBottom: '10px', fontSize: '16px' }}>Proposal Terms: Henderson Design Group Warranty &amp; Aftercare Terms and Conditions</div>
      <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
        <p style={{ marginTop: 0, marginBottom: '10px' }}>Henderson Design Group (HDG) stands behind the quality of the furnishings, fixtures, lighting, accessories, and related products provided as part of the Ālia Furnishings Collections.</p>
        <p style={{ marginBottom: '6px' }}>Warranty coverage begins on the installation date and includes:</p>
        <ul style={{ marginLeft: '14px', marginTop: 0, marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>90-Day Installation Warranty</strong> – Covers installation workmanship and adjustments.</li>
          <li><strong>3-Year Structural Warranty</strong> – Covers furniture frames, cabinetry, millwork, and joinery against defects in materials and workmanship.</li>
          <li><strong>2-Year Upholstery Construction Warranty</strong> – Covers upholstery construction, suspension systems, cushion support systems, and manufacturing-related seam failures.</li>
          <li><strong>1-Year Finishes, Hardware &amp; Components Warranty</strong> – Covers manufacturing defects in finishes, hardware, lighting, accessories, and related components.</li>
        </ul>
        <p style={{ marginBottom: '10px' }}>Certain products, including appliances, electronics, motorized systems, and specialty lighting, may be covered by separate manufacturer warranties.</p>
        <p style={{ marginBottom: '10px' }}>This warranty does not cover normal wear and tear, misuse, accidents, improper maintenance, environmental damage, natural material variations, or other exclusions outlined in the full warranty documentation.</p>
        <p style={{ marginBottom: '10px' }}>Warranty claims must be submitted through the HDG Client Portal or to your HDG Project Manager and should include photographs and a description of the issue.</p>
        <p style={{ marginBottom: '10px' }}>HDG also offers aftercare services, including repairs, refinishing, reupholstery, replacement parts, and furnishing enhancements, which may be available on a fee-for-service basis after the warranty period expires.</p>
        <p style={{ marginBottom: 0 }}>For complete warranty terms, exclusions, limitations, care requirements, and claim procedures, please refer to the Warranty &amp; Care section of the DeCora website.</p>
      </div>
    </div>
    <PageFooter />
  </div>
);

const SignaturePage = ({ clientInfo, proposalNumber }) => {
  const today = new Date().toLocaleDateString();
  return (
    <div style={{ position: 'relative', background: 'white', width: '8.5in', height: '11in', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
      <div style={{ position: 'absolute', top: '0.5in', left: '0.5in', right: '0.5in', bottom: '0.45in' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img src="/images/HDG-Logo.png" alt="Henderson Design Group" style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
        </div>
        <div style={{ color: '#000000', fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Proposal</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name || '—'}</p>
            {clientInfo.street && <p style={{ margin: 0 }}>{clientInfo.street}{clientInfo.unitNumber?.trim() ? ', #' + clientInfo.unitNumber : ''}</p>}
            {clientInfo.cityLine && <p style={{ margin: 0 }}>{clientInfo.cityLine}</p>}
            {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.7' }}>
            <p style={{ margin: 0 }}><strong>Proposal #:</strong> {proposalNumber || '—'}</p>
            <p style={{ margin: 0 }}>Proposal Date: {today}</p>
          </div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '12px' }}>
          <span style={{ color: '#1e3a5f', fontWeight: '500' }}>Project: Ālia</span>
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <ul style={{ marginLeft: '14px', marginTop: '2px', marginBottom: '6px' }}>
            <li>Original Buyer: The warranty applies to the original buyer only.</li>
            <li>Original Installation Location: Valid only for furnishings in the space where they were originally installed.</li>
            <li>Repair, Touch-Up, or Replacement Only: No refunds.</li>
            <li>Non-Returnable Custom Upholstery: Custom upholstery is non-returnable.</li>
            <li>Non-Transferable Warranty: The warranty is non-transferable.</li>
          </ul>
          <p style={{ marginTop: '30px', fontWeight: '700' }}>100% Deposit</p>
          <p style={{ marginTop: '30px' }}>Accept and Approve:</p>
          <div style={{ borderTop: '1px solid black', marginTop: '56px', paddingTop: '6px', fontSize: '11.5px' }}>Signature</div>
        </div>
      </div>
      <PageFooter />
    </div>
  );
};

const BulkProposalPrint = () => {
  const [searchParams] = useSearchParams();
  const refs = (searchParams.get('refs') || '').split(',').filter(Boolean);
  const ids  = (searchParams.get('ids')  || '').split(',').filter(Boolean);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');

        let fetches;
        if (refs.length > 0) {
          fetches = refs.map(ref => {
            const [orderId, ver] = ref.split(':');
            return fetch(`${backendServer}/api/proposals/${orderId}/${ver}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json());
          });
        } else {
          fetches = ids.map(id =>
            fetch(`${backendServer}/api/proposals/${id}/latest`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json())
          );
        }

        const results = await Promise.all(fetches);
        const loaded = results
          .filter(r => r.success)
          .map(r => {
            const d = r.data;
            const u = d.user || {};
            const addr = u.address || {};
            const street = addr.street?.trim() || '';
            const cityParts = [addr.city, addr.state, addr.zipcode].filter(p => p && p.trim());
            const ci = d.clientInfo || {};
            return {
              proposalData: d,
              proposalNumber: d.proposalNumber || '—',
              depositPercent: d.depositPercent ?? 100,
              clientInfo: {
                ...ci,
                name: ci.name || u.name || '—',
                email: ci.email || u.email || '',
                unitNumber: ci.unitNumber || u.unitNumber || '',
                street: ci.street || street,
                cityLine: ci.cityLine || cityParts.join(', '),
              },
            };
          });
        setProposals(loaded);
      } catch (e) {
        setError('Failed to load proposals. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    if (refs.length > 0 || ids.length > 0) load(); else setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#005670' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <AlertCircle style={{ color: '#dc2626' }} />
        <p style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>{error}</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#6b7280' }}>
        No proposals found.
      </div>
    );
  }

  const lastProposal = proposals[proposals.length - 1];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @page { size: 8.5in 11in; margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; background: #b8b8b8; }
      `}</style>

      {/* Print toolbar */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#005670', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif' }}>
        <div>
          <strong style={{ fontSize: 15 }}>Bulk Proposal Print</strong>
          <span style={{ marginLeft: 12, fontSize: 13, opacity: 0.8 }}>{proposals.length} proposal{proposals.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Margins: None · Scale: 100% · Background Graphics: On</span>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', color: '#005670', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            <Printer style={{ width: 16, height: 16 }} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Proposals */}
      <div style={{ padding: '20px 0' }}>
        {proposals.map(({ proposalData, clientInfo, proposalNumber, depositPercent }, i) => (
          <div key={i} style={{ marginBottom: 0 }}>
            <ProposalUnit
              proposalData={proposalData}
              clientInfo={clientInfo}
              proposalNumber={proposalNumber}
              depositPercent={depositPercent}
            />
          </div>
        ))}

        {/* Warranty page — once at the end */}
        <WarrantyPage />

        {/* Signature page — uses last proposal's client info */}
        <SignaturePage
          clientInfo={lastProposal.clientInfo}
          proposalNumber={lastProposal.proposalNumber}
        />
      </div>
    </>
  );
};

export default BulkProposalPrint;
