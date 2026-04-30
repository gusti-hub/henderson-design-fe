// components/ProposalEditor.jsx
//
// STRATEGY:
// 1. Render ALL products in a hidden off-screen div at exact print width
// 2. After 300ms (images + fonts settled), read each row's real height
// 3. Bin-pack rows into 8.5×11in pages — room header always with its first row
// 4. Each final page is exactly 8.5×11in with footer pinned at bottom
// 5. Web view = PDF view (identical fixed pages)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Printer, ChevronLeft } from 'lucide-react';
import { backendServer } from '../utils/info';

// ── Constants ────────────────────────────────────────────────────────────────
const LOGO_FILTER = 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)';
const FINISH_LABELS = { LT:'Light Oak', MD:'Medium Teak', DK:'Dark Teak', WH:'White', BK:'Black', GY:'Grey', NL:'Natural', WN:'Walnut' };
const resolveFinish = c => { if (!c) return ''; const u = c.trim().toUpperCase(); return FINISH_LABELS[u] || c; };

const FABRIC_CODES = {
  '01':'Merino Snow',    '02':'Merino Wool',       '03':'Merino Cloud',
  '04':'Peppin Silver',  '05':'Peppin Jute',        '06':'Peppin Chess',
  '07':'Navara-011',     '08':'Navara-012',          '09':'Navara-013',
  '10':'Palopo #WR160',  '11':'Dayevella Stone',     '12':'Peppin Portobelo',
  '13':'Merino Silver',  '14':'Merino Light Grey',   '15':'Merino Pebble',
  '16':'Lagoon #WR141',  '17':'Lagoon #WR160',       '18':'Peppin Coblestone',
  '19':'Peppin Jute',    '20':'Peppin Chess',
  '0A':'Gusto Angora',   '0B':'Gusto Shell',         '0C':'Gusto Dune',
  '0D':'Indulge Swan',   '0E':'Indulge Dune',        '0F':'Indulge Sand',
  '0G':'Navara-011',     '0H':'Navara-012',          '0I':'Navara-013',
  '0J':'Evo Creame',     '0K':'Evo Plaza',           '0L':'Evo Sand',
  '0M':'Drama Wool',     '0N':'Drama Marble',        '0O':'Drama Linen',
  '0P':'Chill Out Ivory','0Q':'Chill Out Antique',   '0R':'Chill Out Chinchilla',
  '0S':'Rewind Sesame',  '0T':'Rewind Marble',       '0U':'Rewind Gull',
};
const resolveFabric = c => {
  if (!c) return '';
  const u = c.trim().toUpperCase();
  return FABRIC_CODES[u] || c; // show name if code found, else show raw value
};

// Page geometry at 96dpi
const PAGE_W_IN  = 8.5;
const PAGE_H_IN  = 11;
const PAD_IN     = 0.5;   // top/left/right padding inside page
const FOOT_IN    = 0.85;  // bottom reserved for footer
const SAFE_PX    = 60;    // extra safety buffer

const PX         = 96;
const CONTENT_H  = (PAGE_H_IN - PAD_IN - FOOT_IN) * PX - SAFE_PX; // ≈ 840px usable

// ── Helpers ──────────────────────────────────────────────────────────────────
const getImgSrc = p => {
  const o = p.selectedOptions || {};
  return [o?.uploadedImages?.[0]?.url, o?.image, o?.images?.[0], p.image, p.imageUrl]
    .find(s => s && typeof s === 'string' && s.trim()) || null;
};

const preloadImages = urls =>
  Promise.all(urls.map(url => new Promise(res => {
    const img = new window.Image();
    img.onload = img.onerror = res;
    img.src = url;
  })));

// ── Footer (absolute bottom of every page) ───────────────────────────────────
const PageFooter = () => (
  <div style={{
    position: 'absolute',
    bottom: '0.28in',
    left: `${PAD_IN}in`, right: `${PAD_IN}in`,
    borderTop: '1px solid #d1d5db',
    paddingTop: '5px',
    textAlign: 'center',
    fontSize: '9px',
    color: 'rgb(0,86,112)',
    lineHeight: '1.5',
    background: 'white',
  }}>
    <p style={{ margin: 0 }}>Henderson Design Group 4343 Royal Place, Honolulu, HI, 96816</p>
    <p style={{ margin: 0 }}>Phone: (808) 315-8782</p>
  </div>
);

// ── ProductRow ───────────────────────────────────────────────────────────────
const ProductRow = React.forwardRef(({ product, isFirst = false }, ref) => {
  const o = product.selectedOptions || {};
  const imgSrc = getImgSrc(product);
  const qty = product.quantity || 1;
  const net = o.netCostOverride != null
    ? parseFloat(o.netCostOverride)
    : (parseFloat(o.msrp) || 0) * (1 - (parseFloat(o.discountPercent) || 0) / 100);
  const sell = net * (1 + (parseFloat(o.markupPercent) || 0) / 100);
  const sub  = sell * qty;
  const taxRate = parseFloat(o.salesTaxRate) || 0;
  const tax  = taxRate > 0 ? sub * (taxRate / 100) : 0;
  const total = sub + tax;
  const bt = isFirst ? 'none' : '1px solid #e5e7eb';
  const tdBase = { borderTop: bt, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' };

  return (
    <tr ref={ref}>
      <td style={{ ...tdBase, width: '76px', padding: '6px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '64px', height: '64px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
        }
      </td>
      <td style={{ ...tdBase, padding: '6px 8px', fontSize: '9.5px', lineHeight: '1.5', textAlign: 'left', verticalAlign: 'top' }}>
        <div style={{ fontWeight: '600', marginBottom: '2px', fontSize: '10px' }}>{product.name || 'Untitled'}</div>
        {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#374151', marginBottom: '1px' }}>{o.specifications}</div>}
        {o.finish    && <div><strong>Finish:</strong> {resolveFinish(o.finish)}</div>}
        {o.fabric    && <div><strong>Fabric:</strong> {resolveFabric(o.fabric)}</div>}
        {o.size      && <div><strong>Size:</strong> {o.size}</div>}
        {o.itemClass && <div><strong>Class:</strong> {o.itemClass}</div>}

      </td>
      <td style={{ ...tdBase, width: '140px', padding: '6px 4px', fontSize: '9.5px', textAlign: 'right', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Qty:</span><span>{qty} {o.units || 'Each'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Unit:</span><span>${sell.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span>${sub.toFixed(2)}</span></div>
        {taxRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Tax ({taxRate}%):</span><span>${tax.toFixed(2)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #d1d5db', paddingTop: '2px', marginTop: '2px' }}>
          <span>Total:</span><span>${total.toFixed(2)}</span>
        </div>
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';

// ── RoomTable (used in both measure pass and final render) ───────────────────
const RoomTable = ({ room, rows }) => (
  <div style={{ marginBottom: '10px' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed',
      borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
      <colgroup>
        <col style={{ width: '76px' }} /><col /><col style={{ width: '140px' }} />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={3} style={{
            background: '#f0f0f0', padding: '5px 7px', textAlign: 'center',
            fontWeight: '600', fontSize: '10.5px',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid #ccc',
          }}>
            {room}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ product, isFirst }, i) => (
          <ProductRow key={i} product={product} isFirst={i === 0} />
        ))}
      </tbody>
    </table>
  </div>
);

// ── Render items → grouped RoomTables ────────────────────────────────────────
const renderItems = items => {
  const sections = []; let cur = null;
  items.forEach(item => {
    if (item.type === 'room-header') {
      if (cur) sections.push(cur);
      cur = { room: item.room, rows: [] };
    } else {
      if (!cur) cur = { room: item.room, rows: [] };
      cur.rows.push({ product: item.product, isFirst: item.isFirst });
    }
  });
  if (cur) sections.push(cur);
  return sections.map(({ room, rows }) => <RoomTable key={room} room={room} rows={rows} />);
};

// ── VersionModal ─────────────────────────────────────────────────────────────
const VersionModal = ({ orderId, isOpen, onClose, onSelectVersion, versionNotes, setVersionNotes, onSaveNewVersion, saving }) => {
  const [versions, setVersions] = useState([]);
  const [lv, setLv] = useState(true);
  useEffect(() => { if (isOpen === true) load(); }, [isOpen]);
  const load = async () => {
    try {
      const t = localStorage.getItem('token');
      const r = await (await fetch(`${backendServer}/api/proposals/${orderId}/versions/all`, { headers: { Authorization: `Bearer ${t}` } })).json();
      if (r.success) setVersions(r.data);
    } catch (e) { console.error(e); } finally { setLv(false); }
  };
  if (!isOpen) return null;
  if (isOpen === 'new') return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold">Save as New Version</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Version Notes <span className="text-red-500">*</span></label>
          <textarea value={versionNotes} onChange={e => setVersionNotes(e.target.value)} placeholder="Describe the changes..." className="w-full p-3 border border-gray-300 rounded-lg" rows={4} />
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={onSaveNewVersion} disabled={saving || !versionNotes.trim()} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save as New Version'}</button>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div><h3 className="text-xl font-bold">Version History</h3><p className="text-sm text-white/80 mt-1">View and manage all proposal versions</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-auto max-h-[calc(80vh-88px)]">
          {lv ? <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670] mx-auto" /></div>
            : versions.length === 0 ? <div className="p-12 text-center text-gray-500">No versions found</div>
              : <div className="divide-y">{versions.map(v => (
                <div key={v._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Version {v.version}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${v.status === 'draft' ? 'bg-gray-100 text-gray-700' : v.status === 'sent' ? 'bg-blue-100 text-blue-700' : v.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{v.notes}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {new Date(v.createdAt).toLocaleDateString()} by {v.createdBy?.name || 'Unknown'}</span>
                        {v.updatedAt && v.updatedAt !== v.createdAt && <span>Updated: {new Date(v.updatedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button onClick={() => onSelectVersion(v.version)} className="ml-4 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium whitespace-nowrap">View/Edit</button>
                  </div>
                </div>
              ))}</div>}
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const ProposalEditor = ({ orderId, version, onClose }) => {
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [products, setProducts]         = useState([]);
  const [clientInfo, setClientInfo]     = useState({});
  const [proposalNumber, setProposalNumber]               = useState(null);
  const [showVersionModal, setShowVersionModal]           = useState(false);
  const [versionNotes, setVersionNotes]                   = useState('');
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [originalTitle]                                   = useState(document.title);

  // pages = null → measuring; array → done
  const [pages, setPages]     = useState(null);
  const [ready, setReady]     = useState(false);


  // Measure refs
  const measureRef  = useRef(null);
  const headerRef   = useRef(null);
  const rowRefs     = useRef({});
  const roomHdRefs  = useRef({});
  const didPaginate = useRef(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => { loadProposalData(); }, [orderId, version]);

  useEffect(() => {
    if (proposalData && clientInfo.name) {
      const cn = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const un = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      document.title = `Proposal_${cn}${un ? '_' + un : ''}_v${proposalData.version || 1}_${new Date().toISOString().split('T')[0]}`;
    }
    return () => { document.title = originalTitle; };
  }, [proposalData, clientInfo, originalTitle]);

  const loadProposalData = async () => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/${version || 'latest'}`, { headers: { Authorization: `Bearer ${t}` } });
      const r = await res.json();
      if (r.success) {
        setProposalData(r.data);
        setProducts(r.data.selectedProducts || []);
        const u = r.data.user || {};
        const addr = u.address || {};
        const parts = [addr.street, addr.city, addr.state, addr.zipcode, addr.country].filter(p => p && p.trim());
        setClientInfo({
          ...(r.data.clientInfo || {}),
          email: r.data.clientInfo?.email || u.email || '',
          address: parts.join(', '),
        });
        setProposalNumber(r.data.proposalNumber || null);
      }
    } catch (e) { console.error(e); alert('Failed to load proposal data'); }
    finally { setLoading(false); }
  };

  // Reset pagination when products change
  useEffect(() => {
    if (products.length === 0) { setPages([[]]); setReady(true); return; }
    didPaginate.current = false;
    rowRefs.current = {};
    roomHdRefs.current = {};
    setPages(null);
    setReady(false);
  }, [products]);

  const handleSaveAsNewVersion = async () => {
    if (!versionNotes.trim()) { alert('Please add notes for this new version'); return; }
    setSaving(true);
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/new-version`, {
        method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, clientInfo, notes: versionNotes })
      });
      const r = await res.json();
      if (r.success) {
        if (r.proposalNumber) setProposalNumber(r.proposalNumber);
        setProposalData(prev => ({ ...prev, version: r.data.version }));
        alert(`✅ Version ${r.data.version} created successfully`);
        setShowVersionModal(false); setVersionNotes(''); loadProposalData();
      }
    } catch (e) { console.error(e); alert('Failed to create new version'); }
    finally { setSaving(false); }
  };

  const calcTotals = () => {
    let sub = 0, taxT = 0;
    products.forEach(p => {
      const o = p.selectedOptions || {}, qty = p.quantity || 1;
      const net = o.netCostOverride != null ? parseFloat(o.netCostOverride) : (parseFloat(o.msrp) || 0) * (1 - (parseFloat(o.discountPercent) || 0) / 100);
      const sell = net * (1 + (parseFloat(o.markupPercent) || 0) / 100);
      const line = sell * qty, tax = parseFloat(o.salesTaxRate) || 0;
      sub += line; taxT += tax > 0 ? line * (tax / 100) : 0;
    });
    const total = sub + taxT;
    return { subtotal: sub, salesTax: taxT, total, deposit: total * 0.9 };
  };

  const buildRoomGroups = useCallback(() => {
    const map = new Map();
    products.forEach(p => {
      const room = p.selectedOptions?.room?.trim() || '-';
      if (!map.has(room)) map.set(room, []);
      map.get(room).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === '-') return 1; if (b === '-') return -1; return a.localeCompare(b);
    });
  }, [products]);



  // Pack items into pages (pure function, no side effects)
  const packItems = (items, headerH) => {
    const result = [];
    let cur = [], used = headerH;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'room-header') {
        const nextH = items[i + 1]?.height || 0;
        if (used + item.height + nextH > CONTENT_H && cur.length > 0) {
          result.push(cur); cur = []; used = 0;
        }
        cur.push(item); used += item.height;
      } else {
        if (used + item.height > CONTENT_H && cur.length > 0) {
          result.push(cur); cur = []; used = 0;
        }
        cur.push(item); used += item.height;
      }
    }
    if (cur.length > 0) result.push(cur);
    if (result.length === 0) result.push([]);
    return result;
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const paginate = useCallback(() => {
    if (didPaginate.current) return;
    didPaginate.current = true;

    const rg = buildRoomGroups();

    // ── Measure via clone in a real visible off-screen container ──────────
    // visibility:hidden containers return wrong heights for <tr> elements.
    // We create a temporary fully-rendered div, measure, then remove it.
    const CONTENT_W = (PAGE_W_IN - PAD_IN * 2) * PX; // exact content width in px
    const COL1 = 76, COL3 = 140;

    const sandbox = document.createElement('div');
    sandbox.style.cssText = [
      'position:fixed', 'top:0', 'left:-9999px',
      `width:${CONTENT_W}px`,
      'background:white', 'z-index:-9999',
      'font-size:9.5px', 'line-height:1.5',
      'font-family:inherit',
      'visibility:visible', 'opacity:0',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(sandbox);

    const measureEl = (html) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      sandbox.appendChild(wrapper);
      const h = wrapper.getBoundingClientRect().height;
      sandbox.removeChild(wrapper);
      return Math.ceil(h) + 8; // +8px buffer per item
    };

    // Measure page-1 header
    const headerH = headerRef.current
      ? Math.ceil(headerRef.current.getBoundingClientRect().height) + 8
      : 200;

    const items = [];
    rg.forEach(([room, rps]) => {
      // Room header height
      const rhH = measureEl(
        `<div style="padding:5px 7px;font-weight:600;font-size:10.5px;background:#f0f0f0">${room}</div>`
      );
      items.push({ type: 'room-header', room, height: rhH });

      rps.forEach((p, i) => {
        const o = p.selectedOptions || {};
        // Build the same content as ProductRow middle column
        const lines = [];
        if (p.name) lines.push(`<div style="font-weight:600;font-size:10px;margin-bottom:2px">${p.name}</div>`);
        if (o.specifications) lines.push(`<div style="white-space:pre-wrap">${o.specifications}</div>`);
        if (o.finish) lines.push(`<div><strong>Finish:</strong> ${o.finish}</div>`);
        if (o.fabric) lines.push(`<div><strong>Fabric:</strong> ${o.fabric}</div>`);
        if (o.size)   lines.push(`<div><strong>Size:</strong> ${o.size}</div>`);
        if (o.itemClass) lines.push(`<div><strong>Class:</strong> ${o.itemClass}</div>`);

        // Pricing column (right, 140px wide) — count lines
        const priceLines = 2 + (parseFloat(o.salesTaxRate) > 0 ? 1 : 0) + 1; // qty+unit+[tax]+total
        const priceH = priceLines * 15 + 16; // approx

        // Image: always 64+12 = 76px
        const imgH = 76;

        // Measure middle column at its real width
        const midW = CONTENT_W - COL1 - COL3;
        const midWrapper = document.createElement('div');
        midWrapper.style.cssText = `width:${midW}px;padding:6px 8px;font-size:9.5px;line-height:1.5;box-sizing:border-box`;
        midWrapper.innerHTML = lines.join('');
        sandbox.appendChild(midWrapper);
        const midH = Math.ceil(midWrapper.getBoundingClientRect().height) + 12;
        sandbox.removeChild(midWrapper);

        // Row height = max of image, middle text, pricing
        const rowH = Math.max(imgH, midH, priceH) + 8;
        items.push({ type: 'product', room, product: p, isFirst: i === 0, height: rowH });
      });
    });

    document.body.removeChild(sandbox);

    const packed = packItems(items, headerH);
    setPages(packed);
    setReady(true);
  }, [buildRoomGroups]);

  // No DOM verify pass — overflow handled in packItems

  // No DOM verify pass needed — overflow handled in packItems with real heights

  // Trigger: preload images → 300ms settle → paginate
  useEffect(() => {
    if (pages !== null || products.length === 0) return;
    const urls = products.map(getImgSrc).filter(Boolean);
    preloadImages(urls).then(() => {
      setTimeout(() => paginate(), 300);
    });
  }, [pages, products, paginate]);

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (proposalData && clientInfo.name) {
      const cn = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const un = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      document.title = `Proposal_${cn}${un ? '_' + un : ''}_v${proposalData.version || 1}_${new Date().toISOString().split('T')[0]}`;
    }
    setTimeout(() => window.print(), 100);
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]" /></div>;

  const totals = calcTotals();
  const dpn    = proposalNumber || '—';
  const today  = new Date().toLocaleDateString();
  const rg     = buildRoomGroups();
  const totalPP = pages?.length || 0;

  // ── Shared page 1 header content ──────────────────────────────────────────
  const P1Header = ({ forMeasure = false }) => (
    <div ref={forMeasure ? headerRef : undefined}>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <img src="/images/HDG-Logo.png" alt="Henderson Design Group"
          style={{ height: '40px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
      </div>
      <div style={{ color: '#7f1d1d', fontWeight: '700', marginBottom: '10px', fontSize: '12px' }}>Proposal</div>
      <div style={{ marginBottom: '12px', fontSize: '10.5px', lineHeight: '1.6' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name || '—'}</p>
        {clientInfo.unitNumber && <p style={{ margin: 0 }}>{clientInfo.unitNumber}</p>}
        {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
        {clientInfo.address && <p style={{ margin: 0 }}>{clientInfo.address}</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '10.5px' }}>
        <div style={{ color: '#1e3a5f' }}>Project: Ālia</div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}><strong>Proposal #:</strong> {dpn}</p>
          <p style={{ margin: 0 }}>Proposal Date: {today}</p>
        </div>
      </div>
    </div>
  );

  const ContHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '9.5px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
      <span>{clientInfo.name} — Products (continued)</span>
      <span>Proposal #: {dpn}</span>
    </div>
  );

  const slotStyle = {
    position: 'absolute',
    top: `${PAD_IN}in`,
    left: `${PAD_IN}in`,
    right: `${PAD_IN}in`,
    bottom: `${FOOT_IN}in`,
    overflow: 'hidden',
  };

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white; }
          .no-print, .mbox { display: none !important; }
          .lp {
            width: 8.5in !important; height: 11in !important;
            overflow: hidden !important;
            page-break-after: always !important; break-after: page !important;
            box-shadow: none !important; margin: 0 !important; position: relative !important;
          }
          .lp.last { page-break-after: avoid !important; break-after: avoid !important; }
        }
        @page { size: 8.5in 11in; margin: 0; }

        /* Screen */
        .pw  { background: #b8b8b8; padding: 20px 0 40px; }
        .pgl {
          display: block; width: 8.5in; margin: 0 auto;
          background: #005670; color: white; font-size: 10px; font-weight: 600;
          padding: 3px 14px; border-radius: 4px 4px 0 0; box-sizing: border-box;
          letter-spacing: 0.03em;
        }
        .lp {
          position: relative; background: white;
          width: 8.5in; height: 11in;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.18);
          margin: 0 auto; box-sizing: border-box;
        }
        .pgap { width: 8.5in; height: 16px; background: #b8b8b8; margin: 0 auto; }

        /* Measure box: off-screen, exact content width, never display:none */
        .mbox {
          position: fixed; top: -9999px; left: -9999px;
          width: ${(PAGE_W_IN - PAD_IN * 2)}in;
          background: white; visibility: hidden;
          pointer-events: none; z-index: -999;
          overflow: visible;
        }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ChevronLeft className="w-5 h-5" /> Back to Orders</button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#005670] font-mono">{dpn}</span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-sm text-gray-500">Version {proposalData?.version || 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVersionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"><Clock className="w-4 h-4" /> Version History</button>
          <button onClick={() => setShowPrintInstructions(true)} className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4" /> Print / Save PDF</button>
        </div>
      </div>

      {/* ── Hidden measure box ── */}
      <div className="mbox" ref={measureRef}>
        <P1Header forMeasure={true} />
        {rg.map(([room, rps]) => (
          <table key={room} style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup><col style={{ width: '76px' }} /><col /><col style={{ width: '140px' }} /></colgroup>
            <tbody>
              <tr ref={el => { if (el) roomHdRefs.current[room] = el; }}>
                <td colSpan={3} style={{ padding: '5px 7px', fontWeight: '600', fontSize: '10.5px', background: '#f0f0f0' }}>{room}</td>
              </tr>
              {rps.map((p, i) => {
                const key = `${room}__${i}`;
                return (
                  <ProductRow key={key} product={p} isFirst={i === 0}
                    ref={el => { if (el) rowRefs.current[key] = el; }} />
                );
              })}
            </tbody>
          </table>
        ))}
      </div>

      {/* ── Pages ── */}
      <div className="pw">
        <div className="print-area">
          {!ready ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005670]" />
            </div>
          ) : (
            <>
              {/* Product pages */}
              {(pages || []).map((items, pi) => (
                <React.Fragment key={pi}>
                  <span className="pgl no-print">
                    Page {pi + 1}{(pages || []).length > 1 ? ` — Products (${pi + 1}/${(pages || []).length})` : ' — Products'}
                  </span>
                  <div className="lp">
                    <div style={slotStyle}>
                      {pi === 0 ? <P1Header /> : <ContHeader />}
                      {renderItems(items)}
                    </div>
                    <PageFooter />
                  </div>
                  <div className="pgap no-print" />
                </React.Fragment>
              ))}

              {/* Warranty page */}
              <span className="pgl no-print">Page {totalPP + 1} — Warranty &amp; Terms</span>
              <div className="lp">
                <div style={slotStyle}>
                  <div style={{ textAlign: 'right', marginBottom: '14px', fontSize: '10.5px', lineHeight: '1.8' }}>
                    <p style={{ margin: 0 }}>Sub Total: ${totals.subtotal.toFixed(2)}</p>
                    <p style={{ margin: 0 }}>Sales Tax: ${totals.salesTax.toFixed(2)}</p>
                    <p style={{ margin: 0 }}>Total: ${totals.total.toFixed(2)}</p>
                    <p style={{ margin: 0, fontWeight: '700' }}>Required Deposit: ${totals.deposit.toFixed(2)}</p>
                  </div>
                  <div style={{ color: '#7f1d1d', fontWeight: '700', marginBottom: '10px', fontSize: '12px' }}>
                    Proposal Terms: Henderson Design Group Warranty Terms and Conditions
                  </div>
                  <div style={{ fontSize: '9.5px', lineHeight: '1.6' }}>
                    <p style={{ marginTop: 0 }}><strong>Coverage Period:</strong> Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.</p>
                    <p><strong>Scope of Warranty:</strong></p>
                    <ul style={{ marginLeft: '14px', marginTop: '2px', marginBottom: '6px' }}>
                      <li>Workmanship, Materials, and Functionality: The warranty covers defects in workmanship, materials, and functionality under normal wear and tear conditions.</li>
                      <li>Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will, at its discretion, either repair or replace the defective item.</li>
                    </ul>
                    <p><strong>Returns and Exchanges:</strong></p>
                    <ul style={{ marginLeft: '14px', marginTop: '2px', marginBottom: '6px' }}>
                      <li>No Returns: Items are not eligible for returns.</li>
                      <li>No Exchanges: Exchanges are not permitted except in cases of defects.</li>
                      <li>Custom Items: Custom items, including upholstery, are not eligible for returns or exchanges.</li>
                    </ul>
                    <p><strong>Exclusions:</strong></p>
                    <ul style={{ marginLeft: '14px', marginTop: '2px', marginBottom: '6px' }}>
                      <li>Negligence, Misuse, or Accidents: The warranty does not cover defects resulting from negligence, misuse, or accidents after installation.</li>
                      <li>Maintenance and Commercial Use: Void for any condition resulting from incorrect or inadequate maintenance.</li>
                      <li>Non-Residential Use: Void for any condition resulting from other than ordinary residential wear.</li>
                      <li>Natural Material Variations: Does not cover matching of color, grain, or texture of wood, leather, or fabrics.</li>
                      <li>Environmental Responses: Wood may expand and contract in response to temperature and humidity changes.</li>
                      <li>Fabric and Leather Wear: Does not cover colorfastness, dye lot variations, wrinkling, or wear of fabrics or leather.</li>
                      <li>Sun Exposure: Extensive exposure to the sun is not covered.</li>
                      <li>Fabric Protectants: Applying a fabric protectant could void the Henderson warranty.</li>
                    </ul>
                  </div>
                </div>
                <PageFooter />
              </div>
              <div className="pgap no-print" />

              {/* Signature page */}
              <span className="pgl no-print">Page {totalPP + 2} — Signature</span>
              <div className="lp last">
                <div style={slotStyle}>
                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <img src="/images/HDG-Logo.png" alt="Henderson Design Group"
                      style={{ height: '40px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
                  </div>
                  <div style={{ color: '#7f1d1d', fontWeight: '700', marginBottom: '10px', fontSize: '12px' }}>Proposal</div>
                  <div style={{ marginBottom: '12px', fontSize: '10.5px', lineHeight: '1.6' }}>
                    <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name}</p>
                    {clientInfo.unitNumber && <p style={{ margin: 0 }}>{clientInfo.unitNumber}</p>}
                    {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
                    {clientInfo.address && <p style={{ margin: 0 }}>{clientInfo.address}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '10.5px' }}>
                    <p style={{ margin: 0 }}>Project: Ālia</p>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}><strong>Proposal #:</strong> {dpn}</p>
                      <p style={{ margin: 0 }}>Proposal Date: {today}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '9.5px', lineHeight: '1.6' }}>
                    <ul style={{ marginLeft: '14px', marginTop: '2px', marginBottom: '6px' }}>
                      <li>Original Buyer: The warranty applies to the original buyer only.</li>
                      <li>Original Installation Location: Valid only for furnishings in the space where they were originally installed.</li>
                      <li>Repair, Touch-Up, or Replacement Only: No refunds.</li>
                      <li>Non-Returnable Custom Upholstery: Custom upholstery is non-returnable.</li>
                      <li>Non-Transferable Warranty: The warranty is non-transferable.</li>
                    </ul>
                    <p style={{ marginTop: '30px', fontWeight: '700' }}>100% Deposit</p>
                    <p style={{ marginTop: '30px' }}>Accept and Approve:</p>
                    <div style={{ borderTop: '1px solid black', marginTop: '56px', paddingTop: '6px', fontSize: '10.5px' }}>Signature</div>
                  </div>
                </div>
                <PageFooter />
              </div>
              <div className="no-print" style={{ height: '20px', width: '8.5in', margin: '0 auto', background: '#b8b8b8' }} />
            </>
          )}
        </div>
      </div>

      {/* ── Version Modal ── */}
      {showVersionModal && (
        <VersionModal orderId={orderId} isOpen={showVersionModal}
          onClose={() => { setShowVersionModal(false); setVersionNotes(''); }}
          onSelectVersion={v => { window.location.href = `/admin/proposal/${orderId}/${v}`; }}
          versionNotes={versionNotes} setVersionNotes={setVersionNotes}
          onSaveNewVersion={handleSaveAsNewVersion} saving={saving} />
      )}

      {/* ── Print Instructions ── */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Save as PDF / Print</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">Configure these settings before printing:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { n: 1, title: 'Margins → None', desc: 'Set margins to None — margins are built into the document' },
                  { n: 2, title: 'Scale → 100%', desc: 'Must be exactly 100% — do NOT use Fit to Page' },
                  { n: 3, title: 'Disable Headers & Footers', desc: 'Uncheck "Headers and footers" in the print dialog' },
                  { n: 4, title: 'Background Graphics → On', desc: 'Check Background graphics so colors print correctly' },
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

export default ProposalEditor;