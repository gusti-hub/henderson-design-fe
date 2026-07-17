// components/StatusReportFields.jsx
// ✅ SARA PATCH: 10 status category baru + autocomplete dropdown
// ✅ PATCH: proposalNumber read-only

import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const STATUS_CATEGORIES = [
  // Original
  'Items to be delivered during the week of installation',
  'Items shipping to Resort',
  'Items currently in transit',
  'Deliveries to Freight Forwarder',
  'Items Delivered',
  'Pending Delivery',
  'Uncategorized',
  // ✅ SARA: 10 new
  'Unapproved',
  'Order sent to the vendor',
  'Order acknowledged by the vendor',
  'Purchased',
  'In production',
  'In transit',
  'At the freight forwarder',
  'At site',
  'Completed',
  'Order returned/damaged',
];

const SHIPPING_CARRIERS = [
  'UPS', 'FedEx', 'USPS', 'DHL', 'ABF Freight',
  'XPO Logistics', 'R+L Carriers', 'Estes Express',
  'Old Dominion', 'Saia', 'YRC Freight', 'Other'
];

// ── Autocomplete Status Category Field ───────────────────────────────────────
const StatusCategoryField = ({ value, onChange, disabled, inputCls }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef      = useRef(null);
  const inputRef          = useRef(null);
  const isTypingRef       = useRef(false);

  useEffect(() => {
    if (!isTypingRef.current) setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onChange(query);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, onChange]);

  const filtered = query.trim()
    ? STATUS_CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : STATUS_CATEGORIES;

  const handleInputChange = (e) => {
    isTypingRef.current = true;
    setQuery(e.target.value);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onChange(query);
        }
        setOpen(false);
      }
    }, 150);
  };

  const handleSelect = (opt) => {
    isTypingRef.current = false;
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  const handleClear = () => {
    isTypingRef.current = false;
    setQuery('');
    onChange('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const isCustom = query.trim() && !STATUS_CATEGORIES.includes(query.trim());

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="Type or select category..."
          className={`${inputCls} pr-8`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && !disabled && (
            <button type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear} className="p-0.5 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onMouseDown={(e) => e.preventDefault()}
            onClick={() => !disabled && setOpen(o => !o)} disabled={disabled}
            className="p-0.5 text-gray-400 hover:text-gray-600">
            <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {isCustom && (
            <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">
                Custom: <span className="font-semibold">"{query}"</span>
              </span>
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(query)}
                className="text-xs text-blue-600 font-semibold hover:text-blue-800 px-2 py-0.5 bg-blue-100 rounded-md">
                Use this ↵
              </button>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No matches — your custom value will be saved
              </div>
            ) : (
              filtered.map(opt => (
                <button key={opt} type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#005670]/5 transition-colors flex items-center justify-between ${
                    opt === value ? 'bg-[#005670]/8 text-[#005670] font-medium' : 'text-gray-700'
                  }`}>
                  <span>{opt}</span>
                  {opt === value && <Check className="w-3.5 h-3.5 text-[#005670] flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StatusReportFields = ({
  product,
  index,
  onUpdate,
  disabled = false,
  orderProposalNumber = null,
  readOnlyFields = [],
}) => {
  const opts = product.selectedOptions || {};
  const upd = (field, value) => {
    if (readOnlyFields.includes(field)) return;
    onUpdate(index, `selectedOptions.${field}`, value);
  };

  const inputCls = `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
    focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]
    disabled:bg-gray-100 disabled:cursor-not-allowed`;

  const displayProposalNumber = orderProposalNumber || opts.proposalNumber || null;

  return (
    <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Date</label>
        <input type="date" value={opts.orderDate || ''}
          onChange={(e) => upd('orderDate', e.target.value)}
          disabled={disabled} className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Revised Order Date</label>
        <input type="date" value={opts.revisedOrderDate || ''}
          onChange={(e) => upd('revisedOrderDate', e.target.value)}
          disabled={disabled} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Ship Date</label>
          <input type="date" value={opts.expectedShipDate || ''}
            onChange={(e) => upd('expectedShipDate', e.target.value)}
            disabled={disabled} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Arrival Date</label>
          <input type="date" value={opts.expectedArrivalDate || ''}
            onChange={(e) => upd('expectedArrivalDate', e.target.value)}
            disabled={disabled} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Received</label>
          <input type="date" value={opts.dateReceived || ''}
            onChange={(e) => upd('dateReceived', e.target.value)}
            disabled={disabled} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Inspected</label>
          <input type="date" value={opts.dateInspected || ''}
            onChange={(e) => upd('dateInspected', e.target.value)}
            disabled={disabled} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Step</label>
          <input type="text" value={opts.nextStep || ''}
            onChange={(e) => upd('nextStep', e.target.value)}
            disabled={disabled} className={inputCls} placeholder="Enter Next Step" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Step Date</label>
          <input type="date" value={opts.nextStepDate || ''}
            onChange={(e) => upd('nextStepDate', e.target.value)}
            disabled={disabled} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Carrier</label>
            <select value={opts.shippingCarrier || ''}
              onChange={(e) => upd('shippingCarrier', e.target.value)}
              disabled={disabled} className={`${inputCls} bg-white`}>
              <option value="">Select...</option>
              {SHIPPING_CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
            <input type="text" value={opts.trackingInfo || ''}
              onChange={(e) => upd('trackingInfo', e.target.value)}
              disabled={disabled} className={inputCls} placeholder="Enter Tracking Number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse Receiving Number</label>
            <input type="text" value={opts.warehouseReceivingNumber || ''}
              onChange={(e) => upd('warehouseReceivingNumber', e.target.value)}
              disabled={disabled} className={inputCls} placeholder="Enter Warehouse Receiving Number" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea value={opts.notes || ''}
            onChange={(e) => upd('notes', e.target.value)}
            disabled={disabled} className={`${inputCls} resize-y`}
            rows={9} placeholder="Enter Notes" />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Status Report Grouping
        </p>
        <div className="grid grid-cols-2 gap-4">

          {/* ✅ SARA: Autocomplete status category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Category</label>
            <StatusCategoryField
              value={opts.statusCategory || ''}
              onChange={(v) => upd('statusCategory', v)}
              disabled={disabled}
              inputCls={inputCls}
            />
          </div>

          {/* Proposal Number — read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proposal Number
              <span className="ml-2 text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                auto-generated
              </span>
            </label>
            <div className={`w-full px-3 py-2 border rounded-lg text-sm flex items-center gap-2
              ${displayProposalNumber
                ? 'bg-[#005670]/5 border-[#005670]/30 text-[#005670] font-semibold font-mono'
                : 'bg-gray-50 border-gray-200 text-gray-400 italic'
              }`}>
              {displayProposalNumber ? (
                <>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {displayProposalNumber}
                </>
              ) : (
                'Generated when proposal is saved'
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatusReportFields;