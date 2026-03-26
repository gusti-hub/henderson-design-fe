import React, { useEffect } from 'react';
import { Info } from 'lucide-react';

const UNIT_OPTIONS = ['Each', 'Set', 'Pair', 'Box', 'Case', 'Roll', 'Yard', 'Foot', 'Meter', 'Square Foot', 'Linear Foot'];

// ── Decimal input: no leading zeros, supports "3.", "0.5", etc. ──
const DecimalInput = ({ value, onChange, disabled, placeholder = '0.00', className = '' }) => {
  const displayValue = value === 0 || value === '0' || value === undefined || value === null ? '' : value;

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    if (raw === '.') { onChange(raw); return; }
    let cleaned = raw;
    if (/^0\d/.test(cleaned) && !cleaned.startsWith('0.')) {
      cleaned = cleaned.replace(/^0+/, '');
    }
    if (/^\d*\.?\d{0,2}$/.test(cleaned)) {
      onChange(cleaned);
    }
  };

  const handleBlur = () => {
    if (value === '' || value === '.' || value === undefined || value === null) {
      onChange(0);
    } else {
      const n = parseFloat(value);
      if (!isNaN(n)) onChange(n);
    }
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

  // ── Derived calculations ──
  const msrp = num(opts.msrp);
  const discountPct = num(opts.discountPercent);
  const quantity = num(product.quantity) || 1;
  const noNetPurchaseCost = opts.noNetPurchaseCost || false;

  const netCost = noNetPurchaseCost ? 0 : msrp - (msrp * discountPct / 100);
  const shippingCost = num(opts.shippingCost);
  const otherCost = num(opts.otherCost);
  const totalPurchaseCost = (netCost * quantity) + shippingCost + otherCost;

  const markupPct = num(opts.markupPercent);
  const shippingMarkupPct = num(opts.shippingMarkupPercent);
  const otherMarkupPct = num(opts.otherMarkupPercent);

  const productSubtotal = netCost * quantity * (1 + markupPct / 100);
  const shippingSubtotal = shippingCost * (1 + shippingMarkupPct / 100);
  const otherSubtotal = otherCost * (1 + otherMarkupPct / 100);

  const taxCost = opts.taxableCost !== false;
  const taxMarkup = opts.taxableMarkup !== false;
  const taxShippingCost = opts.taxableShippingCost !== false;
  const taxShippingMarkup = opts.taxableShippingMarkup !== false;
  const taxOtherCost = opts.taxableOtherCost !== false;
  const taxOtherMarkup = opts.taxableOtherMarkup !== false;

  const salesTaxRate = num(opts.salesTaxRate) || 8.75;

  let taxableAmount = 0;
  if (taxCost) taxableAmount += netCost * quantity;
  if (taxMarkup) taxableAmount += netCost * quantity * (markupPct / 100);
  if (taxShippingCost) taxableAmount += shippingCost;
  if (taxShippingMarkup) taxableAmount += shippingCost * (shippingMarkupPct / 100);
  if (taxOtherCost) taxableAmount += otherCost;
  if (taxOtherMarkup) taxableAmount += otherCost * (otherMarkupPct / 100);

  const clientSubtotal = productSubtotal + shippingSubtotal + otherSubtotal;
  const totalSalesTax = taxableAmount * (salesTaxRate / 100);
  const totalClientPrice = clientSubtotal + totalSalesTax;

  // Sync calculated prices back to parent
  useEffect(() => {
    const newUnitPrice = quantity > 0 ? totalClientPrice / quantity : totalClientPrice;
    const newFinalPrice = totalClientPrice;
    if (
      Math.abs(num(product.unitPrice) - newUnitPrice) > 0.01 ||
      Math.abs(num(product.finalPrice) - newFinalPrice) > 0.01
    ) {
      onUpdate(index, 'unitPrice', Math.round(newUnitPrice * 100) / 100);
      onUpdate(index, 'finalPrice', Math.round(newFinalPrice * 100) / 100);
    }
  }, [totalClientPrice, quantity]);

  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100';
  const readonlyCls = 'px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900';

  return (
    <div className="border-t-2 border-gray-200 pt-6">
      {/* Section Headers */}
      <div className="grid grid-cols-3 gap-0 mb-4 rounded-lg overflow-hidden">
        <div className="bg-[#2c3e50] text-white py-2.5 px-4 text-center font-bold text-sm tracking-wider">
          PURCHASE COST
        </div>
        <div className="bg-[#34495e] text-white py-2.5 px-4 text-center font-bold text-sm tracking-wider">
          SELLING COST
        </div>
        <div className="bg-[#2c3e50] text-white py-2.5 px-4 text-center font-bold text-sm tracking-wider">
          TAXABLE
        </div>
      </div>

      {/* Row 1: Units/Qty + Selling Qty + Sales Tax Rate */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Units</label>
            <select
              value={opts.units || 'Each'}
              onChange={(e) => upd('units', e.target.value)}
              disabled={disabled}
              className={`${inputCls} bg-white`}
            >
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={product.quantity || 1}
              onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input type="number" value={quantity} disabled className={`${inputCls} bg-gray-100 text-gray-700`} />
          </div>
        </div>

        <div className="w-28">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sales Tax Rate</label>
          <DecimalInput
            value={opts.salesTaxRate ?? 8.75}
            onChange={(v) => upd('salesTaxRate', v)}
            disabled={disabled}
            placeholder="8.75"
            className={inputCls}
          />
        </div>
      </div>

      {/* No net purchase cost */}
      <div className="px-4 mb-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noNetPurchaseCost}
            onChange={(e) => upd('noNetPurchaseCost', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]"
          />
          <span className="text-sm text-gray-700">No net purchase cost</span>
        </label>
      </div>

      {/* Row 2: MSRP / Discount / Net Cost + Markup + Taxable */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-white border border-gray-200 rounded-lg mb-3">
        <div>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">MSRP</label>
              <DecimalInput
                value={opts.msrp}
                onChange={(v) => upd('msrp', v)}
                disabled={disabled || noNetPurchaseCost}
                className={inputCls}
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                Discount %
                <Info className="w-3 h-3 text-blue-500" />
              </label>
              <DecimalInput
                value={opts.discountPercent}
                onChange={(v) => upd('discountPercent', v)}
                disabled={disabled || noNetPurchaseCost}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Net Cost</label>
            <DecimalInput
              value={noNetPurchaseCost ? 0 : netCost}
              onChange={(v) => {
                if (noNetPurchaseCost) return;
                const newNetCost = parseFloat(v) || 0;
                const discount = num(opts.discountPercent);
                const divisor = 1 - (discount / 100);
                const newMsrp = divisor !== 0 ? newNetCost / divisor : newNetCost;
                upd('msrp', Math.round(newMsrp * 100) / 100);
              }}
              disabled={disabled || noNetPurchaseCost}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Markup %</label>
            <DecimalInput
              value={opts.markupPercent ?? 50}
              onChange={(v) => upd('markupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Subtotal</label>
            <div className={readonlyCls}>{fmt(productSubtotal)}</div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 pl-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxCost} onChange={(e) => upd('taxableCost', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Cost</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxMarkup} onChange={(e) => upd('taxableMarkup', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Markup</span>
          </label>
        </div>
      </div>

      {/* Row 3: Shipping Cost + Shipping Markup + Taxable */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-3">
        <div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              Discount Taken
              <Info className="w-3 h-3 text-blue-500" />
            </label>
            <input
              type="text"
              value={opts.discountTaken || ''}
              onChange={(e) => upd('discountTaken', e.target.value)}
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Cost</label>
            <DecimalInput
              value={opts.shippingCost}
              onChange={(v) => upd('shippingCost', v)}
              disabled={disabled}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Markup %</label>
            <DecimalInput
              value={opts.shippingMarkupPercent ?? 50}
              onChange={(v) => upd('shippingMarkupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Subtotal</label>
            <div className={readonlyCls}>{fmt(shippingSubtotal)}</div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 pl-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxShippingCost} onChange={(e) => upd('taxableShippingCost', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Cost</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxShippingMarkup} onChange={(e) => upd('taxableShippingMarkup', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Markup</span>
          </label>
        </div>
      </div>

      {/* Row 4: Other Cost + Other Markup + Taxable */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-white border border-gray-200 rounded-lg mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Other Cost</label>
          <DecimalInput
            value={opts.otherCost}
            onChange={(v) => upd('otherCost', v)}
            disabled={disabled}
            className={inputCls}
          />
        </div>

        <div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Markup %</label>
            <DecimalInput
              value={opts.otherMarkupPercent ?? 50}
              onChange={(v) => upd('otherMarkupPercent', v)}
              disabled={disabled}
              placeholder="50"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Other Cost Subtotal</label>
            <div className={readonlyCls}>{fmt(otherSubtotal)}</div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 pl-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxOtherCost} onChange={(e) => upd('taxableOtherCost', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Cost</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxOtherMarkup} onChange={(e) => upd('taxableOtherMarkup', e.target.checked)} disabled={disabled} className="w-4 h-4 rounded border-gray-300 text-[#005670] focus:ring-[#005670]" />
            <span className="text-sm text-gray-700">Markup</span>
          </label>
        </div>
      </div>

      {/* Row 5: Totals */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Purchase Cost</label>
            <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
              {fmt(totalPurchaseCost)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendor Deposit Requested (%)</label>
            <DecimalInput
              value={opts.vendorDepositPercent}
              onChange={(v) => upd('vendorDepositPercent', v)}
              disabled={disabled}
              placeholder=""
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Deposit (%)</label>
            <DecimalInput
              value={opts.depositPercent ?? 90}
              onChange={(v) => upd('depositPercent', v)}
              disabled={disabled}
              placeholder="90"
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Client Subtotal</label>
            <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
              {fmt(clientSubtotal)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Sales Tax</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700">
              {fmt(totalSalesTax)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#005670] mb-1">Total Client Price</label>
            <div className="px-3 py-2.5 bg-[#005670] text-white rounded-lg text-lg font-bold">
              ${fmt(totalClientPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingFields;