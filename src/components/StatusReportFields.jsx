// components/StatusReportFields.jsx

import React from 'react';

const STATUS_CATEGORIES = [
  'Items to be delivered during the week of installation',
  'Items shipping to Resort',
  'Items currently in transit',
  'Deliveries to Freight Forwarder',
  'Items Delivered',
  'Pending Delivery',
  'Uncategorized',
];

const SHIPPING_CARRIERS = [
  'UPS', 'FedEx', 'USPS', 'DHL', 'ABF Freight',
  'XPO Logistics', 'R+L Carriers', 'Estes Express',
  'Old Dominion', 'Saia', 'YRC Freight', 'Other'
];

const ROOM_OPTIONS = [
  'COURTYARD', 'EXTERIOR ENTRY', 'INTERIOR ENTRY', 'FOYER', 'KITCHEN',
  'PANTRY', 'BREAKFAST NOOK', 'DINING ROOM', 'LIVING ROOM', 'GREAT ROOM',
  'FAMILY ROOM', 'DEN', 'WET BAR', 'MEDIA ROOM', 'HALLWAY 1', 'HALLWAY 2',
  'MAIN LANAI', 'BBQ AREA', 'POOL LANAI', 'POWDER ROOM', 'POOL AREA',
  'POOL BATH', 'PAVILLION', 'GYM', 'OFFICE 1', 'OFFICE 2', 'WINE ROOM',
  'REC ROOM', 'GARAGE', 'PRIMARY BEDROOM', 'PRIMARY BATHROOM', 'PRIMARY CLOSET',
  'PRIMARY BEDROOM LANAI', 'BEDROOM 2', 'BATHROOM 2', 'BEDROOM 2 CLOSET',
  'BEDROOM 2 LANAI', 'BEDROOM 3', 'BATHROOM 3', 'BEDROOM 3 CLOSET',
  'BEDROOM 3 LANAI', 'BEDROOM 4', 'BATHROOM 4', 'BEDROOM 4 CLOSET',
  'BEDROOM 4 LANAI', 'SITTING ROOM',
];

const StatusReportFields = ({ product, index, onUpdate, disabled = false }) => {
  const opts = product.selectedOptions || {};
  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  const inputCls = `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
    focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]
    disabled:bg-gray-100 disabled:cursor-not-allowed`;

  return (
    <div className="space-y-4">

      {/* Order Date — full width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Date</label>
        <input
          type="date"
          value={opts.orderDate || ''}
          onChange={(e) => upd('orderDate', e.target.value)}
          disabled={disabled}
          className={inputCls}
        />
      </div>

      {/* Expected Ship Date, Expected Arrival Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Ship Date</label>
          <input
            type="date"
            value={opts.expectedShipDate || ''}
            onChange={(e) => upd('expectedShipDate', e.target.value)}
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Arrival Date</label>
          <input
            type="date"
            value={opts.expectedArrivalDate || ''}
            onChange={(e) => upd('expectedArrivalDate', e.target.value)}
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>

      {/* Date Received, Date Inspected */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Received</label>
          <input
            type="date"
            value={opts.dateReceived || ''}
            onChange={(e) => upd('dateReceived', e.target.value)}
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Inspected</label>
          <input
            type="date"
            value={opts.dateInspected || ''}
            onChange={(e) => upd('dateInspected', e.target.value)}
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>

      {/* Next Step (text), Next Step Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Step</label>
          <input
            type="text"
            value={opts.nextStep || ''}
            onChange={(e) => upd('nextStep', e.target.value)}
            disabled={disabled}
            className={inputCls}
            placeholder="Enter Next Step"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Step Date</label>
          <input
            type="date"
            value={opts.nextStepDate || ''}
            onChange={(e) => upd('nextStepDate', e.target.value)}
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>

      {/* Shipping Carrier (dropdown left), Notes (textarea right — spans 2 rows) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Shipping Carrier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Carrier</label>
            <select
              value={opts.shippingCarrier || ''}
              onChange={(e) => upd('shippingCarrier', e.target.value)}
              disabled={disabled}
              className={`${inputCls} bg-white`}
            >
              <option value="">Select...</option>
              {SHIPPING_CARRIERS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
            <input
              type="text"
              value={opts.trackingInfo || ''}
              onChange={(e) => upd('trackingInfo', e.target.value)}
              disabled={disabled}
              className={inputCls}
              placeholder="Enter Tracking Number"
            />
          </div>

          {/* Warehouse Receiving Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse Receiving Number</label>
            <input
              type="text"
              value={opts.warehouseReceivingNumber || ''}
              onChange={(e) => upd('warehouseReceivingNumber', e.target.value)}
              disabled={disabled}
              className={inputCls}
              placeholder="Enter Warehouse Receiving Number"
            />
          </div>
        </div>

        {/* Notes — tall textarea on right */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            value={opts.notes || ''}
            onChange={(e) => upd('notes', e.target.value)}
            disabled={disabled}
            className={`${inputCls} resize-y`}
            rows={9}
            placeholder="Enter Notes"
          />
        </div>
      </div>

      {/* Status Category, Room — optional meta fields */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status Report Grouping</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Category</label>
            <select
              value={opts.statusCategory || ''}
              onChange={(e) => upd('statusCategory', e.target.value)}
              disabled={disabled}
              className={`${inputCls} bg-white`}
            >
              <option value="">Select category...</option>
              {STATUS_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Proposal Number</label>
            <input
              type="text"
              value={opts.proposalNumber || ''}
              onChange={(e) => upd('proposalNumber', e.target.value)}
              disabled={disabled}
              className={inputCls}
              placeholder="Proposal reference #"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatusReportFields;