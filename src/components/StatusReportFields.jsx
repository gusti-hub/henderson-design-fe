import React from 'react';
import { FileText } from 'lucide-react';

const STATUS_CATEGORIES = [
  'Items to be delivered during the week of installation',
  'Items shipping to Resort',
  'Items currently in transit',
  'Deliveries to Freight Forwarder',
  'Items Delivered',
  'Pending Delivery',
];

const ROOM_OPTIONS = [
  'COURTYARD',
  'EXTERIOR ENTRY',
  'INTERIOR ENTRY',
  'FOYER',
  'KITCHEN',
  'PANTRY',
  'BREAKFAST NOOK',
  'DINING ROOM',
  'LIVING ROOM',
  'GREAT ROOM',
  'FAMILY ROOM',
  'DEN',
  'WET BAR',
  'MEDIA ROOM',
  'HALLWAY 1',
  'HALLWAY 2',
  'MAIN LANAI',
  'BBQ AREA',
  'POOL LANAI',
  'POWDER ROOM',
  'POOL AREA',
  'POOL BATH',
  'PAVILLION',
  'GYM',
  'OFFICE 1',
  'OFFICE 2',
  'WINE ROOM',
  'REC ROOM',
  'GARAGE',
  'PRIMARY BEDROOM',
  'PRIMARY BATHROOM',
  'PRIMARY CLOSET',
  'PRIMARY BEDROOM LANAI',
  'BEDROOM 2',
  'BATHROOM 2',
  'BEDROOM 2 CLOSET',
  'BEDROOM 2 LANAI',
  'BEDROOM 3',
  'BATHROOM 3',
  'BEDROOM 3 CLOSET',
  'BEDROOM 3 LANAI',
  'BEDROOM 4',
  'BATHROOM 4',
  'BEDROOM 4 CLOSET',
  'BEDROOM 4 LANAI',
  'SITTING ROOM',
];

const StatusReportFields = ({ product, index, onUpdate, disabled = false }) => {
  return (
    <div className="border-t-2 border-gray-200 pt-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-teal-600" />
        Status Report Information
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Room */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room / Location
          </label>
          <select
            value={product.selectedOptions?.room || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.room', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 bg-white"
          >
            <option value="">-- Select Room --</option>
            {ROOM_OPTIONS.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        {/* Status Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Category
          </label>
          <select
            value={product.selectedOptions?.statusCategory || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.statusCategory', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 bg-white"
          >
            <option value="">-- Select Category --</option>
            {STATUS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Proposal Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Number
          </label>
          <input
            type="text"
            value={product.selectedOptions?.proposalNumber || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.proposalNumber', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
            placeholder="e.g. 49770"
          />
        </div>

        {/* Ship To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ship To
          </label>
          <input
            type="text"
            value={product.selectedOptions?.shipTo || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.shipTo', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
            placeholder="e.g. Timbers - Laola Nani 2002"
          />
        </div>

        {/* Order Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Date
          </label>
          <input
            type="date"
            value={product.selectedOptions?.orderDate || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.orderDate', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
          />
        </div>

        {/* Expected Ship Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Ship Date
          </label>
          <input
            type="date"
            value={product.selectedOptions?.expectedShipDate || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.expectedShipDate', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
          />
        </div>

        {/* Date Received */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Received
          </label>
          <input
            type="date"
            value={product.selectedOptions?.dateReceived || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.dateReceived', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
          />
        </div>

        {/* Estimated Delivery Date (client-facing) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Delivery Date (to residence)
          </label>
          <input
            type="text"
            value={product.selectedOptions?.estimatedDeliveryDate || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.estimatedDeliveryDate', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
            placeholder="e.g. Will be delivered the week of 2/23/26"
          />
        </div>

        {/* Shipping Carrier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Carrier
          </label>
          <input
            type="text"
            value={product.selectedOptions?.shippingCarrier || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.shippingCarrier', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
            placeholder="e.g. UPS, FedEx, USPS"
          />
        </div>

        {/* Expediting / Order Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expediting / Order Status
          </label>
          <input
            type="text"
            value={product.selectedOptions?.orderStatus || ''}
            onChange={(e) => onUpdate(index, 'selectedOptions.orderStatus', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
            placeholder="e.g. order in process, Pending reselection, Order ready to be delivered"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <p className="text-xs text-teal-800">
          <strong>Status Report Fields:</strong> These fields populate both the Client Facing and
          Internal Status Report Excel sheets. The <em>Status Category</em> determines which
          section the product appears under in the report.
        </p>
      </div>
    </div>
  );
};

export default StatusReportFields;