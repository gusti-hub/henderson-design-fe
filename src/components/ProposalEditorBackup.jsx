// components/ProposalEditor.jsx
//
// SMART PRODUCT FILTERING:
//   - On load: backend returns `excludedProducts` = products in order but NOT in this version
//   - These are hidden by default (not in productsWithIds)
//   - User can add them back via the "Not in Proposal" side panel
//   - New version: only includes products NOT in previous version by default
//   - "Save All" persists all visible products + depositPercent
//   - ItemTogglePanel still works for hiding visible products
//   - Each product row has ↻ Price (refresh from order) and ✕ Remove buttons

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Printer, ChevronLeft, Loader2, EyeOff, Eye, PlusCircle, Save, Plus } from 'lucide-react';
import { backendServer } from '../utils/info';

// Constants
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

const PAGE_W_IN = 8.5, PAGE_H_IN = 11, PAD_IN = 0.5, FOOT_IN = 0.85, SAFE_PX = 60, PX = 96;
const CONTENT_H = (PAGE_H_IN - PAD_IN - FOOT_IN) * PX - SAFE_PX;

const getImgSrc = p => {
  const o = p.selectedOptions || {};
  return [o?.uploadedImages?.[0]?.url, o?.image, o?.images?.[0], p.image, p.imageUrl]
    .find(s => s && typeof s === 'string' && s.trim()) || null;
};

const stableId = (p, idx) => {
  // idx adalah primary key — selalu unik per posisi array
  // base hanya untuk readability, tidak untuk uniqueness
  let base = 'x';
  if (p._id) {
    if (typeof p._id === 'string') base = p._id;
    else if (typeof p._id.toHexString === 'function') base = p._id.toHexString();
    else if (typeof p._id.toString === 'function') {
      const s = p._id.toString();
      base = (s && s !== '[object Object]') ? s : 'x';
    }
  } else if (p.product_id) {
    base = 'pid_' + p.product_id;
  }
  // ✅ idx sebagai primary uniqueness — tidak ada 2 produk yang punya sid sama
  return 'slot_' + idx + '__' + base;
};

const preloadImages = urls =>
  Promise.all(urls.map(url => new Promise(res => {
    const img = new window.Image();
    img.onload = img.onerror = res;
    img.src = url;
  })));

// ─── Page Footer ──────────────────────────────────────────────────────────────
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

// ─── Product Row ──────────────────────────────────────────────────────────────
const ProductRow = React.forwardRef(({ product, isFirst = false, onDelete, onRefresh }, ref) => {
  const o = product.selectedOptions || {};
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

  return (
    <tr ref={ref}>
      <td style={{ ...tdBase, width: '88px', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '76px', height: '76px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '76px', height: '76px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
        }
        {/* Action buttons — hidden on print */}
        {(onRefresh || onDelete) && (
          <div className="no-print" style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '5px' }}>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh harga dari order"
                style={{ padding: '3px 6px', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', lineHeight: 1, fontWeight: 600 }}
              >
                ↻ Price
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Hapus dari proposal"
                style={{ padding: '3px 6px', fontSize: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', lineHeight: 1, fontWeight: 600 }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </td>
      <td style={{ ...tdBase, padding: '7px 9px', fontSize: '12px', lineHeight: '1.55', textAlign: 'left', verticalAlign: 'top' }}>
        <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '13px' }}>{product.name || 'Untitled'}</div>
        {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#374151', marginBottom: '1px' }}>{o.specifications}</div>}
        {o.finish && <div><strong>Color / Finish:</strong> {resolveFinish(o.finish)}</div>}
        {o.leadTime && <div><strong>Lead Time:</strong> {o.leadTime}</div>}
        {o.fabric && <div><strong>Fabric:</strong> {resolveFabric(o.fabric)}</div>}
        {o.size && <div><strong>Size:</strong> {o.size}</div>}
      </td>
      <td style={{ ...tdBase, width: '145px', padding: '7px 5px', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Qty:</span><span>{qty} {o.units || 'Each'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Unit:</span><span>${fmt(sell)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span>${fmt(sub)}</span></div>
        {taxRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Tax ({taxRate}%):</span><span>${fmt(tax)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #d1d5db', paddingTop: '2px', marginTop: '2px' }}>
          <span>Total:</span><span>${fmt(total)}</span>
        </div>
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';

// ─── Human-readable labels for known customAttribute keys ─────────────────────
const CA_LABELS = {
  width:'Width', repeat:'Repeat', railroaded:'Railroaded', doubleRubs:'Double Rubs',
  matchType:'Match Type', washability:'Washability',
  rugSize:'Size', constructionMethod:'Construction Method', indoorOutdoor:'Indoor/Outdoor',
  comColRequirement:'COM/COL', upholsteryOptions:'Upholstery',
  bulbType:'Bulb Type', voltage:'Voltage', dimmable:'Dimmable', ulRating:'UL Rating',
  material:'Material', medium:'Medium', orientation:'Orientation',
  framedDimensions:'Framed Dimensions', frameFinish:'Frame Finish',
  treatmentType:'Treatment Type', opacityLevel:'Opacity', hardwareType:'Hardware Type',
  beddingSize:'Size', threadCount:'Thread Count', fillMaterial:'Fill Material',
  pillowSize:'Size', insertIncluded:'Insert Included',
  furnitureType:'Furniture Type', comRequired:'COM Required', comYardage:'COM Yardage', trimType:'Trim Type',
  elevatorRequired:'Elevator Req.', stairsPresent:'Stairs', assemblyRequired:'Assembly Req.', whiteGloveRequired:'White Glove',
  modelNumber:'Model #', connectivityType:'Connectivity', smartCompatible:'Smart Compat.',
  productType:'Product Type', otherFinish:'Finish',
  materials:'Materials', collection:'Collection',
};
const SKIP_CA_KEYS = new Set(['availabilityStatus','collection','materials']);

// ─── Product Row V2 (extended: item type, materials, category specs) ──────────
const ProductRowV2 = React.forwardRef(({ product, isFirst = false, onDelete, onRefresh }, ref) => {
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

  const itemType = o.itemClass || '';
  const materials = ca.materials || '';
  const collection = ca.collection || '';
  // Structured category fields (skip system/meta keys)
  const catEntries = Object.entries(ca).filter(([k, v]) =>
    CA_LABELS[k] && !SKIP_CA_KEYS.has(k) && v !== '' && v !== null && v !== undefined && v !== false
  );

  return (
    <tr ref={ref}>
      <td style={{ ...tdBase, width: '88px', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '76px', height: '76px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '76px', height: '76px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
        }
        {(onRefresh || onDelete) && (
          <div className="no-print" style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '5px' }}>
            {onRefresh && <button onClick={onRefresh} style={{ padding: '3px 6px', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', lineHeight: 1, fontWeight: 600 }}>↻ Price</button>}
            {onDelete && <button onClick={onDelete} style={{ padding: '3px 6px', fontSize: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', lineHeight: 1, fontWeight: 600 }}>✕</button>}
          </div>
        )}
      </td>
      <td style={{ ...tdBase, padding: '7px 9px', fontSize: '12px', lineHeight: '1.55', textAlign: 'left', verticalAlign: 'top' }}>
        {/* Item type + collection badges */}
        {(itemType || collection) && (
          <div style={{ marginBottom: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {itemType && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: '600' }}>{itemType}</span>}
            {collection && <span style={{ background: '#f0fdf4', color: '#15803d', padding: '1px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: '600' }}>{collection}</span>}
          </div>
        )}
        <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '13px' }}>{product.name || 'Untitled'}</div>
        {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#374151', marginBottom: '1px' }}>{o.specifications}</div>}
        {o.finish && <div><strong>Color / Finish:</strong> {resolveFinish(o.finish)}</div>}
        {o.leadTime && <div><strong>Lead Time:</strong> {o.leadTime}</div>}
        {o.fabric && <div><strong>Fabric:</strong> {resolveFabric(o.fabric)}</div>}
        {o.size && <div><strong>Dimensions:</strong> {o.size}</div>}
        {materials && <div><strong>Materials:</strong> {materials}</div>}
        {/* Category-specific structured fields */}
        {catEntries.length > 0 && (
          <div style={{ marginTop: '4px', borderTop: '1px dashed #e5e7eb', paddingTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {catEntries.map(([k, v]) => (
              <span key={k} style={{ fontSize: '11px', color: '#4b5563' }}>
                <strong>{CA_LABELS[k]}:</strong> {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}
              </span>
            ))}
          </div>
        )}
        {o.notes && <div style={{ marginTop: '4px', borderTop: '1px dashed #e5e7eb', paddingTop: '4px', fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-wrap' }}><em>{o.notes}</em></div>}
      </td>
      <td style={{ ...tdBase, width: '145px', padding: '7px 5px', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Qty:</span><span>{qty} {o.units || 'Each'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Unit:</span><span>${fmt(sell)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span>${fmt(sub)}</span></div>
        {taxRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Tax ({taxRate}%):</span><span>${fmt(tax)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #d1d5db', paddingTop: '2px', marginTop: '2px' }}>
          <span>Total:</span><span>${fmt(total)}</span>
        </div>
      </td>
    </tr>
  );
});
ProductRowV2.displayName = 'ProductRowV2';

// ─── Room Table ───────────────────────────────────────────────────────────────
const RoomTable = ({ room, rows, onDelete, onRefresh, RowComponent = ProductRow }) => (
  <div style={{ marginBottom: '10px' }}>
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
        {rows.map(({ product, isFirst, sid }, i) => (
          <RowComponent
            key={i}
            product={product}
            isFirst={i === 0}
            onDelete={onDelete ? () => onDelete(sid) : undefined}
            onRefresh={onRefresh ? () => onRefresh(sid, product) : undefined}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Render Items (paginated) ─────────────────────────────────────────────────
const renderItems = (items, onDelete, onRefresh, productsMap, RowComponent = ProductRow) => {
  const sections = []; let cur = null;
  items.forEach(item => {
    if (item.type === 'room-header') {
      if (cur) sections.push(cur);
      cur = { room: item.room, rows: [] };
    } else {
      if (!cur) cur = { room: item.room, rows: [] };
      const freshProduct = productsMap?.get(item.sid) || item.product;
      cur.rows.push({ product: freshProduct, isFirst: item.isFirst, sid: item.sid });
    }
  });
  if (cur) sections.push(cur);
  return sections.map(({ room, rows }) => (
    <RoomTable key={room} room={room} rows={rows} onDelete={onDelete} onRefresh={onRefresh} RowComponent={RowComponent} />
  ));
};


// ─── Excluded Products Panel ──────────────────────────────────────────────────
const ExcludedProductsPanel = ({ excludedProducts, onAdd, onAddAll, onClose }) => {
  const withPrev    = excludedProducts.filter(p => p._prevProposalNumber);
  const withoutPrev = excludedProducts.filter(p => !p._prevProposalNumber);

  const renderItem = (p, key) => {
    const imgSrc = getImgSrc(p);
    const room = p.selectedOptions?.room?.trim() || '';
    return (
      <div key={key} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
          {imgSrc
            ? <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">?</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{p.name || 'Untitled'}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-gray-400">Qty {p.quantity || 1}</p>
            {room && (
              <>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-teal-600 font-medium truncate">{room}</span>
              </>
            )}
          </div>
          {p._prevProposalNumber && (
            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono font-semibold leading-none">
              {p._prevProposalNumber}
            </span>
          )}
        </div>
        <button
          onClick={() => onAdd(p)}
          className="flex-shrink-0 p-1.5 bg-[#005670]/10 text-[#005670] rounded-lg hover:bg-[#005670] hover:text-white transition-colors"
          title="Add to proposal"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[60] flex flex-col border-l border-gray-200 no-print">
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-bold text-base">Not in This Proposal</h3>
          <p className="text-xs text-white/70 mt-0.5">
            {excludedProducts.length} item{excludedProducts.length !== 1 ? 's' : ''} — add if needed
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {withPrev.length > 0 && (
          <>
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Previously Proposed</span>
              <span className="text-[10px] text-amber-500">({withPrev.length})</span>
            </div>
            {withPrev.map((p, i) => renderItem(p, 'prev-' + i))}
          </>
        )}
        {withoutPrev.length > 0 && (
          <>
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">New Products</span>
              <span className="text-[10px] text-blue-500">({withoutPrev.length})</span>
            </div>
            {withoutPrev.map((p, i) => renderItem(p, 'new-' + i))}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 space-y-2">
        {excludedProducts.length > 0 && (
          <button
            onClick={onAddAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#005670] hover:bg-[#004558] text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add All ({excludedProducts.length}) to Proposal
          </button>
        )}
        <p className="text-xs text-gray-400 text-center">
          Items with <span className="text-amber-600 font-semibold">badge</span> were in a previous proposal.
        </p>
      </div>
    </div>
  );
};

// ─── Item Toggle Panel (hide visible products) ────────────────────────────────
const ItemTogglePanel = ({ productsWithIds, hiddenIds, toggleHidden, onClose, onSave, saving, saveSuccess }) => {
  const byRoom = React.useMemo(() => {
    const map = new Map();
    productsWithIds.forEach(({ sid, product: p }) => {
      const room = p.selectedOptions?.room?.trim() || '—';
      if (!map.has(room)) map.set(room, []);
      map.get(room).push({ sid, p });
    });
    return Array.from(map.entries());
  }, [productsWithIds]);

  const hiddenCount = hiddenIds.size;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[60] flex flex-col border-l border-gray-200 no-print">
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-bold text-base">Show / Hide Items</h3>
          <p className="text-xs text-white/70 mt-0.5">
            {hiddenCount === 0 ? 'All items visible' : `${hiddenCount} item${hiddenCount > 1 ? 's' : ''} hidden`}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        {byRoom.map(([room, items]) => (
          <div key={room} className="mb-1">
            <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{room}</span>
            </div>
            {items.map(({ sid, p }) => {
              const hidden = hiddenIds.has(sid);
              const imgSrc = getImgSrc(p);
              return (
                <div key={sid} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 transition-colors ${hidden ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="w-9 h-9 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                    {imgSrc
                      ? <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">?</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${hidden ? 'line-through text-gray-400' : 'text-gray-800'}`}>{p.name || 'Untitled'}</p>
                    <p className="text-xs text-gray-400 truncate">Qty {p.quantity || 1}</p>
                  </div>
                  <button
                    onClick={() => toggleHidden(sid)}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${hidden ? 'bg-gray-200 text-gray-400 hover:bg-[#005670]/10 hover:text-[#005670]' : 'bg-[#005670]/10 text-[#005670] hover:bg-red-50 hover:text-red-500'}`}
                    title={hidden ? 'Show in proposal' : 'Hide from proposal'}
                  >
                    {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 space-y-2">
        {hiddenCount > 0 && (
          <p className="text-xs text-amber-700 font-medium">
            {hiddenCount} item{hiddenCount > 1 ? 's' : ''} hidden — save to keep after refresh.
          </p>
        )}
        <button
          onClick={onSave}
          disabled={saving || hiddenCount === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saveSuccess ? 'bg-green-100 text-green-700 border border-green-200'
              : hiddenCount === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#005670] hover:bg-[#004558] text-white'
          }`}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            : saveSuccess ? <>&#10003; Saved!</>
            : <><Save className="w-4 h-4" /> Save to Current Version</>
          }
        </button>
      </div>
    </div>
  );
};

// ─── New Version Modal ────────────────────────────────────────────────────────
const NewVersionModal = ({ onClose, onSave, saving }) => {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold">Save as New Version</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            The new version will start with <strong>new products</strong> added since the last proposal.
            Products from the previous version can be added back via the "Not in Proposal" panel.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version Notes <span className="text-red-500">*</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
              rows={4}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button
              onClick={() => onSave(notes)}
              disabled={saving || !notes.trim()}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><PlusCircle className="w-4 h-4" /> Save New Version</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Version History Modal ────────────────────────────────────────────────────
const VersionModal = ({ orderId, isOpen, onClose, onSelectVersion }) => {
  const [versions, setVersions] = useState([]);
  const [lv, setLv] = useState(true);
  useEffect(() => { if (isOpen) load(); }, [isOpen]);
  const load = async () => {
    try {
      const t = localStorage.getItem('token');
      const r = await (await fetch(`${backendServer}/api/proposals/${orderId}/versions/all`, { headers: { Authorization: `Bearer ${t}` } })).json();
      if (r.success) setVersions(r.data);
    } catch (e) { console.error(e); } finally { setLv(false); }
  };
  if (!isOpen) return null;
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
                        {v.proposalNumber && <span className="text-xs text-gray-500 font-mono">{v.proposalNumber}</span>}
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

// ─── Main Component ───────────────────────────────────────────────────────────
const ProposalEditor = ({ orderId, version, onClose }) => {
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [clientInfo, setClientInfo]     = useState({});
  const [proposalNumber, setProposalNumber] = useState(null);
  const [proposalStatus, setProposalStatus] = useState('draft');
  const [savingStatus, setSavingStatus]     = useState(false);
  const [showVersionModal, setShowVersionModal]         = useState(false);
  const [showNewVersionModal, setShowNewVersionModal]   = useState(false);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [depositPercent, setDepositPercent] = useState(90);
  const [confirmModal, setConfirmModal] = useState(null);
  const [originalTitle] = useState(document.title);

  const [productsWithIds, setProductsWithIds] = useState([]);
  const [excludedProducts, setExcludedProducts] = useState([]);

  const [hiddenIds, setHiddenIds]           = useState(new Set());
  const [showItemPanel, setShowItemPanel]   = useState(false);
  const [showExcludedPanel, setShowExcludedPanel] = useState(false);
  const [savingHidden, setSavingHidden]     = useState(false);
  const [saveHiddenSuccess, setSaveHiddenSuccess] = useState(false);

  const [pages, setPages] = useState(null);
  const [ready, setReady] = useState(false);
  const [templateVersion, setTemplateVersion] = useState('v1'); // 'v1' | 'v2'

  const measureRef  = useRef(null);
  const headerRef   = useRef(null);
  const rowRefs     = useRef({});
  const roomHdRefs  = useRef({});
  const didPaginate = useRef(false);

  // ── Visible products (not hidden) ──
  const visibleProducts = React.useMemo(
    () => productsWithIds.filter(({ sid }) => !hiddenIds.has(sid)).map(({ product }) => product),
    [productsWithIds, hiddenIds]
  );

  const toggleHidden = useCallback((sid) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid); else next.add(sid);
      return next;
    });
  }, []);

  // ── Add excluded product back ──
  const handleAddExcluded = useCallback((product) => {
    // Tambahkan ke proposal
    setProductsWithIds(prev => {
      const idx = prev.length;
      return [...prev, { sid: stableId(product, idx), product }];
    });
    // Hapus hanya satu instance (yang pertama match), bukan semua
    setExcludedProducts(prev => {
      const pid = product.product_id || product._id?.toString();
      let removed = false;
      return prev.filter(p => {
        if (!removed) {
          const ppid = p.product_id || p._id?.toString();
          if (ppid === pid) {
            removed = true;
            return false; // hapus hanya instance pertama
          }
        }
        return true;
      });
    });
  }, []);

  const handleAddAllExcluded = useCallback(() => {
    setProductsWithIds(prev => {
      const newItems = excludedProducts.map((p, i) => ({
        sid: stableId(p, prev.length + i),
        product: p,
      }));
      return [...prev, ...newItems];
    });
    setExcludedProducts([]);
    setShowExcludedPanel(false);
  }, [excludedProducts]);

  // ── Delete product from proposal ──
const handleDeleteProduct = useCallback(async (sid) => {
  const deletedItem = productsWithIds.find(item => item.sid === sid);
  if (!deletedItem) return;

  const deletedProduct = deletedItem.product;

  // Hapus dari proposal state
  setProductsWithIds(prev => prev.filter(item => item.sid !== sid));

  // Cek apakah produk ini masih ada di Order
  // Jika masih ada di Order → masukkan ke excludedProducts
  // Jika tidak ada di Order → jangan masukkan (produk memang sudah dihapus dari Order)
  try {
    const t = localStorage.getItem('token');
    const res = await fetch(`${backendServer}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const r = await res.json();
    const orderData = r.data || r;
    const orderProducts = orderData.selectedProducts || [];

    // Cek apakah produk ini masih ada di Order berdasarkan _id
    const productMongoId = deletedProduct._id
      ? (typeof deletedProduct._id === 'string'
          ? deletedProduct._id
          : deletedProduct._id?.toString?.())
      : null;

    let stillInOrder = false;

    if (productMongoId && productMongoId !== '[object Object]') {
      stillInOrder = orderProducts.some(op => {
        const opid = typeof op._id === 'string'
          ? op._id
          : op._id?.toString?.();
        return opid && opid === productMongoId;
      });
    }

    // Fallback: cek by product_id
    if (!stillInOrder && deletedProduct.product_id) {
      stillInOrder = orderProducts.some(op =>
        op.product_id === deletedProduct.product_id
      );
    }

    if (stillInOrder) {
      // Masih ada di Order → tampilkan di Not in Proposal
      setExcludedProducts(prev => [...prev, deletedProduct]);
    }
    // Jika tidak ada di Order → tidak perlu masuk excluded
  } catch (e) {
    // Jika fetch gagal, tetap masukkan ke excluded sebagai safety
    setExcludedProducts(prev => [...prev, deletedProduct]);
  }
}, [orderId, productsWithIds]);

  // ── Refresh price from order ──
const handleRefreshPrice = useCallback(async (sid, product) => {
  try {
    const t = localStorage.getItem('token');
    const res = await fetch(`${backendServer}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const r = await res.json();
    const orderData = r.data || r;
    const orderProducts = orderData.selectedProducts || [];

    // ✅ Cari berdasarkan _id MongoDB — paling akurat, tidak bisa ketukar
    const productMongoId = product._id
      ? (typeof product._id === 'string'
          ? product._id
          : product._id?.toString?.())
      : null;

    let fresh = null;

    if (productMongoId && productMongoId !== '[object Object]') {
      fresh = orderProducts.find(op => {
        const opid = typeof op._id === 'string'
          ? op._id
          : op._id?.toString?.();
        return opid && opid === productMongoId;
      });
    }

    // Fallback jika _id tidak match — cari by product_id + urutan instance
    if (!fresh && product.product_id) {
      const pid = product.product_id;
      const currentIdx = productsWithIds.findIndex(item => item.sid === sid);
      const instancesBefore = productsWithIds
        .slice(0, currentIdx)
        .filter(item => item.product.product_id === pid)
        .length;

      let matchCount = 0;
      for (const op of orderProducts) {
        if (op.product_id === pid) {
          if (matchCount === instancesBefore) {
            fresh = op;
            break;
          }
          matchCount++;
        }
      }
    }

    if (!fresh) {
      alert('Product tidak ditemukan di order — tidak bisa direfresh.');
      return;
    }

    // ✅ Replace seluruh product dengan data terbaru dari Order
    setProductsWithIds(prev => prev.map(item =>
      item.sid === sid ? { ...item, product: fresh } : item
    ));

  } catch (e) {
    alert('Gagal refresh: ' + e.message);
  }
}, [orderId, productsWithIds]);

  // ── Pagination trigger ──
  const productsMap = React.useMemo(() => {
  const map = new Map();
    productsWithIds.forEach(({ sid, product }) => map.set(sid, product));
    return map;
  }, [productsWithIds]);
  const prevVisibleKey = useRef('');
  
  useEffect(() => {
    const key = visibleProducts.length + ':' + visibleProducts.map((_, i) => i).join(',');
    if (key === prevVisibleKey.current) return;
    prevVisibleKey.current = key;
    if (visibleProducts.length === 0) { setPages([[]]); setReady(true); return; }
    didPaginate.current = false;
    rowRefs.current = {};
    roomHdRefs.current = {};
    setPages(null);
    setReady(false);
  }, [visibleProducts]);

  useEffect(() => { loadProposalData(); }, [orderId, version]);

  useEffect(() => {
    if (proposalData && clientInfo.name) {
      const cn = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const un = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      document.title = 'Proposal_' + cn + (un ? '_' + un : '') + '_v' + (proposalData.version || 1) + '_' + new Date().toISOString().split('T')[0];
    }
    return () => { document.title = originalTitle; };
  }, [proposalData, clientInfo, originalTitle]);

  // ── Load proposal data ──
  const loadProposalData = async () => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/${version || 'latest'}`, { headers: { Authorization: `Bearer ${t}` } });
      const r = await res.json();
      if (!r.success) throw new Error(r.message || 'Failed to load proposal');

      setProposalData(r.data);

      const rawProducts = r.data.selectedProducts || [];
      const withIds = rawProducts.map((p, idx) => ({ sid: stableId(p, idx), product: p }));
      setProductsWithIds(withIds);
      setHiddenIds(new Set());

      const excluded = r.data.excludedProducts || [];
      setExcludedProducts(excluded);
      if (excluded.length > 0) {
        setShowExcludedPanel(true);
      }

      const u = r.data.user || {};
      const addr = u.address || {};
      const street = addr.street?.trim() || '';
      const cityParts = [addr.city, addr.state, addr.zipcode].filter(p => p && p.trim());
      const cityLine = cityParts.join(', ');
      const unitNumber = r.data.clientInfo?.unitNumber || u.unitNumber || '';
      setClientInfo({
        ...(r.data.clientInfo || {}),
        email: r.data.clientInfo?.email || u.email || '',
        unitNumber, street, cityLine,
      });
      setProposalNumber(r.data.proposalNumber || null);
      setProposalStatus(r.data.status || 'draft');
      setDepositPercent(r.data.depositPercent ?? 90);
    } catch (e) { console.error(e); alert('Failed to load proposal data'); }
    finally { setLoading(false); }
  };

  const doStatusUpdate = async (newStatus) => {
    setSavingStatus(true);
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setProposalStatus(newStatus);
      else { const d = await res.json(); alert('Failed: ' + (d.message || '')); }
    } catch (err) { alert('Failed: ' + err.message); }
    finally { setSavingStatus(false); }
  };

  const handleStatusChange = (newStatus) => {
    if (proposalStatus === 'approved') {
      setConfirmModal({ newStatus: null, title: 'Locked', message: 'Proposal sudah Approved dan tidak dapat diubah lagi.', infoOnly: true });
      return;
    }
    if (newStatus === 'approved') {
      setConfirmModal({ newStatus, title: 'Approve Proposal?', message: 'Setelah Approved, status tidak dapat diubah lagi dan Finance team dapat mengirim Proposal ini ke QuickBooks sebagai Invoice.' });
      return;
    }
    doStatusUpdate(newStatus);
  };

  // ── Save visible products only (from ItemTogglePanel) ──
  const handleSaveHidden = async () => {
    setSavingHidden(true);
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/save-current`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: visibleProducts, clientInfo, depositPercent, version: proposalData?.version }),
      });
      const r = await res.json();
      if (r.success) {
        const withIds = visibleProducts.map((p, idx) => ({ sid: stableId(p, idx), product: p }));
        setProductsWithIds(withIds);
        setHiddenIds(new Set());
        setSaveHiddenSuccess(true);
        setTimeout(() => setSaveHiddenSuccess(false), 2500);
      } else {
        alert('Failed to save: ' + (r.message || 'Unknown error'));
      }
    } catch (e) { alert('Failed to save: ' + e.message); }
    finally { setSavingHidden(false); }
  };

  // ── Save ALL products (including added-back excluded) + depositPercent ──
  const handleSaveAllProducts = async () => {
    setSavingHidden(true);
    try {
      const t = localStorage.getItem('token');
      const allProducts = productsWithIds.map(({ product }) => product);
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/save-current`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: allProducts, clientInfo, depositPercent, version: proposalData?.version }),
      });
      const r = await res.json();
      if (r.success) {
        const withIds = allProducts.map((p, idx) => ({ sid: stableId(p, idx), product: p }));
        setProductsWithIds(withIds);
        setHiddenIds(new Set());
        setSaveHiddenSuccess(true);
        setTimeout(() => setSaveHiddenSuccess(false), 2500);
      } else {
        alert('Failed to save: ' + (r.message || 'Unknown error'));
      }
    } catch (e) { alert('Failed to save: ' + e.message); }
    finally { setSavingHidden(false); }
  };

  // ── Save as new version (deposit reset to 90) ──
  const handleSaveNewVersion = async (notes) => {
    if (!notes.trim()) return;
    setSaving(true);
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/proposals/${orderId}/new-version`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientInfo, notes, depositPercent: 90 }),
      });
      const r = await res.json();
      if (r.success) {
        setShowNewVersionModal(false);
        window.location.href = '/admin/proposal/' + orderId + '/' + r.data.version;
      } else {
        alert('Failed: ' + (r.message || 'Unknown error'));
      }
    } catch (e) { alert('Failed to create new version'); }
    finally { setSaving(false); }
  };

  // ── Totals ──
  const calcTotals = () => {
    let sub = 0, taxT = 0;
    visibleProducts.forEach(p => {
      const o = p.selectedOptions || {}, qty = p.quantity || 1;
      const msrp = parseFloat(o.msrp) || 0;
      const markupPct = parseFloat(o.markupPercent) || 0;
      const sell = msrp * (1 + markupPct / 100);
      const line = sell * qty;
      const tax = parseFloat(o.salesTaxRate) || 0;
      sub += line;
      taxT += tax > 0 ? line * (tax / 100) : 0;
    });
    const total = sub + taxT;
    return { subtotal: sub, salesTax: taxT, total, deposit: total * (depositPercent / 100) };
  };

  const ROOM_ORDER = [
    'COURTYARD','EXTERIOR ENTRY','INTERIOR ENTRY','FOYER','LIVING ROOM','DINING ROOM',
    'KITCHEN','PANTRY','PRIMARY BEDROOM','PRIMARY BEDROOM LANAI','PRIMARY BATHROOM',
    'PRIMARY CLOSET','BEDROOM 2','BATHROOM 2','BEDROOM 2 CLOSET','BEDROOM 2 LANAI',
    'BEDROOM 3','BATHROOM 3','BEDROOM 3 CLOSET','BEDROOM 3 LANAI','BEDROOM 4','BATHROOM 4',
    'BEDROOM 4 CLOSET','BEDROOM 4 LANAI','POWDER ROOM','OFFICE','MEDIA ROOM','DEN','HALLWAY',
    'LANAI','POOL AREA','BREAKFAST NOOK','GREAT ROOM','FAMILY ROOM','WET BAR','BBQ AREA',
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

  // ── Build room groups (includes sid for each product) ──
  const buildRoomGroups = useCallback(() => {
    const map = new Map();
    productsWithIds
      .filter(({ sid }) => !hiddenIds.has(sid))
      .forEach(({ sid, product: p }) => {
        const room = p.selectedOptions?.room?.trim() || '-';
        if (!map.has(room)) map.set(room, []);
        map.get(room).push({ sid, product: p });
      });
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === '-') return 1; if (b === '-') return -1;
      const ia = ROOM_ORDER.indexOf(a.toUpperCase());
      const ib = ROOM_ORDER.indexOf(b.toUpperCase());
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1; if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [productsWithIds, hiddenIds]);

  const TOTALS_H = 100;

  const packItems = (items, headerH) => {
    const result = []; let cur = [], used = headerH;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const extraH = i === items.length - 1 ? TOTALS_H : 0;
      if (item.type === 'room-header') {
        const nextH = items[i + 1]?.height || 0;
        if (used + item.height + nextH > CONTENT_H && cur.length > 0) { result.push(cur); cur = []; used = 0; }
        cur.push(item); used += item.height;
      } else {
        if (used + item.height + extraH > CONTENT_H && cur.length > 0) { result.push(cur); cur = []; used = 0; }
        cur.push(item); used += item.height;
      }
    }
    if (cur.length > 0) result.push(cur);
    if (result.length === 0) result.push([]);
    return result;
  };

  const paginate = useCallback(() => {
    if (didPaginate.current) return;
    didPaginate.current = true;
    const rg = buildRoomGroups();
    const CONTENT_W = (PAGE_W_IN - PAD_IN * 2) * PX;
    const sandbox = document.createElement('div');
    sandbox.style.cssText = 'position:fixed;top:0;left:-9999px;width:' + CONTENT_W + 'px;background:white;z-index:-9999;font-size:12px;line-height:1.55;font-family:Arial,sans-serif;visibility:visible;opacity:0;pointer-events:none';
    document.body.appendChild(sandbox);
    const measureEl = (html) => {
      const w = document.createElement('div');
      w.innerHTML = html; sandbox.appendChild(w);
      const h = w.getBoundingClientRect().height; sandbox.removeChild(w);
      return Math.ceil(h) + 8;
    };
    const headerH = headerRef.current ? Math.ceil(headerRef.current.getBoundingClientRect().height) + 8 : 220;
    const items = [];
    rg.forEach(([room, rps]) => {
      const rhH = measureEl('<div style="padding:6px 8px;font-weight:600;font-size:12px;background:#f0f0f0">' + room + '</div>');
      items.push({ type: 'room-header', room, height: rhH });
      rps.forEach(({ sid, product: p }, i) => {
        const o = p.selectedOptions || {};
        const lines = [];
        if (p.name) lines.push('<div style="font-weight:600;font-size:13px;margin-bottom:3px">' + p.name + '</div>');
        if (o.specifications) lines.push('<div style="white-space:pre-wrap">' + o.specifications + '</div>');
        if (o.finish) lines.push('<div><strong>Finish:</strong> ' + o.finish + '</div>');
        if (o.fabric) lines.push('<div><strong>Fabric:</strong> ' + o.fabric + '</div>');
        if (o.size) lines.push('<div><strong>Size:</strong> ' + o.size + '</div>');
        const priceLines = 2 + (parseFloat(o.salesTaxRate) > 0 ? 1 : 0) + 1;
        const priceH = priceLines * 19 + 16;
        const COL1 = 88, COL3 = 148;
        const midW = CONTENT_W - COL1 - COL3;
        const mw = document.createElement('div');
        mw.style.cssText = 'width:' + midW + 'px;padding:8px 9px;font-size:12px;line-height:1.55;box-sizing:border-box';
        mw.innerHTML = lines.join(''); sandbox.appendChild(mw);
        const midH = Math.ceil(mw.getBoundingClientRect().height) + 14; sandbox.removeChild(mw);
        items.push({ type: 'product', room, product: p, sid, isFirst: i === 0, height: Math.max(92, midH, priceH) + 8 });
      });
    });
    document.body.removeChild(sandbox);
    setPages(packItems(items, headerH));
    setReady(true);
  }, [buildRoomGroups]);

  useEffect(() => {
    if (pages !== null || visibleProducts.length === 0) return;
    preloadImages(visibleProducts.map(getImgSrc).filter(Boolean)).then(() => { setTimeout(() => paginate(), 300); });
  }, [pages, visibleProducts, paginate]);

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (proposalData && clientInfo.name) {
      const cn = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const un = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      document.title = 'Proposal_' + cn + (un ? '_' + un : '') + '_v' + (proposalData.version || 1) + '_' + new Date().toISOString().split('T')[0];
    }
    setTimeout(() => window.print(), 100);
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]" /></div>;

  const totals        = calcTotals();
  const dpn           = proposalNumber || '—';
  const today         = new Date().toLocaleDateString();
  const rg            = buildRoomGroups();
  const totalPP       = pages?.length || 0;
  const hiddenCount   = hiddenIds.size;
  const excludedCount = excludedProducts.length;
  const sidebarOpen   = showItemPanel || showExcludedPanel;


  const P1Header = ({ forMeasure = false }) => (
    <div ref={forMeasure ? headerRef : undefined}>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <img src="/images/HDG-Logo.png" alt="Henderson Design Group" style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
      </div>
      <div style={{ color: '#000000', fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Proposal</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name || '—'}</p>
          {clientInfo.street && <p style={{ margin: 0 }}>{clientInfo.street}{clientInfo.unitNumber ? ', #' + clientInfo.unitNumber : ''}</p>}
          {clientInfo.cityLine && <p style={{ margin: 0 }}>{clientInfo.cityLine}</p>}
          {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0 }}><strong>Proposal #:</strong> {dpn}</p>
          <p style={{ margin: 0 }}>Proposal Date: {today}</p>
        </div>
      </div>
      <div style={{ marginBottom: '12px', fontSize: '12px' }}>
        <span style={{ color: '#1e3a5f', fontWeight: '500' }}>Project: Ālia</span>
      </div>
    </div>
  );

  const ContHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
      <span>{clientInfo.name} — Products (continued)</span>
      <span>Proposal #: {dpn}</span>
    </div>
  );

  const slotStyle = { position: 'absolute', top: PAD_IN + 'in', left: PAD_IN + 'in', right: PAD_IN + 'in', bottom: FOOT_IN + 'in', overflow: 'hidden' };

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
          .lp { width: 8.5in !important; height: 11in !important; overflow: hidden !important; page-break-after: always !important; break-after: page !important; box-shadow: none !important; margin: 0 !important; position: relative !important; }
          .lp.last { page-break-after: avoid !important; break-after: avoid !important; }
        }
        @page { size: 8.5in 11in; margin: 0; }
        .pw { background: #b8b8b8; padding: 20px 0 40px; }
        .pgl { display: block; width: 8.5in; margin: 0 auto; background: #005670; color: white; font-size: 10px; font-weight: 600; padding: 3px 14px; border-radius: 4px 4px 0 0; box-sizing: border-box; letter-spacing: 0.03em; }
        .lp { position: relative; background: white; width: 8.5in; height: 11in; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.18); margin: 0 auto; box-sizing: border-box; font-family: Arial, sans-serif; }
        .pgap { width: 8.5in; height: 16px; background: #b8b8b8; margin: 0 auto; }
        .mbox { position: fixed; top: -9999px; left: -9999px; width: ${(PAGE_W_IN - PAD_IN * 2)}in; background: white; visibility: hidden; pointer-events: none; z-index: -999; overflow: visible; font-family: Arial, sans-serif; }
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
            {hiddenCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{hiddenCount} hidden</span>
            )}
            {excludedCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{excludedCount} not included</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status */}
          {proposalStatus === 'approved' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">&#10003; Approved</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <select value={proposalStatus} onChange={e => handleStatusChange(e.target.value)} disabled={savingStatus}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer appearance-none ${proposalStatus === 'draft' ? 'bg-gray-100 text-gray-600' : proposalStatus === 'sent' ? 'bg-blue-100 text-blue-700' : proposalStatus === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} ${savingStatus ? 'opacity-50' : ''}`}>
                <option value="draft">Draft</option>
                <option value="sent">Sent to Client</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {savingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
            </div>
          )}
          <div className="h-5 w-px bg-gray-200" />

          {/* Not Included panel toggle */}
          {excludedCount > 0 && (
            <button
              onClick={() => { setShowExcludedPanel(p => !p); setShowItemPanel(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showExcludedPanel ? 'bg-[#005670] text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              <Plus className="w-4 h-4" />
              Not Included ({excludedCount})
            </button>
          )}

          {/* Show/Hide items panel */}
          <button
            onClick={() => { setShowItemPanel(p => !p); setShowExcludedPanel(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showItemPanel ? 'bg-[#005670] text-white' : hiddenCount > 0 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            <EyeOff className="w-4 h-4" />
            {hiddenCount > 0 ? 'Items (' + hiddenCount + ' hidden)' : 'Show/Hide Items'}
          </button>

          {/* Save All — saves all products + depositPercent */}
          <button
            onClick={handleSaveAllProducts}
            disabled={savingHidden}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${saveHiddenSuccess ? 'bg-green-100 text-green-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'}`}
            title="Simpan semua produk dan persentase deposit"
          >
            {savingHidden
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : saveHiddenSuccess
              ? <span>&#10003;</span>
              : <Save className="w-4 h-4" />
            }
            {saveHiddenSuccess ? 'Saved!' : 'Save All'}
          </button>

          {/* New Version */}
          <button onClick={() => setShowNewVersionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> New Version
          </button>

          {/* Version History */}
          <button onClick={() => setShowVersionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" /> Version History
          </button>

          {/* Deposit % */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">Deposit</span>
            <div className="flex items-center">
              <button onClick={() => setDepositPercent(p => Math.max(0, p - 10))} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 text-base font-bold leading-none">−</button>
              <input
                type="number" min="0" max="100" value={depositPercent}
                onChange={e => { const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0)); setDepositPercent(v); }}
                className="w-12 text-center text-sm font-bold text-[#005670] border-0 outline-none bg-transparent"
              />
              <span className="text-xs text-gray-500 mr-1">%</span>
              <button onClick={() => setDepositPercent(p => Math.min(100, p + 10))} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 text-base font-bold leading-none">+</button>
            </div>
          </div>

          {/* Template version toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setTemplateVersion('v1')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${templateVersion === 'v1' ? 'bg-[#005670] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Standard template"
            >
              Template V1
            </button>
            <button
              onClick={() => setTemplateVersion('v2')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${templateVersion === 'v2' ? 'bg-[#005670] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Extended template — shows item type, materials, category specs"
            >
              Template V2
            </button>
          </div>

          {/* Print */}
          <button onClick={() => setShowPrintInstructions(true)} className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Side Panels ── */}
      {showExcludedPanel && excludedCount > 0 && (
        <ExcludedProductsPanel
          excludedProducts={excludedProducts}
          onAdd={handleAddExcluded}
          onAddAll={handleAddAllExcluded}
          onClose={() => setShowExcludedPanel(false)}
        />
      )}
      {showItemPanel && !showExcludedPanel && (
        <ItemTogglePanel
          productsWithIds={productsWithIds}
          hiddenIds={hiddenIds}
          toggleHidden={toggleHidden}
          onClose={() => setShowItemPanel(false)}
          onSave={handleSaveHidden}
          saving={savingHidden}
          saveSuccess={saveHiddenSuccess}
        />
      )}

      {/* ── Hidden measure box ── */}
      <div className="mbox" ref={measureRef}>
        <P1Header forMeasure={true} />
        {rg.map(([room, rps]) => (
          <table key={room} style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup><col style={{ width: '88px' }} /><col /><col style={{ width: '148px' }} /></colgroup>
            <tbody>
              <tr ref={el => { if (el) roomHdRefs.current[room] = el; }}>
                <td colSpan={3} style={{ padding: '6px 8px', fontWeight: '600', fontSize: '12px', background: '#f0f0f0' }}>{room}</td>
              </tr>
              {rps.map(({ sid, product: p }, i) => {
                const key = room + '__' + i;
                const MeasureRow = templateVersion === 'v2' ? ProductRowV2 : ProductRow;
                return <MeasureRow key={key} product={p} isFirst={i === 0} ref={el => { if (el) rowRefs.current[key] = el; }} />;
              })}
            </tbody>
          </table>
        ))}
      </div>

      {/* ── Pages ── */}
      <div className={`pw transition-all ${sidebarOpen ? 'mr-80' : ''}`}>
        <div className="print-area">
          {!ready ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005670]" />
            </div>
          ) : (
            <>
              {(pages || []).map((items, pi) => (
                <React.Fragment key={pi}>
                  <span className="pgl no-print">Page {pi + 1}{(pages || []).length > 1 ? ' — Products (' + (pi + 1) + '/' + (pages || []).length + ')' : ' — Products'}</span>
                  <div className="lp">
                    <div style={slotStyle}>
                      {pi === 0 ? <P1Header /> : <ContHeader />}
                      {renderItems(items, handleDeleteProduct, handleRefreshPrice, productsMap, templateVersion === 'v2' ? ProductRowV2 : ProductRow)}
                      {pi === (pages || []).length - 1 && (
                        <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '4px', fontSize: '12px', lineHeight: '1.8' }}>
                          <p style={{ margin: 0 }}>Sub Total: ${fmt(totals.subtotal)}</p>
                          <p style={{ margin: 0 }}>Sales Tax: ${fmt(totals.salesTax)}</p>
                          <p style={{ margin: 0 }}>Total: ${fmt(totals.total)}</p>
                          <p style={{ margin: 0, fontWeight: '700' }}>Required Deposit ({depositPercent}%): ${fmt(totals.deposit)}</p>
                        </div>
                      )}
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
                  <div style={{ color: '#000000', fontWeight: '700', marginBottom: '10px', fontSize: '16px' }}>Proposal Terms: Henderson Design Group Warranty Terms and Conditions</div>
                  <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
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
                    <img src="/images/HDG-Logo.png" alt="Henderson Design Group" style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
                  </div>
                  <div style={{ color: '#000000', fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Proposal</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name}</p>
                      {clientInfo.street && <p style={{ margin: 0 }}>{clientInfo.street}{clientInfo.unitNumber ? ', #' + clientInfo.unitNumber : ''}</p>}
                      {clientInfo.cityLine && <p style={{ margin: 0 }}>{clientInfo.cityLine}</p>}
                      {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.7' }}>
                      <p style={{ margin: 0 }}><strong>Proposal #:</strong> {dpn}</p>
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
              <div className="no-print" style={{ height: '20px', width: '8.5in', margin: '0 auto', background: '#b8b8b8' }} />
            </>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showVersionModal && (
        <VersionModal
          orderId={orderId}
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          onSelectVersion={v => { window.location.href = '/admin/proposal/' + orderId + '/' + v; }}
        />
      )}

      {showNewVersionModal && (
        <NewVersionModal
          onClose={() => setShowNewVersionModal(false)}
          onSave={handleSaveNewVersion}
          saving={saving}
        />
      )}

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
                <button onClick={doPrint} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2"><Printer className="w-4 h-4" /> Continue to Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">{confirmModal.title}</h3>
              <button onClick={() => setConfirmModal(null)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">{confirmModal.message}</p>
              <div className="flex justify-end gap-3 pt-2">
                {confirmModal.infoOnly
                  ? <button onClick={() => setConfirmModal(null)} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">OK</button>
                  : <>
                      <button onClick={() => setConfirmModal(null)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                      <button onClick={() => { setConfirmModal(null); doStatusUpdate(confirmModal.newStatus); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Ya, Approve</button>
                    </>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalEditor;