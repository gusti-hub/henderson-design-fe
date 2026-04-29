// components/PricingFields.jsx
// ✅ PATCHED:
//    - MSRP dan Net Cost sekarang INDEPENDENT — tidak saling back-calculate
//      MSRP = selling/list price (untuk referensi & proposal client)
//      Net Cost = actual purchase price dari vendor (untuk kalkulasi profit)
//    - Discount % tetap ada sebagai helper opsional:
//      jika diisi, Net Cost akan dihitung otomatis dari MSRP × (1 - discount%)
//      tapi Net Cost bisa juga diisi langsung tanpa ubah MSRP

import React, { useEffect, useRef } from 'react';
import { Info, Tag } from 'lucide-react';

const UNIT_OPTIONS = [
  'Each', 'Set', 'Pair', 'Box', 'Case', 'Roll',
  'Yard', 'Foot', 'Meter', 'Square Foot', 'Linear Foot',
];

// ── Decimal Input ──────────────────────────────────────────────────────────
const DecimalInput = ({ value, onChange, disabled, placeholder = '0.00', className = '' }) => {
  const displayValue =
    value === 0 || value === '0' || value === undefined || value === null ? '' : value;

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    if (raw === '.') { onChange(raw); return; }
    let cleaned = raw;
    if (/^0\d/.test(cleaned) && !cleaned.startsWith('0.')) cleaned = cleaned.replace(/^0+/, '');
    if (/^\d*\.?\d{0,2}$/.test(cleaned)) onChange(cleaned);
  };

  const handleBlur = () => {
    if (value === '' || value === '.' || value === undefined || value === null) onChange(0);
    else { const n = parseFloat(value); if (!isNaN(n)) onChange(Math.round(n * 100) / 100); }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const PricingFields = ({ product, index, onUpdate, disabled = false }) => {
  const opts = product.selectedOptions || {};

  const num = (v) => parseFloat(v) || 0;
  const fmt = (v) => num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Core values ────────────────────────────────────────────────────────
  const msrp          = num(opts.msrp);
  const discountPct   = num(opts.discountPercent);
  const quantity      = num(product.quantity) || 1;
  const noNetPurchase = opts.noNetPurchaseCost || false;

  // ✅ Net Cost sekarang INDEPENDENT dari MSRP
  // netCostOverride = nilai yang diketik langsung di field Net Cost
  // Jika tidak ada override, fallback ke MSRP × (1 - discount%) sebagai helper
  const computedFromDiscount = msrp > 0 ? msrp - (msrp * discountPct / 100) : 0;
  const netCost = noNetPurchase
    ? 0
    : (opts.netCostOverride !== undefined && opts.netCostOverride !== null
        ? num(opts.netCostOverride)
        : computedFromDiscount);

  const shippingCost      = num(opts.shippingCost);
  const otherCost         = num(opts.otherCost);
  const totalPurchaseCost = (netCost * quantity) + shippingCost + otherCost;

  const markupPct         = num(opts.markupPercent);
  const shippingMarkupPct = num(opts.shippingMarkupPercent);
  const otherMarkupPct    = num(opts.otherMarkupPercent);

  const productSubtotal  = netCost * quantity * (1 + markupPct / 100);
  const shippingSubtotal = shippingCost * (1 + shippingMarkupPct / 100);
  const otherSubtotal    = otherCost * (1 + otherMarkupPct / 100);
  const clientSubtotal   = productSubtotal + shippingSubtotal + otherSubtotal;

  const taxCost           = opts.taxableCost !== false;
  const taxMarkup         = opts.taxableMarkup !== false;
  const taxShippingCost   = opts.taxableShippingCost !== false;
  const taxShippingMarkup = opts.taxableShippingMarkup !== false;
  const taxOtherCost      = opts.taxableOtherCost !== false;
  const taxOtherMarkup    = opts.taxableOtherMarkup !== false;
  const salesTaxRate      = num(opts.salesTaxRate) || 4.5;

  let taxableAmount = 0;
  if (taxCost)           taxableAmount += netCost * quantity;
  if (taxMarkup)         taxableAmount += netCost * quantity * (markupPct / 100);
  if (taxShippingCost)   taxableAmount += shippingCost;
  if (taxShippingMarkup) taxableAmount += shippingCost * (shippingMarkupPct / 100);
  if (taxOtherCost)      taxableAmount += otherCost;
  if (taxOtherMarkup)    taxableAmount += otherCost * (otherMarkupPct / 100);

  const totalSalesTax    = taxableAmount * (salesTaxRate / 100);
  const totalClientPrice = clientSubtotal + totalSalesTax;

  // ── Sync unitPrice / finalPrice back to parent ──────────────────────────
  const prevTotalRef = useRef(null);
  useEffect(() => {
    const rounded = Math.round(totalClientPrice * 100) / 100;
    if (prevTotalRef.current === rounded) return;
    prevTotalRef.current = rounded;
    const newUnitPrice = quantity > 0 ? rounded / quantity : rounded;
    const roundedUnit  = Math.round(newUnitPrice * 100) / 100;
    if (
      Math.abs(num(product.unitPrice)  - roundedUnit) > 0.01 ||
      Math.abs(num(product.finalPrice) - rounded)     > 0.01
    ) {
      onUpdate(index, 'unitPrice',  roundedUnit);
      onUpdate(index, 'finalPrice', rounded);
    }
  }, [totalClientPrice, quantity]);

  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  // ── MSRP handler — INDEPENDENT, tidak reset netCostOverride ───────────
  // ✅ PATCH: MSRP bisa diubah bebas tanpa mempengaruhi Net Cost
  // Discount % tetap dihitung relatif ke MSRP baru sebagai helper visual
  const handleMsrpChange = (v) => {
    upd('msrp', v);
    // Tidak reset netCostOverride — Net Cost tetap seperti yang diset
  };

  // ── Discount % handler — hanya update computed helper, tidak override Net Cost
  // Jika user sudah punya netCostOverride, discount % hanya untuk display
  // Jika belum ada override, discount % akan compute Net Cost via computedFromDiscount
  const handleDiscountChange = (v) => {
    upd('discountPercent', v);
    // Jika ada netCostOverride, jangan reset — user sudah set Net Cost manual
    // Jika belum ada override, computedFromDiscount akan update otomatis via render
  };

  // ── Net Cost handler — set netCostOverride, INDEPENDENT dari MSRP ────
  // ✅ PATCH: mengubah Net Cost tidak back-calculate MSRP
  const handleNetCostChange = (v) => {
    const newNetCost = parseFloat(v) || 0;
    // Simpan sebagai override — ini nilai aktual purchase price dari vendor
    upd('netCostOverride', newNetCost === 0 ? null : newNetCost);
    // ✅ TIDAK mengubah MSRP — keduanya independent
  };

  // ── Net Cost input local state ─────────────────────────────────────────
  const [netCostDisplay, setNetCostDisplay] = React.useState('');
  const [netCostFocused, setNetCostFocused] = React.useState(false);

  // ── Detect if msrp was pre-filled from catalog (library product) ────────
  const isFromLibrary = product.sourceType === 'library';

  // ── Shared styles ───────────────────────────────────────────────────────
  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed';
  const ro  = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800';

  // Checkbox helper
  const Chk = ({ checked, onChange: handleChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670] disabled:cursor-not-allowed"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">


      {/* ── Catalog price banner (library products only) ── */}
      {isFromLibrary && msrp > 0 && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Catalog price: ${fmt(msrp)}</strong> — pre-filled as MSRP.
            Set Net Cost separately as your actual purchase price from vendor.
          </p>
        </div>
      )}

      {/* ── Column Headers ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] bg-[#1e2d3d]">
        <div className="py-3 px-5 text-white font-bold text-xs tracking-widest uppercase text-center border-r border-white/20">
          PURCHASE COST
        </div>
        <div className="py-3 px-5 text-white font-bold text-xs tracking-widest uppercase text-center border-r border-white/20">
          SELLING COST
        </div>
        <div className="py-3 px-5 text-white font-bold text-xs tracking-widest uppercase text-center">
          TAXABLE
        </div>
      </div>

      {/* ── Row 1: Units + Qty | Qty mirror + Sales Tax Rate ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] border-b border-gray-100 bg-gray-50">
        <div className="px-5 py-4 border-r border-gray-200 flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Units</label>
            <select
              value={opts.units || 'Each'}
              onChange={(e) => upd('units', e.target.value)}
              disabled={disabled}
              className={`${inp} bg-white`}
            >
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={product.quantity || 1}
              onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
              disabled={disabled}
              className={inp}
            />
          </div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200 flex gap-3 items-end">
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
            <input type="number" value={quantity} disabled className={`${inp} bg-gray-100`} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Sales Tax Rate %</label>
            <DecimalInput
              value={opts.salesTaxRate ?? 4.5}
              onChange={(v) => upd('salesTaxRate', v)}
              disabled={disabled}
              placeholder="4.5"
              className={inp}
            />
          </div>
        </div>
        <div className="px-5 py-4" />
      </div>

      {/* ── No net purchase cost ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] bg-white border-b border-gray-100">
        <div className="px-5 py-3 border-r border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noNetPurchase}
              onChange={(e) => {
                upd('noNetPurchaseCost', e.target.checked);
                if (e.target.checked) upd('netCostOverride', null);
              }}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
            />
            <span className="text-sm text-gray-700">No net purchase cost</span>
          </label>
        </div>
        <div className="px-5 py-3 border-r border-gray-200" />
        <div className="px-5 py-3" />
      </div>

      {/* ── Row 2: MSRP / Discount / Net Cost | Markup / Product Subtotal | Taxable ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] border-b border-gray-100 bg-white">
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">

          {/* ── MSRP — independent selling/list price ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              MSRP / List Price
              {isFromLibrary && msrp > 0 && (
                <span className="ml-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                  from catalog
                </span>
              )}
              <span className="ml-1.5 text-[10px] text-blue-500 font-normal">(selling ref)</span>
            </label>
            <DecimalInput
              value={opts.msrp}
              onChange={handleMsrpChange}
              disabled={disabled || noNetPurchase}
              className={`${inp} ${isFromLibrary && msrp > 0 && !disabled ? 'border-amber-300 bg-amber-50/30' : ''}`}
            />
          </div>

          {/* ── Discount % — helper opsional untuk compute Net Cost ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              Discount (%) — optional helper
              <Info className="w-3 h-3 text-blue-400" />
            </label>
            <DecimalInput
              value={opts.discountPercent}
              onChange={handleDiscountChange}
              disabled={disabled || noNetPurchase}
              placeholder="0"
              className={inp}
            />
            {discountPct > 0 && !noNetPurchase && opts.netCostOverride === null && (
              <p className="text-[10px] text-gray-400 mt-1">
                Computed Net Cost: ${fmt(computedFromDiscount)} (MSRP × {100 - discountPct}%)
              </p>
            )}
          </div>

          {/* ── Net Cost — independent purchase price from vendor ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              Net Cost
              <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded ml-1">
                purchase price
              </span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={
                netCostFocused
                  ? netCostDisplay
                  : noNetPurchase ? '' : (netCost === 0 ? '' : netCost)
              }
              onFocus={() => {
                setNetCostFocused(true);
                setNetCostDisplay(noNetPurchase ? '' : (netCost === 0 ? '' : String(netCost)));
              }}
              onChange={(e) => {
                const raw = e.target.value;
                setNetCostDisplay(raw);
                if (raw === '' || raw === '.') return;
                if (/^\d*\.?\d{0,2}$/.test(raw) && !raw.endsWith('.')) {
                  handleNetCostChange(raw);
                }
              }}
              onBlur={() => {
                setNetCostFocused(false);
                const val = netCostDisplay;
                if (val === '' || val === '.') handleNetCostChange('0');
                else {
                  const rounded = String(Math.round(parseFloat(val) * 100) / 100);
                  handleNetCostChange(rounded);
                }
              }}
              disabled={disabled || noNetPurchase}
              placeholder="0.00"
              className={`${inp} ${!disabled && !noNetPurchase ? 'bg-green-50 border-green-200' : ''}`}
            />
            {opts.netCostOverride !== null && opts.netCostOverride !== undefined && !noNetPurchase && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-green-600 font-medium">
                  ✓ Manual override active
                </p>
                <button
                  type="button"
                  onClick={() => upd('netCostOverride', null)}
                  disabled={disabled}
                  className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                >
                  Reset to discount
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Markup %</label>
            <DecimalInput
              value={opts.markupPercent ?? 50}
              onChange={(v) => upd('markupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Product Subtotal</label>
            <div className={ro}>{fmt(productSubtotal)}</div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Chk checked={taxCost}   onChange={(v) => upd('taxableCost', v)}   label="Cost" />
          <Chk checked={taxMarkup} onChange={(v) => upd('taxableMarkup', v)} label="Markup" />
        </div>
      </div>

      {/* ── Row 3: Discount Taken + Shipping Cost | Markup + Subtotal | Taxable ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] border-b border-gray-100 bg-gray-50">
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              Discount Taken
              <Info className="w-3 h-3 text-blue-400" />
            </label>
            <input
              type="text"
              value={opts.discountTaken || ''}
              onChange={(e) => upd('discountTaken', e.target.value)}
              disabled={disabled}
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Shipping Cost</label>
            <DecimalInput
              value={opts.shippingCost}
              onChange={(v) => upd('shippingCost', v)}
              disabled={disabled}
              className={inp}
            />
          </div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Markup %</label>
            <DecimalInput
              value={opts.shippingMarkupPercent ?? 50}
              onChange={(v) => upd('shippingMarkupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Shipping Subtotal</label>
            <div className={ro}>{fmt(shippingSubtotal)}</div>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <Chk checked={taxShippingCost}   onChange={(v) => upd('taxableShippingCost', v)}   label="Cost" />
          <Chk checked={taxShippingMarkup} onChange={(v) => upd('taxableShippingMarkup', v)} label="Markup" />
        </div>
      </div>

      {/* ── Row 4: Other Cost | Markup + Subtotal | Taxable ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] border-b border-gray-100 bg-white">
        <div className="px-5 py-4 border-r border-gray-200">
          <label className="block text-xs font-medium text-gray-500 mb-1">Other Cost</label>
          <DecimalInput
            value={opts.otherCost}
            onChange={(v) => upd('otherCost', v)}
            disabled={disabled}
            className={inp}
          />
        </div>
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Markup %</label>
            <DecimalInput
              value={opts.otherMarkupPercent ?? 50}
              onChange={(v) => upd('otherMarkupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Other Cost Subtotal</label>
            <div className={ro}>{fmt(otherSubtotal)}</div>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <Chk checked={taxOtherCost}   onChange={(v) => upd('taxableOtherCost', v)}   label="Cost" />
          <Chk checked={taxOtherMarkup} onChange={(v) => upd('taxableOtherMarkup', v)} label="Markup" />
        </div>
      </div>

      {/* ── Row 5: Totals ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] bg-gray-50">
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Total Purchase Cost</label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
              {fmt(totalPurchaseCost)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vendor Deposit Requested (%)</label>
            <DecimalInput
              value={opts.vendorDepositPercent}
              onChange={(v) => upd('vendorDepositPercent', v)}
              disabled={disabled}
              className={inp}
            />
          </div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Deposit (%)</label>
            <DecimalInput
              value={opts.depositPercent ?? 90}
              onChange={(v) => upd('depositPercent', v)}
              disabled={disabled}
              placeholder="90"
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client Subtotal</label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
              {fmt(clientSubtotal)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Total Sales Tax</label>
            <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700">
              {fmt(totalSalesTax)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#005670] mb-1">Total Client Price</label>
            <div className="w-full px-3 py-3 bg-[#005670] text-white rounded-lg text-lg font-bold">
              ${fmt(totalClientPrice)}
            </div>
          </div>
        </div>
        <div className="px-5 py-4" />
      </div>

    </div>
  );
};

export default PricingFields;