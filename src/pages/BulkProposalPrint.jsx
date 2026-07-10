// BulkProposalPrint.jsx — JS-paginated multi-proposal print (matches ProposalEditor exactly)
// Each proposal is split into explicit 8.5×11in pages via DOM measurement, identical to
// ProposalEditor's pagination engine, so nothing gets cut off.
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';
import { toJsDelivrUrl } from '../utils/imageUrl';

// ─── Page dimensions (match ProposalEditor exactly) ───────────────────────────
const PAGE_W_IN = 8.5, PAGE_H_IN = 11, PAD_IN = 0.5, FOOT_IN = 0.85, SAFE_PX = 60, PX = 96;
const CONTENT_H = (PAGE_H_IN - PAD_IN - FOOT_IN) * PX - SAFE_PX;

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGO_FILTER = 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)';

const FINISH_LABELS = { LT:'Light Oak', MD:'Medium Teak', DK:'Dark Teak', WH:'White', BK:'Black', GY:'Grey', NL:'Natural', WN:'Walnut' };
const resolveFinish = c => { if (!c) return ''; const u = c.trim().toUpperCase(); return FINISH_LABELS[u] || c; };

const FABRIC_CODES = {
  '01':'Merino Snow','02':'Merino Wool','03':'Merino Cloud','04':'Peppin Silver','05':'Peppin Jute',
  '06':'Peppin Chess','07':'Navara-011','08':'Navara-012','09':'Navara-013','10':'Palopo #WR160',
  '11':'Dayevella Stone','12':'Peppin Portobelo','13':'Merino Silver','14':'Merino Light Grey',
  '15':'Merino Pebble','16':'Lagoon #WR141','17':'Lagoon #WR160','18':'Peppin Coblestone',
  '19':'Peppin Jute','20':'Peppin Chess','0A':'Gusto Angora','0B':'Gusto Shell','0C':'Gusto Dune',
  '0D':'Indulge Swan','0E':'Indulge Dune','0F':'Indulge Sand','0G':'Navara-011','0H':'Navara-012',
  '0I':'Navara-013','0J':'Evo Creame','0K':'Evo Plaza','0L':'Evo Sand','0M':'Drama Wool',
  '0N':'Drama Marble','0O':'Drama Linen','0P':'Chill Out Ivory','0Q':'Chill Out Antique',
  '0R':'Chill Out Chinchilla','0S':'Rewind Sesame','0T':'Rewind Marble','0U':'Rewind Gull',
};
const resolveFabric = c => { if (!c) return ''; const u = c.trim().toUpperCase(); return FABRIC_CODES[u] || c; };

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
  'BEDROOM 4 CLOSET','BEDROOM 4 LANAI','POWDER ROOM','OFFICE','OFFICE 1','OFFICE 2',
  'MEDIA ROOM','DEN','HALLWAY','HALLWAY 1','HALLWAY 2',
  'LANAI','LANAI 1','LANAI 2','LANAI 3','MAIN LANAI','POOL LANAI','POOL AREA',
  'BREAKFAST NOOK','GREAT ROOM','FAMILY ROOM','WET BAR','BBQ AREA',
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
  [...entries].sort(([a], [b]) => {
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

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Greedy page packer — identical logic to ProposalEditor
const packItems = (items, firstPageH, contPageH) => {
  const pages = []; let cur = []; let rem = firstPageH;
  items.forEach(item => {
    if (item.height > rem && cur.length > 0) { pages.push(cur); cur = []; rem = contPageH; }
    cur.push(item); rem -= item.height;
  });
  if (cur.length > 0) pages.push(cur);
  if (pages.length === 0) pages.push([]);
  return pages;
};

// ─── PageFooter ───────────────────────────────────────────────────────────────
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

// ─── ProductRow — matches ProposalEditor ProductRowV2 ─────────────────────────
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
  const td = { borderTop: bt, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' };
  const materials = ca.materials || '';
  return (
    <tr>
      <td style={{ ...td, width: '88px', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '76px', height: '76px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '76px', height: '76px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
        }
      </td>
      <td style={{ ...td, padding: '7px 9px', fontSize: '12px', lineHeight: '1.55', textAlign: 'left', verticalAlign: 'top' }}>
        <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '13px' }}>{product.name || 'Untitled'}</div>
        {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#000000', marginBottom: '1px' }}>{parseBold(o.specifications)}</div>}
        {o.finish    && <div><strong>Color / Finish:</strong> {resolveFinish(o.finish)}</div>}
        {o.leadTime  && <div><strong>Lead Time:</strong> {o.leadTime}</div>}
        {o.fabric    && <div><strong>Fabric:</strong> {resolveFabric(o.fabric)}</div>}
        {o.size      && <div><strong>Dimensions:</strong> {o.size}</div>}
        {materials   && <div><strong>Materials:</strong> {materials}</div>}
      </td>
      <td style={{ ...td, width: '145px', padding: '7px 5px', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
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

// ─── First-page header (logo + full client block) ─────────────────────────────
const P1Header = ({ clientInfo, proposalNumber }) => {
  const today = new Date().toLocaleDateString();
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <img src="/images/HDG-Logo.png" alt="Henderson Design Group"
          style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
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
};

// ─── Continuation header (compact, page 2+) ───────────────────────────────────
const ContHeader = ({ clientInfo, proposalNumber }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
    <span>{clientInfo.name || '—'} — Products (continued)</span>
    <span>Proposal #: {proposalNumber || '—'}</span>
  </div>
);

// ─── Totals block (last page of each proposal) ────────────────────────────────
const TotalsBlock = ({ products, depositPercent }) => {
  let subtotal = 0, taxTotal = 0;
  (products || []).forEach(p => {
    const o = p.selectedOptions || {};
    const qty = p.quantity || 1;
    const sell = (parseFloat(o.msrp) || 0) * (1 + (parseFloat(o.markupPercent) || 0) / 100) * qty;
    const taxRate = parseFloat(o.salesTaxRate) || 0;
    subtotal += sell;
    taxTotal += taxRate > 0 ? sell * (taxRate / 100) : 0;
  });
  const total = subtotal + taxTotal;
  const dpct = depositPercent ?? 100;
  return (
    <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '4px', fontSize: '12px', lineHeight: '1.8' }}>
      <p style={{ margin: 0 }}>Sub Total: ${fmt(subtotal)}</p>
      <p style={{ margin: 0 }}>Sales Tax: ${fmt(taxTotal)}</p>
      <p style={{ margin: 0 }}>Total: ${fmt(total)}</p>
      <p style={{ margin: 0, fontWeight: '700' }}>Required Deposit ({dpct}%): ${fmt(total * dpct / 100)}</p>
    </div>
  );
};

// ─── Convert paginated item list into room tables ─────────────────────────────
const renderPageItems = (items) => {
  const sections = []; let cur = null;
  items.forEach(item => {
    if (item.type === 'room-header') { if (cur) sections.push(cur); cur = { room: item.room, rows: [] }; }
    else { if (!cur) cur = { room: item.room || '—', rows: [] }; cur.rows.push(item); }
  });
  if (cur) sections.push(cur);
  return sections.map(({ room, rows }, si) => (
    <div key={si} style={{ marginBottom: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
        <colgroup><col style={{ width: '88px' }} /><col /><col style={{ width: '148px' }} /></colgroup>
        <thead>
          <tr>
            <th colSpan={3} style={{ background: '#f0f0f0', padding: '6px 8px', textAlign: 'center', fontWeight: '600', fontSize: '13px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid #ccc' }}>
              {room}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => <ProductRow key={i} product={item.product} isFirst={item.isFirst} />)}
        </tbody>
      </table>
    </div>
  ));
};

// ─── Warranty page ────────────────────────────────────────────────────────────
const WarrantyPage = () => (
  <div style={{ width: '8.5in', height: '11in', overflow: 'hidden', position: 'relative', boxSizing: 'border-box', padding: `${PAD_IN}in ${PAD_IN}in ${FOOT_IN}in ${PAD_IN}in`, fontFamily: 'Arial, sans-serif', fontSize: '12px', background: 'white', pageBreakBefore: 'always', breakBefore: 'page' }}>
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
    <PageFooter />
  </div>
);

// ─── Signature page ───────────────────────────────────────────────────────────
const SignaturePage = ({ clientInfo, proposalNumber, depositPercent = 100 }) => {
  const today = new Date().toLocaleDateString();
  return (
    <div style={{ width: '8.5in', height: '11in', overflow: 'hidden', position: 'relative', boxSizing: 'border-box', padding: `${PAD_IN}in ${PAD_IN}in ${FOOT_IN}in ${PAD_IN}in`, fontFamily: 'Arial, sans-serif', fontSize: '12px', background: 'white', pageBreakBefore: 'always', breakBefore: 'page' }}>
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
        <p style={{ marginTop: '30px', fontWeight: '700' }}>{depositPercent}% Deposit</p>
        <p style={{ marginTop: '30px' }}>Accept and Approve:</p>
        <div style={{ borderTop: '1px solid black', marginTop: '56px', paddingTop: '6px', fontSize: '11.5px' }}>Signature</div>
      </div>
      <PageFooter />
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const BulkProposalPrint = () => {
  const [searchParams] = useSearchParams();
  const refs = (searchParams.get('refs') || '').split(',').filter(Boolean);
  const ids  = (searchParams.get('ids')  || '').split(',').filter(Boolean);

  const [rawProposals, setRawProposals] = useState([]);
  const [paginatedProposals, setPaginatedProposals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Step 1: fetch proposal data ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        let fetches;
        if (refs.length > 0) {
          fetches = refs.map(ref => {
            const ci = ref.lastIndexOf(':');
            const orderId = ref.slice(0, ci);
            const ver = ref.slice(ci + 1);
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
        const loaded = results.filter(r => r.success).map(r => {
          const d = r.data;
          const u = d.user || {};
          const addr = u.address || {};
          const ci = d.clientInfo || {};
          const street = ci.street || addr.street?.trim() || '';
          const cityParts = ci.cityLine
            ? [ci.cityLine]
            : [addr.city, addr.state, addr.zipcode].filter(p => p && p.trim());
          return {
            proposalData: d,
            proposalNumber: d.proposalNumber || '—',
            depositPercent: d.depositPercent ?? 100,
            clientInfo: {
              ...ci,
              name: ci.name || u.name || '—',
              email: ci.email || u.email || '',
              unitNumber: ci.unitNumber || u.unitNumber || '',
              street,
              cityLine: cityParts.join(', '),
            },
          };
        });
        setRawProposals(loaded);
      } catch {
        setError('Failed to load proposals. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    if (refs.length > 0 || ids.length > 0) load(); else setLoading(false);
  }, []);

  // ── Step 2: JS pagination via DOM measurement (identical to ProposalEditor) ──
  useEffect(() => {
    if (rawProposals.length === 0 || paginatedProposals !== null) return;

    const CONTENT_W = (PAGE_W_IN - PAD_IN * 2) * PX;
    const COL1 = 88, COL3 = 148;
    const midW = CONTENT_W - COL1 - COL3;

    // Hidden sandbox for measurement
    const sandbox = document.createElement('div');
    sandbox.style.cssText = `position:fixed;top:0;left:-9999px;width:${CONTENT_W}px;background:white;z-index:-9999;font-size:12px;line-height:1.55;font-family:Arial,sans-serif;visibility:visible;opacity:0;pointer-events:none`;
    document.body.appendChild(sandbox);

    const measure = (el) => {
      sandbox.appendChild(el);
      const h = el.getBoundingClientRect().height;
      sandbox.removeChild(el);
      return Math.ceil(h) + 8;
    };

    // Measure continuation header (same for all proposals)
    const contEl = document.createElement('div');
    contEl.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:10px;font-size:11px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:5px';
    contEl.innerHTML = '<span>Client — Products (continued)</span><span>Proposal #: ---</span>';
    const contH = measure(contEl);

    const result = rawProposals.map(({ proposalData, clientInfo, proposalNumber, depositPercent }) => {
      // Measure P1Header height for this specific proposal's client info
      const hEl = document.createElement('div');
      const ciLines = [
        `<p style="margin:0;font-weight:600">${esc(clientInfo.name || '—')}</p>`,
        clientInfo.street ? `<p style="margin:0">${esc(clientInfo.street)}${clientInfo.unitNumber?.trim() ? ', #' + esc(clientInfo.unitNumber) : ''}</p>` : '',
        clientInfo.cityLine ? `<p style="margin:0">${esc(clientInfo.cityLine)}</p>` : '',
        clientInfo.email ? `<p style="margin:0">${esc(clientInfo.email)}</p>` : '',
      ].join('');
      hEl.innerHTML = `
        <div style="text-align:center;margin-bottom:14px"><div style="height:44px;display:inline-block;width:1px"></div></div>
        <div style="font-weight:700;margin-bottom:12px;font-size:16px">Proposal</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div style="font-size:12px;line-height:1.7">${ciLines}</div>
          <div style="text-align:right;font-size:12px;line-height:1.7">
            <p style="margin:0"><strong>Proposal #:</strong> ${esc(proposalNumber || '—')}</p>
            <p style="margin:0">Proposal Date: today</p>
          </div>
        </div>
        <div style="margin-bottom:12px;font-size:12px"><span style="color:#1e3a5f;font-weight:500">Project: Ālia</span></div>
      `;
      const headerH = measure(hEl);

      // Build room groups
      const roomMap = new Map();
      (proposalData.selectedProducts || []).forEach(p => {
        const room = p.selectedOptions?.room?.trim() || '—';
        if (!roomMap.has(room)) roomMap.set(room, []);
        roomMap.get(room).push(p);
      });
      const roomGroups = sortRoomEntries(Array.from(roomMap.entries()));

      // Measure each item
      const items = [];
      roomGroups.forEach(([room, rps]) => {
        const rhEl = document.createElement('div');
        rhEl.style.cssText = 'padding:6px 8px;font-weight:600;font-size:13px;background:#f0f0f0';
        rhEl.textContent = room;
        items.push({ type: 'room-header', room, height: measure(rhEl) });

        rps.forEach((p, i) => {
          const o = p.selectedOptions || {};
          const ca = typeof o.customAttributes === 'object' && !Array.isArray(o.customAttributes) ? o.customAttributes : {};
          const materials = ca.materials || '';
          const lines = [];
          if (p.name) lines.push(`<div style="font-weight:600;font-size:13px;margin-bottom:3px">${esc(p.name)}</div>`);
          if (o.specifications) lines.push(`<div style="white-space:pre-wrap">${esc(String(o.specifications))}</div>`);
          if (o.finish) lines.push(`<div><strong>Color / Finish:</strong> ${esc(resolveFinish(o.finish))}</div>`);
          if (o.leadTime) lines.push(`<div><strong>Lead Time:</strong> ${esc(o.leadTime)}</div>`);
          if (o.fabric) lines.push(`<div><strong>Fabric:</strong> ${esc(resolveFabric(o.fabric))}</div>`);
          if (o.size) lines.push(`<div><strong>Dimensions:</strong> ${esc(o.size)}</div>`);
          if (materials) lines.push(`<div><strong>Materials:</strong> ${esc(materials)}</div>`);

          const mw = document.createElement('div');
          mw.style.cssText = `width:${midW}px;padding:7px 9px;font-size:12px;line-height:1.55;box-sizing:border-box`;
          mw.innerHTML = lines.join('');
          const midH = measure(mw) + 6;

          items.push({ type: 'product', room, product: p, isFirst: i === 0, height: Math.max(92, midH) + 8 });
        });
      });

      const firstPageH = CONTENT_H - headerH;
      const contPageH  = CONTENT_H - contH;
      const pages = packItems(items, firstPageH, contPageH);

      return { pages, clientInfo, proposalNumber, depositPercent, products: proposalData.selectedProducts || [] };
    });

    document.body.removeChild(sandbox);
    setPaginatedProposals(result);
  }, [rawProposals, paginatedProposals]);

  // ── Render ───────────────────────────────────────────────────────────────────
  const stillPaginating = !loading && rawProposals.length > 0 && paginatedProposals === null;

  if (loading || stillPaginating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12, fontFamily: 'Arial, sans-serif' }}>
        <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#005670' }} />
        <span style={{ color: '#6b7280', fontSize: 14 }}>{loading ? 'Loading proposals…' : 'Paginating…'}</span>
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

  if (!paginatedProposals || paginatedProposals.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#6b7280' }}>
        No proposals found.
      </div>
    );
  }

  const lastProposal = paginatedProposals[paginatedProposals.length - 1];
  const pageStyle = {
    width: '8.5in', height: '11in', overflow: 'hidden',
    position: 'relative', boxSizing: 'border-box',
    padding: `${PAD_IN}in ${PAD_IN}in ${FOOT_IN}in ${PAD_IN}in`,
    fontFamily: 'Arial, sans-serif', fontSize: '12px',
    background: 'white',
    pageBreakAfter: 'always', breakAfter: 'page',
    marginBottom: '8px',
  };

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

      {/* Toolbar */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#005670', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif' }}>
        <div>
          <strong style={{ fontSize: 15 }}>Bulk Proposal Print</strong>
          <span style={{ marginLeft: 12, fontSize: 13, opacity: 0.8 }}>{paginatedProposals.length} proposal{paginatedProposals.length !== 1 ? 's' : ''}</span>
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

      {/* Pages */}
      <div style={{ padding: '20px 0' }}>
        {paginatedProposals.map(({ pages, clientInfo, proposalNumber, depositPercent, products }, pi) =>
          pages.map((pageItems, pageIdx) => (
            <div key={`${pi}-${pageIdx}`} style={pageStyle}>
              {pageIdx === 0
                ? <P1Header clientInfo={clientInfo} proposalNumber={proposalNumber} />
                : <ContHeader clientInfo={clientInfo} proposalNumber={proposalNumber} />
              }
              {renderPageItems(pageItems)}
              {pageIdx === pages.length - 1 && (
                <TotalsBlock products={products} depositPercent={depositPercent} />
              )}
              <PageFooter />
            </div>
          ))
        )}

        <WarrantyPage />

        <SignaturePage
          clientInfo={lastProposal.clientInfo}
          proposalNumber={lastProposal.proposalNumber}
          depositPercent={lastProposal.depositPercent}
        />
      </div>
    </>
  );
};

export default BulkProposalPrint;
