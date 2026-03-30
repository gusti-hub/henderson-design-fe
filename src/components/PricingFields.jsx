// components/PricingFields.jsx
// ✅ Layout aligned with ProductConfiguration screenshot
//    Net Cost is bidirectional (direct input or computed from MSRP × discount)

import React, { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

const UNIT_OPTIONS = [
  'Each', 'Set', 'Pair', 'Box', 'Case', 'Roll',
  'Yard', 'Foot', 'Meter', 'Square Foot', 'Linear Foot',
];

// ── Decimal Input ──
const DecimalInput = ({ value, onChange, disabled, placeholder = '0.00', className = '' }) => {
  const displayValue =
    value === 0 || value === '0' || value === undefined || value === null ? '' : value;

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    if (raw === '.') { onChange(raw); return; }
    let cleaned = raw;
    if (/^0\d/.test(cleaned) && !cleaned.startsWith('0.')) cleaned = cleaned.replace(/^0+/, '');
    if (/^\d*\.?\d{0,4}$/.test(cleaned)) onChange(cleaned);
  };

  const handleBlur = () => {
    if (value === '' || value === '.' || value === undefined || value === null) onChange(0);
    else { const n = parseFloat(value); if (!isNaN(n)) onChange(n); }
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

const PricingFields = ({ product, index, onUpdate, disabled = false }) => {
  const opts = product.selectedOptions || {};

  const num = (v) => parseFloat(v) || 0;
  const fmt = (v) => num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Core values ──
  const msrp          = num(opts.msrp);
  const discountPct   = num(opts.discountPercent);
  const quantity      = num(product.quantity) || 1;
  const noNetPurchase = opts.noNetPurchaseCost || false;

  const computedNetCost = msrp - (msrp * discountPct / 100);
  const netCost = noNetPurchase
    ? 0
    : (opts.netCostOverride !== undefined && opts.netCostOverride !== null
        ? num(opts.netCostOverride)
        : computedNetCost);

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
  const salesTaxRate      = num(opts.salesTaxRate) || 8.75;

  let taxableAmount = 0;
  if (taxCost)           taxableAmount += netCost * quantity;
  if (taxMarkup)         taxableAmount += netCost * quantity * (markupPct / 100);
  if (taxShippingCost)   taxableAmount += shippingCost;
  if (taxShippingMarkup) taxableAmount += shippingCost * (shippingMarkupPct / 100);
  if (taxOtherCost)      taxableAmount += otherCost;
  if (taxOtherMarkup)    taxableAmount += otherCost * (otherMarkupPct / 100);

  const totalSalesTax    = taxableAmount * (salesTaxRate / 100);
  const totalClientPrice = clientSubtotal + totalSalesTax;

  // ── Sync unitPrice / finalPrice back to parent ──
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

  const handleMsrpChange     = (v) => { upd('msrp', v); upd('netCostOverride', null); };
  const handleDiscountChange = (v) => { upd('discountPercent', v); upd('netCostOverride', null); };
  const handleNetCostChange  = (v) => {
    const newNetCost = parseFloat(v) || 0;
    upd('netCostOverride', newNetCost === 0 ? null : newNetCost);
    const divisor = 1 - (discountPct / 100);
    upd('msrp', Math.round((divisor !== 0 ? newNetCost / divisor : newNetCost) * 100) / 100);
  };

  // ── Shared styles ──
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

      {/* ── Row 1: Units + Qty | Qty mirror + Sales Tax Rate | — ── */}
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
              value={opts.salesTaxRate ?? 8.75}
              onChange={(v) => upd('salesTaxRate', v)}
              disabled={disabled}
              placeholder="8.75"
              className={inp}
            />
          </div>
        </div>
        <div className="px-5 py-4" />
      </div>

      {/* No net purchase cost */}
      <div className="grid grid-cols-[1fr_1fr_140px] bg-white border-b border-gray-100">
        <div className="px-5 py-3 border-r border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noNetPurchase}
              onChange={(e) => { upd('noNetPurchaseCost', e.target.checked); if (e.target.checked) upd('netCostOverride', null); }}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
            />
            <span className="text-sm text-gray-700">No net purchase cost</span>
          </label>
        </div>
        <div className="px-5 py-3 border-r border-gray-200" />
        <div className="px-5 py-3" />
      </div>

      {/* ── Row 2: MSRP / Discount / Net Cost | Markup / Product Subtotal | Cost + Markup ── */}
      <div className="grid grid-cols-[1fr_1fr_140px] border-b border-gray-100 bg-white">
        <div className="px-5 py-4 border-r border-gray-200 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">MSRP</label>
              <DecimalInput
                value={opts.msrp}
                onChange={handleMsrpChange}
                disabled={disabled || noNetPurchase}
                className={inp}
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                Discount (%)
                <Info className="w-3 h-3 text-blue-400" />
              </label>
              <DecimalInput
                value={opts.discountPercent}
                onChange={handleDiscountChange}
                disabled={disabled || noNetPurchase}
                placeholder="0"
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Net Cost</label>
            <DecimalInput
              value={noNetPurchase ? 0 : netCost}
              onChange={handleNetCostChange}
              disabled={disabled || noNetPurchase}
              className={`${inp} ${!disabled && !noNetPurchase ? 'bg-blue-50 border-blue-200' : ''}`}
            />
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

      {/* ── Row 3: Discount Taken + Shipping Cost | Shipping Markup + Subtotal | Cost + Markup ── */}
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

      {/* ── Row 4: Other Cost | Other Markup + Subtotal | Cost + Markup ── */}
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